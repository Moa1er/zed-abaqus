# Release checklist

Steps required before publishing a release of zed-abaqus.

## Pre-release verification

- Run the full test suite with node test/test_runner.js and ensure all checks pass.
- Verify tree-sitter test corpus in tree-sitter-abaqus passes with zero failures.
- Verify that parser.c and grammar.json in tree-sitter-abaqus/src are generated from the latest grammar.js.
- Ensure all query files (highlights.scm, outline.scm, indents.scm, brackets.scm) validate against the grammar.
- Verify that examples/compression_test_ogden.inp parses without syntax errors.
- Confirm snippets in snippets/abaqus.json have valid JSON syntax and working tab stops.
- Confirm line endings are normalized (git core.autocrlf or .gitattributes).

## Metadata and configuration checks

- Verify version number consistency between extension.toml and tree-sitter-abaqus/package.json.
- Verify the git commit hash pinned in extension.toml under grammars.abaqus matches the released commit.
- Confirm author, description, and repository URLs are accurate.
- Confirm MIT license files are present in the root and in tree-sitter-abaqus/.

## Packaging and publishing

- Push release commit and tags to GitHub repository.
- Ensure GitHub Actions CI passes on all matrix configurations (Ubuntu and Windows).
- Submit extension to the official Zed extension index repository (zed-industries/extensions) following Zed submission guidelines.
