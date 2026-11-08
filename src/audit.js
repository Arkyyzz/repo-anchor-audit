import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

const MARKDOWN = /\.(?:md|markdown)$/i;
const DEFAULT_EXCLUDES = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const posix = (value) => value.split(path.sep).join('/');
const blank = (value) => value.replace(/[^\r\n]/g, ' ');
const escaped = (text, at) => {
  let backslashes = 0;
  while (at > 0 && text[--at] === '\\') backslashes++;
  return backslashes % 2 === 1;
};
const normalizeLabel = (value) => value.replace(/\\([\[\]\\])/g, '$1').trim().replace(/\s+/g, ' ').toLowerCase();

// Masking preserves character offsets so diagnostics refer to the original file.
function maskBlocks(markdown) {
  const lines = markdown.split(/(?<=\n)/);
  let fence = null;
  const result = lines.map((line) => {
    const content = line.replace(/\r?\n$/, '');
    if (fence) {
      const close = content.match(/^ {0,3}(`+|~+)\s*$/);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
      return blank(line);
    }
    const open = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
      fence = { char: open[1][0], length: open[1].length };
      return blank(line);
    }
    return line;
  }).join('');
  return result.replace(/<!--[\s\S]*?(?:-->|$)/g, blank);
}

function maskInlineCode(text) {
  let result = '';
  for (let i = 0; i < text.length;) {
    if (text[i] !== '`' || escaped(text, i)) { result += text[i++]; continue; }
    let endRun = i + 1;
    while (text[endRun] === '`') endRun++;
    const marker = text.slice(i, endRun);
    let close = text.indexOf(marker, endRun);
    while (close !== -1 && (text[close - 1] === '`' || text[close + marker.length] === '`')) {
      close = text.indexOf(marker, close + marker.length);
    }
    if (close === -1) { result += marker; i = endRun; continue; }
    result += blank(text.slice(i, close + marker.length));
    i = close + marker.length;
  }
  return result;
}

function slug(text) {
  return text
    .replace(/!?\[([^\[\]]*)\]\([^()]*\)/g, '$1')
    .replace(/<[^<>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/`+/g, '').replace(/\*+/g, '')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2')
    .trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

export function headingIds(markdown) {
  const source = maskBlocks(markdown);
  const lines = source.split(/\r?\n/);
  const ids = new Set();
  const nextSuffix = new Map();
  for (let i = 0; i < lines.length; i++) {
    const atx = lines[i].match(/^ {0,3}#{1,6}(?:\s+(.*?)\s*|\s*)$/);
    let heading;
    if (atx) heading = (atx[1] ?? '').replace(/\s+#+\s*$/, '');
    else if (i + 1 < lines.length && /^ {0,3}(?:=+|-+)\s*$/.test(lines[i + 1]) && /^ {0,3}\S/.test(lines[i])) {
      heading = lines[i].trim();
      i++;
    }
    if (heading === undefined) continue;
    const base = slug(heading);
    let candidate = base;
    let suffix = nextSuffix.get(base) ?? 1;
    if (ids.has(candidate)) {
      do { candidate = `${base}-${suffix++}`; } while (ids.has(candidate));
      nextSuffix.set(base, suffix);
    }
    ids.add(candidate);
  }
  return ids;
}

function delimiters(text) {
  const brackets = new Map();
  const parentheses = new Map();
  const quoteNext = new Map();
  const bracketStack = [];
  const parenStack = [];
  const lastQuote = new Map();
  const escapedAt = new Uint8Array(text.length);
  let backslashes = 0;
  for (let i = 0; i < text.length; i++) {
    escapedAt[i] = backslashes % 2;
    backslashes = text[i] === '\\' ? backslashes + 1 : 0;
    if (escapedAt[i]) continue;
    if (text[i] === '[') bracketStack.push(i);
    else if (text[i] === ']' && bracketStack.length) brackets.set(bracketStack.pop(), i);
    else if (text[i] === '(') parenStack.push(i);
    else if (text[i] === ')' && parenStack.length) parentheses.set(parenStack.pop(), i);
    if (text[i] === '"' || text[i] === "'") {
      if (lastQuote.has(text[i])) quoteNext.set(lastQuote.get(text[i]), i);
      lastQuote.set(text[i], i);
    }
  }
  return { brackets, parentheses, quoteNext, escapedAt };
}

// Return a destination and the offset after its containing closing parenthesis.
function inlineDestination(text, start, indices) {
  let i = start + 1;
  while (/\s/.test(text[i] ?? '') && i < text.length) i++;
  let target = '';
  if (text[i] === '<') {
    const end = text.indexOf('>', i + 1);
    if (end < 0 || /\r|\n/.test(text.slice(i, end))) return null;
    target = text.slice(i + 1, end);
    i = end + 1;
  } else {
    const begin = i;
    for (; i < text.length; i++) {
      if (indices.escapedAt[i]) continue;
      if (text[i] === '(') {
        const close = indices.parentheses.get(i);
        if (close === undefined) return null;
        i = close;
      } else if (text[i] === ')' || /\s/.test(text[i])) break;
    }
    target = text.slice(begin, i);
  }
  while (i < text.length && /\s/.test(text[i])) i++;
  // Optional title must be quoted; parentheses are allowed in Markdown titles.
  if (text[i] === '"' || text[i] === "'" || text[i] === '(') {
    const close = text[i] === '(' ? indices.parentheses.get(i) : indices.quoteNext.get(i);
    if (close === undefined) return null;
    i = close + 1;
    while (i < text.length && /\s/.test(text[i])) i++;
  }
  if (text[i] !== ')') return null;
  return { target, end: i + 1 };
}

export function parseMarkdown(markdown) {
  const blocks = maskBlocks(markdown);
  const definitions = new Map();
  // Reference definitions supported on one line, optionally with a quoted title.
  const withoutDefinitions = blocks.replace(/^ {0,3}\[([^\]\r\n]+)\]:[ \t]*(?:<([^>\r\n]*)>|(\S+?))(?:[ \t]+(?:"[^"\r\n]*"|'[^'\r\n]*'|\([^\r\n]*\)))?[ \t]*\r?$/gm, (whole, label, angle, bare) => {
    const key = normalizeLabel(label);
    if (!definitions.has(key)) definitions.set(key, angle ?? bare);
    return blank(whole);
  });
  const text = maskInlineCode(withoutDefinitions);
  const indices = delimiters(text);
  const lineStarts = [0];
  for (let i = 0; i < markdown.length; i++) if (markdown[i] === '\n') lineStarts.push(i + 1);
  const location = (offset) => {
    let low = 0;
    let high = lineStarts.length;
    while (low + 1 < high) {
      const mid = (low + high) >>> 1;
      if (lineStarts[mid] <= offset) low = mid;
      else high = mid;
    }
    return { line: low + 1, column: offset - lineStarts[low] + 1 };
  };
  const links = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '[' || indices.escapedAt[i]) continue;
    const endLabel = indices.brackets.get(i);
    if (endLabel === undefined) continue;
    let next = endLabel + 1;
    let target;
    let undefinedReference = false;
    if (text[next] === '(') {
      const destination = inlineDestination(text, next, indices);
      if (!destination) continue;
      target = destination.target;
      next = destination.end;
    } else if (text[next] === '[') {
      const close = indices.brackets.get(next);
      if (close === undefined) continue;
      const rawLabel = text.slice(next + 1, close) || text.slice(i + 1, endLabel);
      // CommonMark reference labels are limited to 999 characters. This also
      // bounds work for deeply nested, bracket-heavy prose.
      if (rawLabel.length > 999) continue;
      const key = normalizeLabel(rawLabel);
      target = definitions.get(key);
      undefinedReference = !definitions.has(key);
      if (undefinedReference) target = key;
      next = close + 1;
    } else {
      if (!definitions.size || endLabel - i - 1 > 999) continue;
      const key = normalizeLabel(text.slice(i + 1, endLabel));
      if (!definitions.has(key)) continue;
      target = definitions.get(key);
    }
    links.push({ target, ...location(i), undefinedReference });
    i = next - 1;
  }
  return { links, headings: headingIds(markdown) };
}

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function validateOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Options must be an object.');
  const { exclude = [], maxFileBytes = 1_048_576 } = options;
  if (!Array.isArray(exclude) || exclude.some((item) => typeof item !== 'string' || !item || item.includes('\\') || item.startsWith('/') || item.split('/').includes('..') || item.includes('\0') || path.win32.isAbsolute(item))) {
    throw new TypeError('Each exclusion must be a non-empty relative path prefix using forward slashes, without .. segments.');
  }
  if (!Number.isSafeInteger(maxFileBytes) || maxFileBytes <= 0) throw new TypeError('maxFileBytes must be a positive safe integer.');
  const normalized = exclude.map((item) => path.posix.normalize(item).replace(/\/+$/, ''));
  if (normalized.some((item) => item === '.' || !item)) throw new TypeError('Exclusions must name a file or directory below the root.');
  return { exclude: normalized, maxFileBytes };
}

export async function audit(root, options = {}) {
  if (typeof root !== 'string' || !root) throw new TypeError('Root must be a directory path.');
  const { exclude, maxFileBytes } = validateOptions(options);
  let base;
  try {
    base = await realpath(path.resolve(root));
    if (!(await lstat(base)).isDirectory()) throw new Error();
  } catch { throw new Error('Root must be an existing readable directory.'); }
  const result = { schemaVersion: 1, filesScanned: 0, linksChecked: 0, linksSkipped: 0, diagnostics: [] };
  const add = (code, file, line, column, target, message) => result.diagnostics.push({ code, file, line, column, target, message });
  const relative = (file) => posix(path.relative(base, file)) || '.';
  const documents = new Map();

  async function load(file) {
    if (documents.has(file)) return documents.get(file);
    const promise = (async () => {
      try {
        if ((await lstat(file)).size > maxFileBytes) return { error: 'FILE_TOO_LARGE' };
        const bytes = await readFile(file);
        if (bytes.length > maxFileBytes) return { error: 'FILE_TOO_LARGE' };
        let contents;
        try { contents = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
        catch { return { error: 'FILE_READ_ERROR' }; }
        return parseMarkdown(contents);
      } catch { return { error: 'FILE_READ_ERROR' }; }
    })();
    documents.set(file, promise);
    return promise;
  }

  const files = [];
  async function walk(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); }
    catch {
      add('FILE_READ_ERROR', relative(directory), 1, 1, '', 'Cannot list directory.');
      return;
    }
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      const name = relative(file);
      if (DEFAULT_EXCLUDES.has(entry.name) || exclude.some((prefix) => name === prefix || name.startsWith(`${prefix}/`))) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && MARKDOWN.test(entry.name)) files.push(file);
    }
  }
  await walk(base);

  async function inspectTarget(file) {
    if (!inside(base, file)) return { error: 'OUTSIDE_ROOT' };
    // Check every path component before reading. Symlinks are never followed.
    const segments = path.relative(base, file).split(path.sep).filter(Boolean);
    let current = base;
    let stat = await lstat(base);
    for (const segment of segments) {
      current = path.join(current, segment);
      try { stat = await lstat(current); }
      catch (error) { return { error: error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 'MISSING_FILE' : 'FILE_READ_ERROR' }; }
      if (stat.isSymbolicLink()) return { error: 'OUTSIDE_ROOT' };
    }
    if (!stat.isFile() && !stat.isDirectory()) return { error: 'INVALID_LINK' };
    return { stat };
  }

  for (const file of files) {
    result.filesScanned++;
    const document = await load(file);
    if (document.error) {
      add(document.error, relative(file), 1, 1, '', document.error === 'FILE_TOO_LARGE' ? 'Markdown file exceeds the configured byte limit.' : 'Cannot read Markdown as UTF-8.');
      continue;
    }
    for (const link of document.links) {
      const issue = (code, message) => add(code, relative(file), link.line, link.column, link.target, message);
      if (link.undefinedReference) {
        result.linksChecked++;
        issue('UNDEFINED_REFERENCE', 'Reference link has no matching definition.');
        continue;
      }
      const target = link.target.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, '$1');
      if (/^[a-z]:[\\/]/i.test(target)) {
        result.linksChecked++;
        issue('OUTSIDE_ROOT', 'Absolute filesystem paths are outside the supported repository scope.');
        continue;
      }
      if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//')) { result.linksSkipped++; continue; }
      result.linksChecked++;
      const hash = target.indexOf('#');
      const beforeHash = hash < 0 ? target : target.slice(0, hash);
      const query = beforeHash.indexOf('?');
      let pathname;
      let fragment;
      try {
        pathname = decodeURIComponent(query < 0 ? beforeHash : beforeHash.slice(0, query));
        fragment = hash < 0 ? '' : decodeURIComponent(target.slice(hash + 1));
      } catch { issue('INVALID_LINK', 'Link contains malformed percent encoding.'); continue; }
      if (pathname.includes('\0') || fragment.includes('\0') || pathname.includes('\\')) {
        issue('INVALID_LINK', 'Local links must use forward slashes and contain no null bytes.');
        continue;
      }
      if (path.isAbsolute(pathname) || path.win32.isAbsolute(pathname)) {
        issue('OUTSIDE_ROOT', 'Absolute filesystem paths are outside the supported repository scope.');
        continue;
      }
      const destination = pathname ? path.resolve(path.dirname(file), pathname) : file;
      const inspected = await inspectTarget(destination);
      if (inspected.error) {
        const messages = { OUTSIDE_ROOT: 'Link leaves the root or traverses a symbolic link.', MISSING_FILE: 'Local target does not exist.', FILE_READ_ERROR: 'Cannot inspect local target.', INVALID_LINK: 'Target is not a regular file or directory.' };
        issue(inspected.error, messages[inspected.error]);
        continue;
      }
      if (!fragment || !inspected.stat.isFile() || !MARKDOWN.test(destination)) continue;
      const destinationDocument = await load(destination);
      if (destinationDocument.error) {
        issue(destinationDocument.error, destinationDocument.error === 'FILE_TOO_LARGE' ? 'Anchor target exceeds the configured byte limit.' : 'Cannot read anchor target as UTF-8.');
      } else if (!destinationDocument.headings.has(fragment)) {
        issue('MISSING_ANCHOR', 'Heading anchor does not exist in the Markdown target.');
      }
    }
  }
  result.diagnostics.sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.column - b.column || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  return result;
}
