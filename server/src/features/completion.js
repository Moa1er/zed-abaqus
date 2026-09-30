// completion provider for abaqus input decks

const { CompletionItemKind, InsertTextFormat } = require('vscode-languageserver');
const { keywords } = require('../catalog/keywords');

// common output variable identifiers
const NODE_OUTPUT_VARS = [
  { label: 'U', detail: 'Translations and rotations (displacements)' },
  { label: 'RF', detail: 'Reaction forces and moments' },
  { label: 'CF', detail: 'Point load forces and moments' },
  { label: 'V', detail: 'Translational and rotational velocities' },
  { label: 'A', detail: 'Translational and rotational accelerations' },
  { label: 'NT', detail: 'Nodal temperatures' },
  { label: 'COORD', detail: 'Current coordinates of nodes' }
];

const ELEMENT_OUTPUT_VARS = [
  { label: 'S', detail: 'All stress components (Cauchy / True stress)' },
  { label: 'E', detail: 'Total strain components' },
  { label: 'LE', detail: 'Logarithmic strain components' },
  { label: 'NE', detail: 'Nominal strain components' },
  { label: 'PE', detail: 'Plastic strain components' },
  { label: 'PEEQ', detail: 'Equivalent plastic strain' },
  { label: 'ENER', detail: 'All energy densities' },
  { label: 'SDV', detail: 'Solution-dependent state variables' },
  { label: 'STATUS', detail: 'Element failure status (0 = failed, 1 = active)' }
];

function getCompletions(workspace, uri, position) {
  const context = workspace.getContextAtPosition(uri, position);
  if (!context || context.kind === 'comment') return [];

  const items = [];

  // 1. keyword completion (starts with *)
  if (context.kind === 'keyword') {
    const rawSearch = context.prefix.trim().toUpperCase();
    const query = rawSearch.startsWith('*') ? rawSearch.slice(1) : rawSearch;

    for (const [kwName, kw] of Object.entries(keywords)) {
      const bareName = kwName.slice(1);
      if (bareName.includes(query) || query === '') {
        items.push({
          label: kwName,
          kind: CompletionItemKind.Keyword,
          detail: 'Abaqus keyword',
          documentation: {
            kind: 'markdown',
            value: kw.description + (kw.dataLineFormat ? `\n\nData format: \`${kw.dataLineFormat}\`` : '')
          },
          insertText: kwName
        });
      }
    }
    return items;
  }

  // 2. parameter name completion
  if (context.kind === 'parameter_name') {
    const kwDef = keywords[context.keyword];
    if (kwDef && kwDef.parameters) {
      // detect already specified parameters on this line
      const lineTokens = context.line.toLowerCase().split(',');
      const usedParams = new Set();
      for (const tok of lineTokens) {
        const eqIdx = tok.indexOf('=');
        const key = (eqIdx >= 0 ? tok.slice(0, eqIdx) : tok).trim();
        usedParams.add(key);
      }

      for (const [paramName, param] of Object.entries(kwDef.parameters)) {
        if (!usedParams.has(paramName.toLowerCase())) {
          const takesValue = param.type !== 'flag';
          items.push({
            label: paramName,
            kind: CompletionItemKind.Property,
            detail: param.type === 'flag' ? 'Flag' : `Parameter (${param.choices ? param.choices.join(' | ') : 'value'})`,
            documentation: {
              kind: 'markdown',
              value: param.description + (param.required ? '\n\n*(Required)*' : '')
            },
            insertText: takesValue ? `${paramName}=$1` : paramName,
            insertTextFormat: takesValue ? InsertTextFormat.Snippet : InsertTextFormat.PlainText
          });
        }
      }
    }
    return items;
  }

  // 3. parameter value completion (after key=)
  if (context.kind === 'parameter_value') {
    const paramKey = context.paramName.toLowerCase();
    const kwDef = keywords[context.keyword];

    // check if parameter has static choices defined
    if (kwDef && kwDef.parameters && kwDef.parameters[paramKey]) {
      const paramDef = kwDef.parameters[paramKey];
      if (paramDef.choices) {
        for (const choice of paramDef.choices) {
          items.push({
            label: choice,
            kind: CompletionItemKind.EnumMember,
            detail: `Allowed choice for ${paramKey}`,
            insertText: choice
          });
        }
      }
    }

    // dynamic workspace symbol suggestions
    // materials
    if (paramKey === 'material') {
      for (const [_, mat] of workspace.getAllSymbols('materials')) {
        items.push({
          label: mat.name,
          kind: CompletionItemKind.Class,
          detail: 'Defined material',
          insertText: mat.name
        });
      }
    }

    // element sets
    if (paramKey === 'elset') {
      for (const [_, elset] of workspace.getAllSymbols('elsets')) {
        items.push({
          label: elset.name,
          kind: CompletionItemKind.Variable,
          detail: 'Defined element set',
          insertText: elset.name
        });
      }
    }

    // node sets
    if (paramKey === 'nset') {
      for (const [_, nset] of workspace.getAllSymbols('nsets')) {
        items.push({
          label: nset.name,
          kind: CompletionItemKind.Variable,
          detail: 'Defined node set',
          insertText: nset.name
        });
      }
    }

    // amplitudes
    if (paramKey === 'amplitude') {
      for (const [_, amp] of workspace.getAllSymbols('amplitudes')) {
        items.push({
          label: amp.name,
          kind: CompletionItemKind.Value,
          detail: 'Defined amplitude curve',
          insertText: amp.name
        });
      }
    }

    // parts and instances
    if (paramKey === 'part') {
      for (const [_, part] of workspace.getAllSymbols('parts')) {
        items.push({
          label: part.name,
          kind: CompletionItemKind.Module,
          detail: 'Defined part',
          insertText: part.name
        });
      }
    }
    if (paramKey === 'instance') {
      for (const [_, inst] of workspace.getAllSymbols('instances')) {
        items.push({
          label: inst.name,
          kind: CompletionItemKind.Reference,
          detail: 'Defined part instance',
          insertText: inst.name
        });
      }
    }

    // orientations
    if (paramKey === 'orientation') {
      for (const [_, ori] of workspace.getAllSymbols('orientations')) {
        items.push({
          label: ori.name,
          kind: CompletionItemKind.Reference,
          detail: 'Defined orientation system',
          insertText: ori.name
        });
      }
    }

    // surface interactions
    if (paramKey === 'interaction') {
      for (const [_, inter] of workspace.getAllSymbols('surfaceInteractions')) {
        items.push({
          label: inter.name,
          kind: CompletionItemKind.Reference,
          detail: 'Defined surface interaction',
          insertText: inter.name
        });
      }
    }

    // surfaces
    if (paramKey === 'surface' || paramKey === 'master' || paramKey === 'slave') {
      for (const [_, surf] of workspace.getAllSymbols('surfaces')) {
        items.push({
          label: surf.name,
          kind: CompletionItemKind.Interface,
          detail: 'Defined surface',
          insertText: surf.name
        });
      }
    }

    return items;
  }

  // 4. data line completion for output requests or sets
  if (context.kind === 'data_line') {
    if (context.parentKeyword === '*NODE OUTPUT') {
      for (const v of NODE_OUTPUT_VARS) {
        items.push({
          label: v.label,
          kind: CompletionItemKind.Variable,
          detail: v.detail,
          insertText: v.label
        });
      }
    } else if (context.parentKeyword === '*ELEMENT OUTPUT') {
      for (const v of ELEMENT_OUTPUT_VARS) {
        items.push({
          label: v.label,
          kind: CompletionItemKind.Variable,
          detail: v.detail,
          insertText: v.label
        });
      }
    } else if (context.parentKeyword === '*BOUNDARY' || context.parentKeyword === '*CLOAD') {
      const doc = workspace.getDocument(uri);
      if (doc) {
        for (const [_, nset] of doc.symbols.nsets) {
          items.push({
            label: nset.name,
            kind: CompletionItemKind.Variable,
            detail: 'Node set reference',
            insertText: nset.name
          });
        }
      }
    }
    return items;
  }

  return items;
}

module.exports = { getCompletions };
