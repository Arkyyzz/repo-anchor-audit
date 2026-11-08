# Architecture and limits

The implementation separates repository discovery, Markdown scanning, local target validation, and report formatting. `src/index.js` exposes the asynchronous `audit` API; `bin/repo-anchor-audit.js` handles arguments, output, and exit status. Tests exercise the public behavior using temporary repositories.

## Filesystem model

The selected directory is the boundary for local targets. Reports use relative paths with `/` separators. Traversal does not follow symbolic-link directories, and local links through symbolic links or outside the root are rejected. This reduces accidental reads outside the audited repository; it is not a race-proof isolation boundary for an adversarially changing filesystem.

Markdown discovery excludes `.git`, `node_modules`, `dist`, and `coverage`. Additional exclusions match relative files or directory prefixes on a path-component boundary. Excluding `docs/build` does not exclude `docs/building.md`. Excluding a path from discovery does not mean that a link to it is broken: target existence is still checked.

The file-size option applies to Markdown content the tool needs to read, including linked Markdown targets. It is not a total-memory, total-file-count, or execution-time limit.

## Markdown subset

The scanner supports ordinary inline links and images, reference links with definitions, and Markdown heading fragments within its declared subset. It masks fenced code blocks and inline code before looking for links. URI schemes such as `https:`, `mailto:`, and `data:`, and protocol-relative URLs, are skipped. Nothing is fetched.

Local URL paths and fragments are percent-decoded. The query component of a local target does not affect file lookup. Directory links validate existence only. Only Markdown targets have their fragments checked; HTML, PDF, source files, and other formats are existence checks.

Heading identifiers are GitHub-like: text is normalized for anchor generation, and repeated headings receive numeric suffixes. This is not a promise of exact behavior for every Markdown renderer, Unicode edge case, custom slugger, generated heading, or extension. Use tests to document a renderer-specific requirement before adding support.

Markdown files use `.md` or `.markdown`, case-insensitively. ATX and setext headings are recognized. Heading slugs retain Unicode letters, numbers and marks, underscores and hyphens, remove punctuation, and replace whitespace with hyphens. Basic inline formatting is stripped; only the entities `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` are decoded for heading text. Duplicate identifiers use suffixes such as `-1`, with collision avoidance across the document.

Inline destinations may use balanced parentheses or angle brackets and an optional title. Reference definitions must fit on one line. Full and collapsed reference links are recognized, as are shortcut references with a definition. Reference labels ignore case and normalize whitespace; link reference labels longer than 999 characters are outside the supported subset. An undefined explicit reference is reported; undefined plain bracketed text is treated as prose. Fenced code, backtick code spans, and HTML comments are masked.

The initial scanner is not a complete CommonMark/GFM parser. Indented code blocks, raw HTML links and explicit HTML IDs, MDX/JSX, autolinks, generated routes, template variables, footnotes, multiline reference definitions, and renderer plugins are outside the promised surface. Complex nested or multiline Markdown may require a future parser. Unsupported syntax can be missed or interpreted as ordinary text; a clean report does not establish that all rendered links work.

## Output contract

The JSON `schemaVersion` is `1`. `filesScanned` includes selected Markdown files that are oversized or unreadable. `linksChecked` includes parsed local links, malformed local targets, and undefined explicit references. `linksSkipped` counts external links. Diagnostics include source coordinates where available. A target is reported without opening it in a browser. Messages are for people; use diagnostic codes for automation.

The output is deterministic for the same unchanged input and options. The tool does not write a cache, modify files, or include absolute root paths in its normal JSON report. Paths and link text can still contain sensitive project information, so decide where to store or upload reports yourself.

## Scope of verification

Native tests cover representative supported syntax, command-line behavior, report structure, and filesystem boundaries. They do not establish full Markdown conformance or safety against every filesystem race. The prepared CI matrix must run on the eventual public repository before claiming remote platform coverage.
