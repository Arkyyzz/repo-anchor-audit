# Contributing

Useful contributions start with a real documentation problem. A minimal Markdown example and the behavior you expected are often more valuable than a large patch.

## Reproduce and propose

1. Search existing issues once the repository is public, to avoid duplicate work.
2. Run the tool against the smallest example that demonstrates the problem.
3. Explain the intended Markdown renderer or hosting platform when anchor behavior matters.
4. For a bug fix, add a regression test that fails before the fix and passes afterward.
5. Run `node --test` and `node bin/repo-anchor-audit.js . --exclude examples/broken`.

Keep changes focused. Include the user-visible effect and limitations in the pull request. A contribution can also be a clear reproduction, a measured performance report with reproducible inputs, a translation, or documentation that resolves an actual user question.

## Boundaries

The first version is offline, read-only, and dependency-free. Network checking, automatic file changes, and full Markdown renderer compatibility need a design discussion before implementation. Do not add telemetry, credentials, repository-script execution, or hidden network requests.

Tests use the built-in Node.js test runner. New fixtures must be small, synthetic, and free of private repository content. Keep intentionally invalid documentation under `examples/broken` or temporary test directories.

## Authorship and conduct

Disclose meaningful AI assistance in your pull request and review generated code yourself. Confirm you have permission to contribute the code and any assets under the [MIT license](LICENSE). Do not claim work you did not review or write, and do not invent external users, contributions, merged pull requests, downloads, or endorsements.

Follow the [code of conduct](CODE_OF_CONDUCT.md). Do not submit trivial or duplicate changes merely to inflate activity counts. Submit a pull request to another project only when it addresses a real need and its maintainers' contribution guidance allows it.

## Maintainer review

The future maintainer should confirm the reproduction, inspect the change, run relevant tests, and explain acceptance or rejection respectfully. No response time is promised. Publishing this prepared repository does not create a support team; set realistic availability in the public repository description.
