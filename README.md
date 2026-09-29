# Zed Abaqus extension

Abaqus input deck language support for Zed editor.

## Features

- Syntax highlighting for Abaqus keywords, parameters, numeric values, strings, and comments
- Document outline for navigating steps, parts, assemblies, instances, materials, node sets, element sets, amplitudes, and major boundary and control sections
- Snippets for common FEA constructs including heading, node, element, nset, elset, material, elastic, Ogden hyperelastic, solid section, boundary, amplitude, static step, output, and include
- Comment toggling using double asterisk line comments
- Conservative indentation preserving tabular solver layout and data columns
- Support for .inp, .inc, and .incl file extensions
- Resilient tree-sitter parser handling case-insensitive keywords, continuation lines, empty fields, and scientific exponent notation

## Installation

### Prerequisites

- Zed editor version 0.140.0 or later
- Node.js version 18 or later (for building from source or running grammar tests)

### Local development installation in Zed

1. Clone this repository to your local machine:

```sh
git clone https://github.com/Moa1er/zed-abaqus.git
cd zed-abaqus
```

2. Open Zed.

3. Open the command palette (Ctrl+Shift+P on Windows/Linux or Cmd+Shift+P on macOS).

4. Search for and select the action:

```text
zed: install dev extension
```

5. In the file dialog, choose the zed-abaqus repository folder containing extension.toml.

6. Open any Abaqus input file (.inp, .inc, or .incl). The status bar will show Abaqus as the active language.

### Windows specific setup notes

- File paths: Abaqus include directives often use Windows paths with backslashes. Quoted strings with spaces and Windows paths are fully supported.
- Line endings: Both CRLF (Windows) and LF (Unix) line endings are supported, as well as decks without a trailing newline.
- Compilation: If Zed prompts to build the tree-sitter WebAssembly grammar, ensure internet access is available so Zed or tree-sitter can download wasi-sdk for WebAssembly compilation.

## Supported syntax and examples

The extension is designed around official Abaqus syntax rules:
- Keywords starting with an asterisk, case-insensitive, including multi-word keywords such as Solid Section, Hyperelastic, Surface Interaction, and End Step.
- Parameters with flags and key-value pairs, including values with spaces or numbers.
- Keyword continuation across lines when a line ends with a comma.
- Data lines with comma-separated integers, decimals, and Fortran scientific notation (e.g. 1.0e-15, 1.0D-03).
- Empty fields denoted by consecutive commas (e.g. , , , , 20, , ,).
- Comments beginning with double asterisks (**).

Sample files are available in the examples/ directory:
- examples/compression_test_ogden.inp: Specimen model with Ogden hyperelasticity, boundary conditions, equations, and field output requests.
- examples/assembly_multistep.inp: Multi-part model with instances, assembly ties, and multiple steps.
- examples/edge_cases.inp: Continuation lines, quoted paths with spaces, scientific exponents, and empty data fields.

## Snippets reference

Type any prefix in an Abaqus buffer to trigger completions:

- heading: Model heading block
- node: Node definition block
- element: Solid element definition (C3D8R)
- nset: Node set with generate option
- elset: Element set with generate option
- material: Material definition
- elastic: Isotropic linear elasticity
- ogden: N=2 Ogden hyperelastic formulation
- solid section: Solid section assignment to element set
- boundary: Boundary condition specification
- amplitude: Tabular amplitude definition
- step: General static analysis step with nlgeom
- output: Field output request for node and element variables
- include: Include file reference with quoted path

## Testing and verification

To run all automated checks:

```sh
node test/test_runner.js
```

This test suite executes:
- 11 tree-sitter corpus tests verifying syntax structures
- Clean parse validation on all representative example decks
- Verification of highlight and outline queries against real decks
- Parse resilience tests during incomplete editing states
- Performance benchmark on a 25,000 node generated mesh

To run the tree-sitter corpus tests directly:

```sh
cd tree-sitter-abaqus
npx tree-sitter-cli test
```

## Known limitations

- CalculiX dialect: Many shared keywords work identically in CalculiX, but CalculiX-specific syntax extensions without Abaqus equivalents are not fully validated.
- Preprocessor macros: Python-parametrized Abaqus decks (such as AbaqusPy or script markers) are treated as regular text or comments.
- Background solver: This extension is an editor enhancement for syntax, outline, and navigation. It does not run solver jobs or visualize 3D meshes.

## License

MIT License. See LICENSE file for details.
