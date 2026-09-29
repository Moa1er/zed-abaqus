# tree-sitter-abaqus

Abaqus input file grammar for tree-sitter.

## Overview

This grammar provides line-oriented syntax parsing for Abaqus finite element analysis input decks (.inp, .inc, .incl).

Features supported:
- Case-insensitive multi-word keywords
- Keyword parameters (flags and key-value pairs)
- Quoted string parameters and include paths with spaces
- Line continuation rules for keywords
- Line comments starting with two asterisks
- Data lines with integers, floating point numbers, scientific notation, and text
- Empty fields and trailing commas
- Structural blocks: step, part, assembly, instance

## Usage

Generate parser code:

```sh
npx tree-sitter-cli generate
```

Run test suite:

```sh
npx tree-sitter-cli test
```

Parse an input file:

```sh
npx tree-sitter-cli parse path/to/model.inp
```

## License

MIT License. See LICENSE file for details.
