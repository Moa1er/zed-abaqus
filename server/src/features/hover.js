// hover documentation provider for abaqus input decks

const { keywords } = require('../catalog/keywords');

function getHover(workspace, uri, position) {
  const doc = workspace.getDocument(uri);
  if (!doc) return null;

  const line = doc.lines[position.line] || '';
  if (line.trim().startsWith('**')) return null;

  const wordObj = workspace.getWordAtPosition(uri, position);
  if (!wordObj) return null;

  const token = wordObj.word;
  const isKeywordLine = line.trim().startsWith('*');

  // 1. check if hovering over keyword name
  const firstComma = line.indexOf(',');
  const isBeforeComma = firstComma === -1 || position.character <= firstComma;

  if (isKeywordLine && isBeforeComma) {
    const rawKey = (firstComma >= 0 ? line.slice(0, firstComma) : line).trim().toUpperCase();
    const kwDef = keywords[rawKey];
    if (kwDef) {
      let md = `### \`${kwDef.name}\`\n\n${kwDef.description}`;
      if (kwDef.parameters && Object.keys(kwDef.parameters).length > 0) {
        md += '\n\n#### Parameters\n';
        for (const [pName, pDef] of Object.entries(kwDef.parameters)) {
          const reqStr = pDef.required ? ' *(required)*' : '';
          const choicesStr = pDef.choices ? ` [${pDef.choices.join(', ')}]` : '';
          md += `- \`${pName}\`${reqStr}${choicesStr}: ${pDef.description}\n`;
        }
      }
      if (kwDef.dataLineFormat) {
        md += `\n\n#### Data line format\n\`${kwDef.dataLineFormat}\``;
      }
      return {
        contents: {
          kind: 'markdown',
          value: md
        }
      };
    }
  }

  // 2. check if hovering over a parameter name on a keyword line
  if (isKeywordLine && !isBeforeComma) {
    const rawKey = (firstComma >= 0 ? line.slice(0, firstComma) : line).trim().toUpperCase();
    const kwDef = keywords[rawKey];
    if (kwDef && kwDef.parameters) {
      const paramKey = token.toLowerCase();
      const pDef = kwDef.parameters[paramKey];
      if (pDef) {
        let md = `### Parameter: \`${token}\` on \`${rawKey}\`\n\n${pDef.description}`;
        if (pDef.required) md += '\n\n*(Required parameter)*';
        if (pDef.choices) md += `\n\n**Allowed values:** \`${pDef.choices.join('`, `')}\``;
        if (pDef.default) md += `\n\n**Default:** \`${pDef.default}\``;
        return {
          contents: {
            kind: 'markdown',
            value: md
          }
        };
      }
    }
  }

  // 3. check if hovering over a referenced symbol (set, material, amplitude, part)
  const lowerToken = token.toLowerCase();
  for (const [type, label] of [
    ['materials', 'Material'],
    ['nsets', 'Node set'],
    ['elsets', 'Element set'],
    ['amplitudes', 'Amplitude curve'],
    ['steps', 'Analysis step'],
    ['parts', 'Part definition'],
    ['instances', 'Part instance'],
    ['surfaces', 'Surface'],
    ['orientations', 'Coordinate orientation'],
    ['surfaceInteractions', 'Surface interaction']
  ]) {
    const sym = workspace.findSymbol(type, lowerToken);
    if (sym) {
      return {
        contents: {
          kind: 'markdown',
          value: `### ${label}: \`${sym.name}\`\n\nDefined at line ${sym.line + 1} in \`${sym.uri.split('/').pop()}\`.`
        }
      };
    }
  }

  return null;
}

module.exports = { getHover };
