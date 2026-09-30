# Abaqus language server

A lightweight Language Server Protocol (LSP) implementation for Abaqus finite element analysis input decks (.inp, .inc, .incl).

## Overview

The Abaqus language server provides intelligent editing features for finite element models directly inside Zed and any editor supporting the Language Server Protocol.

Built on Node.js using vscode-languageserver, it requires zero native compilation and runs cross-platform on Windows, macOS, and Linux.

## Implemented capabilities

### Phase 1: Keyword and parameter autocompletion with hover documentation

- Keyword autocompletion: typing an asterisk triggers suggestions for over 75 core Abaqus keywords with syntax details, data line format, and parameter summaries.
- Parameter autocompletion: typing a comma on a keyword line prompts valid parameter names for that specific keyword, filtering out already specified parameters.
- Parameter choices: typing an equals sign after a parameter prompts valid enumeration values (for example YES and NO for nlgeom, formulation types for elements, hardening models for plasticity).
- Rich hover tooltips: hovering over any keyword card displays its purpose and data line formatting. Hovering over a parameter reveals its documentation, requirement status, and allowed options.

### Phase 2: Workspace symbol indexing and go-to-definition

- Symbol extraction: automatically scans and indexes materials, element sets, node sets, steps, parts, instances, amplitude curves, surfaces, coordinate orientations, and surface interactions.
- Go-to-definition: pressing F12 or clicking on any referenced symbol jumps directly to its declaration line, highlighting the entity name.
- Cross-file include navigation: hovering or pressing F12 on an *Include card path opens and jumps to the referenced file on disk.
- Project-wide indexing: when workspace folders are registered or include directives are parsed, all included sub-decks are automatically loaded into memory so references resolve across the entire model deck.

### Phase 3: Real-time diagnostics and semantic validation

- Block hierarchy validation: checks for unclosed blocks (*Step without *End Step, *Part without *End Part, *Assembly without *End Assembly, *Instance without *End Instance, *Coupling without *End Coupling), as well as unexpected or mismatched end cards.
- Required parameter enforcement: warns when mandatory parameters are missing on keywords (such as name on *Part, material on *Solid Section, type on *Element).
- Parameter choice checking: validates parameter values against allowed options, flagging invalid values (for example nlgeom=MAYBE).
- Duplicate entity detection: flags duplicate material names, step names, part names, instance names, and amplitude curves with line references to the original definition.
- Include file verification: checks whether external files referenced in *Include input= directives exist on disk.

## Installation and configuration in Zed

To enable the language server in Zed:

1. Open Zed settings (Ctrl+, on Windows/Linux or Cmd+, on macOS).

2. Add the language server binary definition and map it to Abaqus:

```json
{
  "languages": {
    "Abaqus": {
      "language_servers": [
        "abaqus-language-server"
      ]
    }
  },
  "lsp": {
    "abaqus-language-server": {
      "binary": {
        "path": "node",
        "arguments": [
          "C:/github/zed-abaqus/server/src/index.js"
        ]
      }
    }
  }
}
```

Replace the arguments path with the absolute path to your local server/src/index.js file.

3. Restart Zed or open any .inp file. The language server will start automatically in the background.

## Running tests

Run the language server unit and integration test suite:

```sh
cd server
npm test
```

The test runner validates:
- Keyword completion catalog coverage
- Parameter and enum choice completions
- Dynamic workspace symbol indexing
- Hover documentation generation
- Go-to-definition resolution
- Cross-file include resolution
- Diagnostics validation rules
- Standard input/output (stdio) JSON-RPC protocol compliance

## Project structure

- [bin/abaqus-language-server](file:///c:/github/zed-abaqus/server/bin/abaqus-language-server): shell executable launcher
- [bin/abaqus-language-server.cmd](file:///c:/github/zed-abaqus/server/bin/abaqus-language-server.cmd): Windows command script launcher
- [src/index.js](file:///c:/github/zed-abaqus/server/src/index.js): JSON-RPC stdio language server entry point
- [src/workspace.js](file:///c:/github/zed-abaqus/server/src/workspace.js): document store, context detection, symbol indexer, and project scanner
- [src/catalog/keywords.js](file:///c:/github/zed-abaqus/server/src/catalog/keywords.js): dictionary of Abaqus keywords and parameters
- [src/features/completion.js](file:///c:/github/zed-abaqus/server/src/features/completion.js): completion item provider
- [src/features/hover.js](file:///c:/github/zed-abaqus/server/src/features/hover.js): hover documentation provider
- [src/features/definition.js](file:///c:/github/zed-abaqus/server/src/features/definition.js): go-to-definition provider
- [src/features/diagnostics.js](file:///c:/github/zed-abaqus/server/src/features/diagnostics.js): diagnostics validation engine
- [test/server.test.js](file:///c:/github/zed-abaqus/server/test/server.test.js): language server feature tests
- [test/stdio.test.js](file:///c:/github/zed-abaqus/server/test/stdio.test.js): stdio JSON-RPC protocol tests
