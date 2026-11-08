# Security

The project is an initial implementation. No independent security audit or support guarantee is claimed. Use a current supported Node.js release and inspect code before using it on sensitive material.

The tool is designed to read local documentation only, never fetch URLs or execute repository content, and reject local targets outside the selected root. It does not provide a sandbox for hostile filesystems. Avoid auditing a directory that another process can mutate adversarially while the audit is running. File-size limits bound individual Markdown inputs, not total repository size or total runtime.

If you find a possible vulnerability, prepare a minimal reproduction using synthetic content. Do not include credentials, private repository files, or unrelated personal data.

Before public launch, the maintainer must enable GitHub private vulnerability reporting or publish a private security contact here. If private reporting is enabled on the public repository, use its Security tab to report a vulnerability. Until a private contact exists, do not publish exploit details in a public issue; a general request for a private contact is sufficient.

Fixes should include a regression test where feasible and a release note describing affected behavior. A supported-version policy and response target will be added only when a maintainer can sustain them.
