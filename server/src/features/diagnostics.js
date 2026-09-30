// diagnostics validation engine for abaqus input decks

const { Diagnostic, DiagnosticSeverity, Range, Position } = require('vscode-languageserver');
const { keywords } = require('../catalog/keywords');

function validateDocument(workspace, uri) {
  const doc = workspace.getDocument(uri);
  if (!doc) return [];

  const diagnostics = [];
  const lines = doc.lines;

  // tracking open block stacks
  const blockStack = [];
  // tracking duplicate names
  const seenMaterials = new Map();
  const seenSteps = new Map();
  const seenParts = new Map();
  const seenInstances = new Map();
  const seenAmplitudes = new Map();
  const seenSurfaces = new Map();

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    const trimmed = rawLine.trim();
    if (!trimmed.startsWith('*') || trimmed.startsWith('**')) continue;

    const parts = trimmed.split(',');
    const keywordRaw = parts[0].trim().toUpperCase();

    // 1. block hierarchy tracking
    if (keywordRaw === '*STEP') {
      blockStack.push({ type: '*STEP', line: lineIndex, endKeyword: '*END STEP' });
    } else if (keywordRaw === '*PART') {
      blockStack.push({ type: '*PART', line: lineIndex, endKeyword: '*END PART' });
    } else if (keywordRaw === '*ASSEMBLY') {
      blockStack.push({ type: '*ASSEMBLY', line: lineIndex, endKeyword: '*END ASSEMBLY' });
    } else if (keywordRaw === '*INSTANCE') {
      blockStack.push({ type: '*INSTANCE', line: lineIndex, endKeyword: '*END INSTANCE' });
    } else if (keywordRaw === '*COUPLING') {
      blockStack.push({ type: '*COUPLING', line: lineIndex, endKeyword: '*END COUPLING' });
    } else if (
      keywordRaw === '*END STEP' ||
      keywordRaw === '*END PART' ||
      keywordRaw === '*END ASSEMBLY' ||
      keywordRaw === '*END INSTANCE' ||
      keywordRaw === '*END COUPLING'
    ) {
      if (blockStack.length === 0) {
        diagnostics.push(Diagnostic.create(
          Range.create(Position.create(lineIndex, 0), Position.create(lineIndex, rawLine.length)),
          `Unexpected ${keywordRaw} without matching opening block card`,
          DiagnosticSeverity.Error,
          'abaqus'
        ));
      } else {
        const top = blockStack[blockStack.length - 1];
        if (top.endKeyword === keywordRaw) {
          blockStack.pop();
        } else {
          diagnostics.push(Diagnostic.create(
            Range.create(Position.create(lineIndex, 0), Position.create(lineIndex, rawLine.length)),
            `Mismatched block termination: expected ${top.endKeyword} for ${top.type} started at line ${top.line + 1}, found ${keywordRaw}`,
            DiagnosticSeverity.Error,
            'abaqus'
          ));
        }
      }
    }

    // 2. keyword validation against catalog
    const kwDef = keywords[keywordRaw];
    if (kwDef && kwDef.parameters) {
      const lineParams = new Map();
      for (let p = 1; p < parts.length; p++) {
        const paramStr = parts[p].trim();
        const eqIdx = paramStr.indexOf('=');
        const key = (eqIdx >= 0 ? paramStr.slice(0, eqIdx) : paramStr).trim().toLowerCase();
        const val = eqIdx >= 0 ? paramStr.slice(eqIdx + 1).trim() : null;
        if (key) lineParams.set(key, { val, str: paramStr });
      }

      // check missing required parameters
      for (const [pName, pDef] of Object.entries(kwDef.parameters)) {
        if (pDef.required && !lineParams.has(pName.toLowerCase())) {
          // exception: nset/elset allow either nset=/elset= or name=
          if ((pName === 'nset' && lineParams.has('name')) || (pName === 'elset' && lineParams.has('name'))) {
            continue;
          }
          diagnostics.push(Diagnostic.create(
            Range.create(Position.create(lineIndex, 0), Position.create(lineIndex, rawLine.length)),
            `Missing required parameter '${pName}' on ${keywordRaw}`,
            DiagnosticSeverity.Warning,
            'abaqus'
          ));
        }
      }

      // check parameter values against allowed choices
      for (const [key, { val, str }] of lineParams) {
        const pDef = kwDef.parameters[key];
        if (pDef && pDef.choices && val) {
          const upperVal = val.toUpperCase();
          const match = pDef.choices.some(c => c.toUpperCase() === upperVal);
          if (!match) {
            const charIdx = rawLine.indexOf(str);
            diagnostics.push(Diagnostic.create(
              Range.create(
                Position.create(lineIndex, charIdx >= 0 ? charIdx : 0),
                Position.create(lineIndex, (charIdx >= 0 ? charIdx : 0) + str.length)
              ),
              `Invalid value '${val}' for parameter '${key}'. Allowed values: ${pDef.choices.join(', ')}`,
              DiagnosticSeverity.Warning,
              'abaqus'
            ));
          }
        }
      }

      // check unknown parameters on known keywords
      for (const [key, { str }] of lineParams) {
        if (!kwDef.parameters[key]) {
          // allow standard flags like generate or general abaqus options
          if (['name', 'generate', 'input', 'system'].includes(key)) continue;

          const charIdx = rawLine.indexOf(str);
          diagnostics.push(Diagnostic.create(
            Range.create(
              Position.create(lineIndex, charIdx >= 0 ? charIdx : 0),
              Position.create(lineIndex, (charIdx >= 0 ? charIdx : 0) + str.length)
            ),
            `Unrecognized parameter '${key}' on ${keywordRaw}`,
            DiagnosticSeverity.Information,
            'abaqus'
          ));
        }
      }

      // check duplicate entity definitions
      const checkDuplicate = (map, name, label) => {
        if (!name) return;
        const lower = name.toLowerCase();
        if (map.has(lower)) {
          diagnostics.push(Diagnostic.create(
            Range.create(Position.create(lineIndex, 0), Position.create(lineIndex, rawLine.length)),
            `Duplicate ${label} name '${name}' (previously defined at line ${map.get(lower) + 1})`,
            DiagnosticSeverity.Warning,
            'abaqus'
          ));
        } else {
          map.set(lower, lineIndex);
        }
      };

      if (keywordRaw === '*MATERIAL') {
        checkDuplicate(seenMaterials, lineParams.get('name')?.val, 'material');
      } else if (keywordRaw === '*STEP') {
        checkDuplicate(seenSteps, lineParams.get('name')?.val, 'step');
      } else if (keywordRaw === '*PART') {
        checkDuplicate(seenParts, lineParams.get('name')?.val, 'part');
      } else if (keywordRaw === '*INSTANCE') {
        checkDuplicate(seenInstances, lineParams.get('name')?.val, 'instance');
      } else if (keywordRaw === '*AMPLITUDE') {
        checkDuplicate(seenAmplitudes, lineParams.get('name')?.val, 'amplitude');
      } else if (keywordRaw === '*SURFACE') {
        checkDuplicate(seenSurfaces, lineParams.get('name')?.val, 'surface');
      }
    }
  }

  // check unclosed blocks at EOF
  while (blockStack.length > 0) {
    const unclosed = blockStack.pop();
    diagnostics.push(Diagnostic.create(
      Range.create(Position.create(unclosed.line, 0), Position.create(unclosed.line, doc.lines[unclosed.line].length)),
      `Unclosed ${unclosed.type} block: missing matching ${unclosed.endKeyword}`,
      DiagnosticSeverity.Error,
      'abaqus'
    ));
  }

  // check dangling include files
  for (const inc of doc.symbols.includes) {
    if (!inc.resolvedPath) {
      diagnostics.push(Diagnostic.create(
        Range.create(Position.create(inc.line, inc.character), Position.create(inc.line, inc.character + inc.inputPath.length)),
        `Included deck file not found: '${inc.inputPath}'`,
        DiagnosticSeverity.Warning,
        'abaqus'
      ));
    }
  }

  return diagnostics;
}

module.exports = { validateDocument };
