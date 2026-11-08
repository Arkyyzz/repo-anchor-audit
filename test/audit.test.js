import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { audit } from '../src/index.js';

const project = fileURLToPath(new URL('../', import.meta.url));
const cli = path.join(project, 'bin', 'repo-anchor-audit.js');

async function fixture(t, files = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'repo-anchor-audit-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, contents] of Object.entries(files)) {
    const destination = path.join(root, name);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  return root;
}

function runCli(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8', cwd: project, timeout: 15_000,
  });
}

test('accepts relative document links, local anchors, images and existing directories', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Start\n[guide](docs/guide.md#hello-world)\n[self](#start)\n![logo](assets/logo.svg)\n[folder](docs/)\n',
    'docs/guide.md': '# Hello, World!\n[home](../README.md)\n',
    'assets/logo.svg': '<svg/>',
  });
  const result = await audit(root);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.filesScanned, 2);
  assert.equal(result.linksChecked, 5);
  assert.deepEqual(result.diagnostics, []);
});

test('reports missing files and anchors with source locations and relative paths', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Home\n[missing](docs/no.md)\n[bad anchor](#absent)\n',
  });
  const { diagnostics } = await audit(root);
  assert.equal(diagnostics.length, 2);
  assert.deepEqual(diagnostics.map(({ code, file, line, target }) => ({ code, file, line, target })), [
    { code: 'MISSING_FILE', file: 'README.md', line: 2, target: 'docs/no.md' },
    { code: 'MISSING_ANCHOR', file: 'README.md', line: 3, target: '#absent' },
  ]);
  for (const diagnostic of diagnostics) {
    assert.equal(typeof diagnostic.message, 'string');
    assert.ok(diagnostic.message.length > 0);
    assert.ok(Number.isInteger(diagnostic.column) && diagnostic.column > 0);
    assert.equal(path.isAbsolute(diagnostic.file), false);
  }
});

test('supports percent encoded Unicode paths and heading fragments', async (t) => {
  const root = await fixture(t, {
    'README.md': '[guide](docs/caf%C3%A9%20guide.md#%C3%A9t%C3%A9)\n',
    'docs/café guide.md': '# Été\n',
  });
  assert.deepEqual((await audit(root)).diagnostics, []);
});

test('deduplicates repeated headings using numeric suffixes', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Overview\n# Overview\n# Overview\n[a](#overview)\n[b](#overview-1)\n[c](#overview-2)\n[bad](#overview-3)\n',
  });
  const { diagnostics } = await audit(root);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'MISSING_ANCHOR');
  assert.equal(diagnostics[0].target, '#overview-3');
});

test('does not interpret fenced or inline code as Markdown links or headings', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Home\n`[inline](absent.md)`\n```md\n# Fake\n[fenced](missing.md)\n```\n~~~\n[other](missing-too.md)\n~~~\n[bad](#fake)\n',
  });
  const result = await audit(root);
  assert.equal(result.linksChecked, 1);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'MISSING_ANCHOR');
  assert.equal(result.diagnostics[0].target, '#fake');
});

test('handles CRLF code fences and an unclosed fence at end of file', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Home\r\n~~~md\r\n[code](absent.md)\r\n~~~\r\n[home](#home)\r\n```\r\n[unclosed code](absent-too.md)\r\n',
  });
  const result = await audit(root);
  assert.equal(result.linksChecked, 1);
  assert.deepEqual(result.diagnostics, []);
});

test('supports balanced parentheses, escaped punctuation and link titles', async (t) => {
  const root = await fixture(t, {
    'README.md': '[balanced](docs/guide(v1).md "Guide")\n[escaped](docs/guide\\(v1\\).md)\n[angle](<docs/space guide.md> \'A guide\')\n',
    'docs/guide(v1).md': '# Guide\n',
    'docs/space guide.md': '# Guide\n',
  });
  const result = await audit(root);
  assert.equal(result.linksChecked, 3);
  assert.deepEqual(result.diagnostics, []);
});

test('resolves reference links and reference images independent of definition order', async (t) => {
  const root = await fixture(t, {
    'README.md': '[Read the guide][GUIDE]\n![Logo][logo]\n\n[guide]: docs/guide.md#start\n[logo]: assets/logo.svg\n',
    'docs/guide.md': '# Start\n',
    'assets/logo.svg': '<svg/>',
  });
  const result = await audit(root);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.linksChecked, 2);
});

test('reports unresolved explicit references without treating plain bracketed prose as links', async (t) => {
  const root = await fixture(t, {
    'README.md': '[plain bracketed prose]\n[guide][missing]\n',
  });
  const result = await audit(root);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'UNDEFINED_REFERENCE');
  assert.equal(result.diagnostics[0].line, 2);
});

test('counts external URLs as skipped without attempting a network check', async (t) => {
  const root = await fixture(t, {
    'README.md': '[https](https://example.invalid/missing)\n[http](http://127.0.0.1:1/)\n[email](mailto:person@example.invalid)\n[relative](//example.invalid/a)\n',
  });
  const result = await audit(root);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.linksChecked, 0);
  assert.equal(result.linksSkipped, 4);
});

test('strips local queries and does not inspect anchors in non-Markdown files', async (t) => {
  const root = await fixture(t, {
    'README.md': '[doc](guide.md?view=raw#start)\n[pdf](manual.pdf#page=2)\n',
    'guide.md': '# Start\n',
    'manual.pdf': 'not parsed',
  });
  assert.deepEqual((await audit(root)).diagnostics, []);
});

test('reports malformed percent escapes instead of crashing', async (t) => {
  const root = await fixture(t, { 'README.md': '[bad](file%ZZ.md)\n[bad anchor](#%E0%A4)\n' });
  const result = await audit(root);
  assert.equal(result.diagnostics.length, 2);
  assert.ok(result.diagnostics.every(({ code }) => code === 'INVALID_LINK'));
});

test('rejects paths escaping the root even when the external file exists', async (t) => {
  const parent = await fixture(t, { 'outside.md': '# Outside\n', 'repo/README.md': '[outside](../outside.md)\n' });
  const { diagnostics } = await audit(path.join(parent, 'repo'));
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'OUTSIDE_ROOT');
});

test('rejects URL-encoded traversal outside the root', async (t) => {
  const root = await fixture(t, { 'README.md': '[outside](%2e%2e/outside.md)\n' });
  const { diagnostics } = await audit(root);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'OUTSIDE_ROOT');
});

test('recognizes Windows drive-absolute paths as out of scope rather than external URLs', async (t) => {
  const root = await fixture(t, { 'README.md': '[absolute](C:/outside.md)\n' });
  const result = await audit(root);
  assert.equal(result.linksSkipped, 0);
  assert.equal(result.linksChecked, 1);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'OUTSIDE_ROOT');
});

test('finishes malformed bracket-heavy input and preserves later link locations', async (t) => {
  const remote = '[remote](https://example.invalid/)\n';
  const root = await fixture(t, {
    'README.md': '['.repeat(100_000) + '\n' + remote.repeat(10_000) + '[missing](#absent)\n',
  });
  // The child timeout bounds pathological synchronous parsing without hanging
  // the test runner. Five seconds leaves ample room for normal local I/O.
  const result = spawnSync(process.execPath, [cli, root, '--format', 'json'], {
    encoding: 'utf8', cwd: project, timeout: 5_000,
  });
  assert.equal(result.error, undefined, `Audit did not finish within five seconds: ${result.error?.message}`);
  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.linksSkipped, 10_000);
  assert.equal(report.linksChecked, 1);
  assert.equal(report.diagnostics.length, 1);
  assert.equal(report.diagnostics[0].code, 'MISSING_ANCHOR');
  assert.equal(report.diagnostics[0].line, 10_002);
  assert.equal(report.diagnostics[0].column, 1);
});

test('does not follow directory symlinks or read linked external files', async (t) => {
  const parent = await fixture(t, {
    'outside/secret.md': '[broken](missing.md)\n',
    'repo/README.md': '[external](linked/secret.md)\n',
  });
  try {
    await symlink(path.join(parent, 'outside'), path.join(parent, 'repo', 'linked'), 'junction');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip('Creating symlinks is unavailable on this machine.');
    throw error;
  }
  const result = await audit(path.join(parent, 'repo'));
  assert.equal(result.filesScanned, 1);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, 'OUTSIDE_ROOT');
});

test('ignores built-in generated directories and respects custom path prefixes', async (t) => {
  const root = await fixture(t, {
    'README.md': '# Home\n',
    '.git/internal.md': '[bad](missing.md)',
    'node_modules/pkg/readme.md': '[bad](missing.md)',
    'dist/readme.md': '[bad](missing.md)',
    'coverage/readme.md': '[bad](missing.md)',
    'generated/readme.md': '[bad](missing.md)',
    'generated-keep/readme.md': '[bad](missing.md)',
  });
  for (const exclude of [['generated'], ['./generated/']]) {
    const result = await audit(root, { exclude });
    assert.equal(result.filesScanned, 2);
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].file, 'generated-keep/readme.md');
  }
});

test('limits source size and still checks other documents', async (t) => {
  const root = await fixture(t, {
    'big.md': 'x'.repeat(100),
    'small.md': '[bad](missing.md)',
  });
  const { diagnostics } = await audit(root, { maxFileBytes: 32 });
  assert.deepEqual(diagnostics.map(({ code, file }) => ({ code, file })), [
    { code: 'FILE_TOO_LARGE', file: 'big.md' },
    { code: 'MISSING_FILE', file: 'small.md' },
  ]);
});

test('enforces the size limit when loading Markdown anchor targets', async (t) => {
  const root = await fixture(t, {
    'README.md': '[target](large.md#title)\n',
    'large.md': '# Title\n' + 'x'.repeat(100),
  });
  const result = await audit(root, { maxFileBytes: 32 });
  assert.ok(result.diagnostics.some(({ file, code, target }) =>
    file === 'README.md' && code === 'FILE_TOO_LARGE' && target === 'large.md#title'));
  assert.equal(result.diagnostics.some(({ code }) => code === 'MISSING_ANCHOR'), false);
});

test('reports invalid UTF-8 Markdown without crashing or losing other findings', async (t) => {
  const root = await fixture(t, {
    'bad.md': Buffer.from([0xff, 0xfe, 0xff]),
    'README.md': '[bad](missing.md)\n',
  });
  const { diagnostics } = await audit(root);
  assert.ok(diagnostics.some(({ file, code }) => file === 'bad.md' && code === 'FILE_READ_ERROR'));
  assert.ok(diagnostics.some(({ file, code }) => file === 'README.md' && code === 'MISSING_FILE'));
});

test('produces stable results across runs and normalizes nested paths', async (t) => {
  const root = await fixture(t, {
    'z/README.md': '[bad](no.md)\n',
    'a/README.md': '[bad](no.md)\n',
  });
  const first = await audit(root);
  assert.deepEqual(await audit(root), first);
  assert.deepEqual(first.diagnostics.map(({ file }) => file), ['a/README.md', 'z/README.md']);
});

test('auditing a repository does not create files or modify source content', async (t) => {
  const contents = '# Home\n[bad](missing.md)\n';
  const root = await fixture(t, { 'README.md': contents });
  await audit(root);
  assert.deepEqual(await readdir(root), ['README.md']);
  assert.equal(await readFile(path.join(root, 'README.md'), 'utf8'), contents);
});

test('API rejects invalid roots and invalid size options', async (t) => {
  const root = await fixture(t, { 'README.md': '# Home' });
  await assert.rejects(() => audit(path.join(root, 'missing')));
  await assert.rejects(() => audit(path.join(root, 'README.md')));
  for (const maxFileBytes of [0, -1, 1.5, NaN, Infinity, '32']) {
    await assert.rejects(() => audit(root, { maxFileBytes }), `maxFileBytes=${maxFileBytes}`);
  }
  for (const prefix of ['.', './', '']) {
    await assert.rejects(() => audit(root, { exclude: [prefix] }), TypeError);
  }
});

test('CLI emits a usable JSON report and returns 0 for a clean repository', async (t) => {
  const root = await fixture(t, { 'README.md': '# Home\n' });
  const result = runCli([root, '--format', 'json']);
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.deepEqual(report.diagnostics, []);
});

test('CLI returns 1 and a JSON diagnostic when a link fails', async (t) => {
  const root = await fixture(t, { 'README.md': '[missing](missing.md)\n' });
  const result = runCli([root, '--format', 'json']);
  assert.equal(result.status, 1, result.stderr);
  assert.equal(JSON.parse(result.stdout).diagnostics[0].code, 'MISSING_FILE');
});

test('CLI returns 2 for malformed arguments and invalid roots', async (t) => {
  const root = await fixture(t, {});
  const invalid = [
    ['--unknown'], ['--format'], ['--format', 'xml'], ['--exclude'],
    ['--max-file-bytes'], ['--max-file-bytes', '0'], ['--max-file-bytes', '1.5'],
    ['--max-file-bytes', '32junk'], [path.join(root, 'missing')], [root, root],
  ];
  for (const args of invalid) {
    const result = runCli(args);
    assert.equal(result.status, 2, `Expected usage failure for ${JSON.stringify(args)}; stderr: ${result.stderr}`);
    assert.ok(result.stderr.length > 0);
  }
});

test('CLI supports help and version without auditing', () => {
  const help = runCli(['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--format/);
  assert.match(help.stdout, /--exclude/);
  const version = execFileSync(process.execPath, [cli, '--version'], { encoding: 'utf8', cwd: project });
  assert.match(version.trim(), /^\d+\.\d+\.\d+/);
});
