// workspace document manager and symbol indexer for abaqus input decks

const fs = require('fs');
const path = require('path');
const { fileURLToPath, pathToFileURL } = require('url');

class AbaqusWorkspace {
  constructor() {
    // map of uri -> document model
    this.documents = new Map();
    // workspace root directories
    this.workspaceFolders = [];
  }

  setWorkspaceFolders(folders) {
    this.workspaceFolders = folders.map(f => {
      if (typeof f === 'string') return f.startsWith('file://') ? fileURLToPath(f) : f;
      return f.uri.startsWith('file://') ? fileURLToPath(f.uri) : f.uri;
    });
    this.scanWorkspaceFolders();
  }

  // scan project files in background to pre-populate index
  scanWorkspaceFolders() {
    for (const folder of this.workspaceFolders) {
      this.scanDirectory(folder, 0);
    }
  }

  scanDirectory(dir, depth) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this.scanDirectory(full, depth + 1);
        } else if (/\.(inp|inc|incl)$/i.test(entry.name)) {
          const fileUri = pathToFileURL(full).href;
          if (!this.documents.has(fileUri)) {
            try {
              const text = fs.readFileSync(full, 'utf8');
              this.updateDocument(fileUri, text);
            } catch {
              // ignore unreadable file
            }
          }
        }
      }
    } catch {
      // ignore inaccessible directory
    }
  }

  updateDocument(uri, text) {
    const symbols = this.extractSymbols(text, uri);
    this.documents.set(uri, {
      uri,
      text,
      lines: text.split(/\r?\n/),
      symbols
    });

    // load and index included files automatically
    for (const inc of symbols.includes) {
      if (inc.targetUri && !this.documents.has(inc.targetUri) && inc.resolvedPath) {
        try {
          const incContent = fs.readFileSync(inc.resolvedPath, 'utf8');
          this.updateDocument(inc.targetUri, incContent);
        } catch {
          // ignore unreadable include file
        }
      }
    }

    return symbols;
  }

  removeDocument(uri) {
    this.documents.delete(uri);
  }

  getDocument(uri) {
    return this.documents.get(uri);
  }

  // extracts named entities (materials, sets, steps, parts, amplitudes, surfaces, includes)
  extractSymbols(text, uri) {
    const lines = text.split(/\r?\n/);
    const symbols = {
      materials: new Map(),
      nsets: new Map(),
      elsets: new Map(),
      steps: new Map(),
      parts: new Map(),
      instances: new Map(),
      amplitudes: new Map(),
      surfaces: new Map(),
      orientations: new Map(),
      surfaceInteractions: new Map(),
      includes: []
    };

    let docDir = null;
    try {
      if (uri.startsWith('file://')) {
        docDir = path.dirname(fileURLToPath(uri));
      }
    } catch {
      docDir = null;
    }

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (!line.startsWith('*') || line.startsWith('**')) continue;

      // parse keyword and parameter pairs on this line
      const parts = line.split(',');
      const keywordRaw = parts[0].trim().toUpperCase();

      for (let p = 1; p < parts.length; p++) {
        const paramStr = parts[p].trim();
        const eqIdx = paramStr.indexOf('=');
        if (eqIdx === -1) continue;

        const key = paramStr.slice(0, eqIdx).trim().toLowerCase();
        let val = paramStr.slice(eqIdx + 1).trim();
        // strip surrounding quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1).trim();
        }

        // calculate column position where value starts
        const charIndex = lines[lineIndex].indexOf(paramStr);
        const valOffset = paramStr.indexOf(val);
        const valCol = charIndex >= 0 && valOffset >= 0 ? charIndex + valOffset : (charIndex >= 0 ? charIndex : 0);
        const loc = { uri, line: lineIndex, character: valCol, value: val };

        if (keywordRaw === '*MATERIAL' && key === 'name') {
          symbols.materials.set(val.toLowerCase(), { ...loc, name: val });
        } else if ((keywordRaw === '*NSET' || keywordRaw === '*NODE') && (key === 'nset' || key === 'name')) {
          symbols.nsets.set(val.toLowerCase(), { ...loc, name: val });
        } else if ((keywordRaw === '*ELSET' || keywordRaw === '*ELEMENT') && (key === 'elset' || key === 'name')) {
          symbols.elsets.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*STEP' && key === 'name') {
          symbols.steps.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*PART' && key === 'name') {
          symbols.parts.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*INSTANCE' && key === 'name') {
          symbols.instances.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*AMPLITUDE' && key === 'name') {
          symbols.amplitudes.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*SURFACE' && key === 'name') {
          symbols.surfaces.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*ORIENTATION' && key === 'name') {
          symbols.orientations.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*SURFACE INTERACTION' && key === 'name') {
          symbols.surfaceInteractions.set(val.toLowerCase(), { ...loc, name: val });
        } else if (keywordRaw === '*INCLUDE' && key === 'input') {
          let resolved = null;
          if (docDir) {
            const candidate = path.resolve(docDir, val);
            if (fs.existsSync(candidate)) resolved = candidate;
          }
          if (!resolved && this.workspaceFolders.length > 0) {
            for (const folder of this.workspaceFolders) {
              const candidate = path.resolve(folder, val);
              if (fs.existsSync(candidate)) {
                resolved = candidate;
                break;
              }
            }
          }
          symbols.includes.push({
            ...loc,
            inputPath: val,
            resolvedPath: resolved,
            targetUri: resolved ? pathToFileURL(resolved).href : null
          });
        }
      }
    }

    return symbols;
  }

  // search across all open and included documents for a symbol
  findSymbol(type, name) {
    const needle = name.toLowerCase();
    for (const [_, doc] of this.documents) {
      const map = doc.symbols[type];
      if (map && map.has(needle)) {
        return map.get(needle);
      }
    }
    return null;
  }

  // collect all symbols of a given kind across the whole workspace
  getAllSymbols(type) {
    const results = new Map();
    for (const [_, doc] of this.documents) {
      const map = doc.symbols[type];
      if (map) {
        for (const [key, sym] of map) {
          if (!results.has(key)) {
            results.set(key, sym);
          }
        }
      }
    }
    return results;
  }

  // inspect line and cursor to find editing context
  getContextAtPosition(uri, position) {
    const doc = this.documents.get(uri);
    if (!doc) return null;

    const line = doc.lines[position.line] || '';
    const prefix = line.slice(0, position.character);

    // check if this is a comment line
    if (line.trim().startsWith('**')) {
      return { kind: 'comment', line, position };
    }

    // check if this is a keyword line
    const isKeywordLine = line.trim().startsWith('*');

    if (isKeywordLine) {
      const firstComma = line.indexOf(',');
      const keywordRaw = (firstComma >= 0 ? line.slice(0, firstComma) : line).trim().toUpperCase();

      // cursor is still typing keyword name
      if (firstComma === -1 || position.character <= firstComma) {
        return {
          kind: 'keyword',
          keyword: keywordRaw,
          prefix,
          line,
          position
        };
      }

      // cursor is in parameter list
      // check if typing parameter value (after '=')
      const beforeCursor = prefix;
      const lastComma = beforeCursor.lastIndexOf(',');
      const currentChunk = beforeCursor.slice(lastComma + 1).trim();
      const lastEq = currentChunk.lastIndexOf('=');

      if (lastEq >= 0) {
        const paramName = currentChunk.slice(0, lastEq).trim().toLowerCase();
        const valuePrefix = currentChunk.slice(lastEq + 1).trim();
        return {
          kind: 'parameter_value',
          keyword: keywordRaw,
          paramName,
          valuePrefix,
          line,
          position
        };
      }

      // cursor is typing a parameter name
      return {
        kind: 'parameter_name',
        keyword: keywordRaw,
        paramPrefix: currentChunk,
        line,
        position
      };
    }

    // cursor is on a data line; find preceding active keyword
    let parentKeyword = null;
    for (let i = position.line - 1; i >= 0; i--) {
      const prev = doc.lines[i].trim();
      if (prev.startsWith('*') && !prev.startsWith('**')) {
        const comma = prev.indexOf(',');
        parentKeyword = (comma >= 0 ? prev.slice(0, comma) : prev).trim().toUpperCase();
        break;
      }
    }

    return {
      kind: 'data_line',
      parentKeyword,
      line,
      position
    };
  }

  // extracts token identifier under cursor
  getWordAtPosition(uri, position) {
    const doc = this.documents.get(uri);
    if (!doc) return null;

    const line = doc.lines[position.line] || '';
    let start = position.character;
    let end = position.character;

    // match word characters including hyphens and dots
    const isWordChar = c => /[a-zA-Z0-9_\-\.]/.test(c);

    while (start > 0 && isWordChar(line[start - 1])) {
      start--;
    }
    while (end < line.length && isWordChar(line[end])) {
      end++;
    }

    const word = line.slice(start, end);
    return word ? { word, start, end, line: position.line } : null;
  }
}

module.exports = { AbaqusWorkspace };
