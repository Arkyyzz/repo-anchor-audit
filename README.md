# repo-anchor-audit

Find broken local links and heading fragments in Markdown documentation, without sending repository content to a server.

This is an initial, AI-assisted implementation prepared for human review. It has not been published to a registry, and no external users or adoption are claimed. The working package name must be checked before publication.

[Français](README.fr.md) · [Contributing](CONTRIBUTING.md) · [Architecture and limits](docs/ARCHITECTURE.md) · [MIT license](LICENSE)

## Run it

Requires Node.js 22 or newer. There are no package dependencies and no installation step for a source checkout.

```sh
node bin/repo-anchor-audit.js . --exclude examples/broken
node bin/repo-anchor-audit.js . --format json --exclude examples/broken
node --test
```

Run commands from this project's directory. Replace `.` before the options with the repository you want to inspect. Choose a root that contains both the documentation and its local link targets. Auditing reads files; it does not change them, fetch URLs, run repository scripts, or require credentials.

## What it checks

- Inline Markdown links and images, plus reference links and definitions, within the supported syntax subset.
- Local file existence, percent-encoded filenames and fragments, and heading fragments in Markdown files.
- Local links that leave the selected root, including symbolic-link targets.
- Missing reference definitions and unreadable or oversized Markdown files.

HTTP links and other URI schemes are counted as skipped. Directory targets are checked for existence only; fragments in non-Markdown files are not checked. Fenced and inline code are ignored. Files under `.git`, `node_modules`, `dist`, and `coverage` are excluded from discovery by default.

This is a deliberately bounded Markdown scanner, not a full CommonMark or GitHub renderer. See [supported syntax and limitations](docs/ARCHITECTURE.md) before adopting it as a required check.

If you need a broader link-checking surface, consider established projects such as [lychee](https://github.com/lycheeverse/lychee) or [markdown-link-check](https://github.com/tcort/markdown-link-check). This project's narrower goal is a dependency-free, offline audit of local Markdown links.

## Command line

```text
node bin/repo-anchor-audit.js [root]
  --format text|json
  --exclude relative/path
  --max-file-bytes 1048576
  --help
  --version
```

The default root is the current directory, the default output is text, and the default Markdown file limit is 1,048,576 bytes. Repeat `--exclude` for additional relative file or directory prefixes. Exclusions are path prefixes, not wildcard patterns: `docs/generated` excludes that directory and its descendants, not `docs/generated-other`.

Exit codes: `0` means no findings, `1` means findings, and `2` means invalid arguments or an invalid root. A finding is a diagnostic to review, not proof that every Markdown renderer would reject that link.

## JSON and JavaScript API

```js
import { audit } from './src/index.js';

const report = await audit('/path/to/repository', {
  exclude: ['docs/generated'],
  maxFileBytes: 1048576,
});
console.log(JSON.stringify(report, null, 2));
```

The report has `schemaVersion: 1`, `filesScanned`, `linksChecked`, `linksSkipped`, and `diagnostics`. Each diagnostic contains `code`, `file`, `line`, `column`, `target`, and `message`. Paths are relative to the audit root, with `/` separators. Diagnostic ordering is deterministic. Invalid API options or roots reject the promise.

Diagnostic codes include `MISSING_FILE`, `MISSING_ANCHOR`, `UNDEFINED_REFERENCE`, `OUTSIDE_ROOT`, `INVALID_LINK`, `FILE_READ_ERROR`, and `FILE_TOO_LARGE`. Consumers should use codes rather than parse human-readable messages.

## Try the examples

```sh
node bin/repo-anchor-audit.js examples/valid
node bin/repo-anchor-audit.js examples/broken --format json
```

The second command is supposed to exit with `1`. The [broken fixture explanation](examples/broken/EXPECTED.md) describes the deliberate failures. The example domain is illustrative and is never contacted.

## Development and release

```sh
node --test
node bin/repo-anchor-audit.js . --exclude examples/broken
```

The prepared CI runs tests and a documentation audit on Linux and Windows, using Node.js 22 and 24. Its actual remote status only becomes known after you publish the repository and run it.

[Publication guide in French](docs/PUBLISHING.fr.md) · [Roadmap](docs/ROADMAP.fr.md) · [Security reporting](SECURITY.md) · [Changelog](CHANGELOG.md)
