# Expected findings

Auditing this directory deliberately exits with code `1`.

| Source | Expected code | Reason |
| --- | --- | --- |
| `README.md`, line 3 | `MISSING_FILE` | `missing.md` does not exist. |
| `README.md`, line 5 | `MISSING_ANCHOR` | `guide.md` exists, but `not-a-heading` does not. |
| `README.md`, line 7 | `UNDEFINED_REFERENCE` | `not-defined` has no definition. |

The Markdown files in this directory are test data. Exclude `examples/broken` when auditing the full project.
