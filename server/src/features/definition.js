// go-to-definition provider for abaqus input decks

const { Range, Position } = require('vscode-languageserver');

function getDefinition(workspace, uri, position) {
  const doc = workspace.getDocument(uri);
  if (!doc) return null;

  const line = doc.lines[position.line] || '';
  if (line.trim().startsWith('**')) return null;

  // 1. check if cursor is on an include path line
  if (line.toUpperCase().includes('*INCLUDE')) {
    for (const inc of doc.symbols.includes) {
      if (inc.line === position.line && inc.targetUri) {
        return {
          uri: inc.targetUri,
          range: Range.create(Position.create(0, 0), Position.create(0, 0))
        };
      }
    }
  }

  // 2. get token identifier under cursor
  const wordObj = workspace.getWordAtPosition(uri, position);
  if (!wordObj) return null;

  const token = wordObj.word.toLowerCase();

  // 3. search symbol tables across workspace documents
  const symbolTypes = ['materials', 'elsets', 'nsets', 'amplitudes', 'steps', 'parts', 'instances', 'surfaces', 'orientations', 'surfaceInteractions'];

  for (const type of symbolTypes) {
    const sym = workspace.findSymbol(type, token);
    if (sym) {
      return {
        uri: sym.uri,
        range: Range.create(
          Position.create(sym.line, sym.character),
          Position.create(sym.line, sym.character + sym.name.length)
        )
      };
    }
  }

  return null;
}

module.exports = { getDefinition };
