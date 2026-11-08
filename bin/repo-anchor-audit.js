#!/usr/bin/env node
import { audit } from '../src/audit.js';

const HELP = `repo-anchor-audit 0.1.0
Usage: repo-anchor-audit [root] [options]

Check local Markdown links and heading anchors offline.

Options:
  --format text|json      Output format (default: text)
  --exclude <prefix>      Exclude a relative path prefix; repeatable
  --max-file-bytes <n>    Maximum Markdown file size (default: 1048576)
  --help                 Show this help
  --version              Show version

Exit codes: 0 clean, 1 diagnostics, 2 invalid arguments/root.
No network access. External URLs are counted as skipped, never checked.
`;

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { process.stdout.write(HELP); return 0; }
  if (args.includes('--version')) { process.stdout.write('0.1.0\n'); return 0; }
  let root = '.';
  let hasRoot = false;
  let format = 'text';
  const options = { exclude: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--format' || arg === '--exclude' || arg === '--max-file-bytes') {
      const value = args[++i];
      if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${arg}.`);
      if (arg === '--format') {
        if (value !== 'text' && value !== 'json') throw new Error('--format must be text or json.');
        format = value;
      } else if (arg === '--exclude') options.exclude.push(value);
      else {
        if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('--max-file-bytes must be a positive safe integer.');
        options.maxFileBytes = Number(value);
      }
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (hasRoot) throw new Error('Only one root directory may be supplied.');
    else { root = arg; hasRoot = true; }
  }
  const report = await audit(root, options);
  if (format === 'json') process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    for (const item of report.diagnostics) process.stdout.write(`${item.file}:${item.line}:${item.column} ${item.code} ${JSON.stringify(item.target)} — ${item.message}\n`);
    process.stdout.write(`${report.filesScanned} Markdown file(s), ${report.linksChecked} local link(s), ${report.linksSkipped} skipped external link(s), ${report.diagnostics.length} diagnostic(s).\n`);
  }
  return report.diagnostics.length ? 1 : 0;
}

try { process.exitCode = await main(); }
catch (error) {
  process.stderr.write(`repo-anchor-audit: ${error.message}\n`);
  process.exitCode = 2;
}
