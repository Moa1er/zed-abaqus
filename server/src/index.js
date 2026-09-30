// main language server protocol entry point for abaqus input decks

const {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind
} = require('vscode-languageserver/node');
const { TextDocument } = require('vscode-languageserver-textdocument');
const { AbaqusWorkspace } = require('./workspace');
const { getCompletions } = require('./features/completion');
const { getHover } = require('./features/hover');
const { getDefinition } = require('./features/definition');
const { validateDocument } = require('./features/diagnostics');

// optional diagnostic file log for debugging language server requests
const fs = require('fs');
const path = require('path');
const logDir = path.join(process.env.LOCALAPPDATA || '.', 'Zed', 'logs');
const logPath = path.join(logDir, 'abaqus-lsp.log');
function log(msg) {
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

// initialize connection over stdio streams
const connection = createConnection(process.stdin, process.stdout);
const workspace = new AbaqusWorkspace();

connection.onInitialize(params => {
  log(`initialize request received from client (root: ${params.rootUri || 'none'})`);
  if (params.workspaceFolders) {
    workspace.setWorkspaceFolders(params.workspaceFolders);
  }

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        triggerCharacters: ['*', ',', '=', ' '],
        resolveProvider: false
      },
      hoverProvider: true,
      definitionProvider: true
    },
    serverInfo: {
      name: 'abaqus-language-server',
      version: '0.1.0'
    }
  };
});

connection.onInitialized(() => {
  log('connection initialized');
});

// open and change document handling
connection.onDidOpenTextDocument(params => {
  log(`didOpen: ${params.textDocument.uri}`);
  workspace.updateDocument(params.textDocument.uri, params.textDocument.text);
  const diagnostics = validateDocument(workspace, params.textDocument.uri);
  log(`publishing ${diagnostics.length} diagnostics for ${params.textDocument.uri}`);
  connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics });
});

connection.onDidChangeTextDocument(params => {
  // with full textDocumentSync, contentChanges[0].text is full document
  const change = params.contentChanges[0];
  if (change) {
    workspace.updateDocument(params.textDocument.uri, change.text);
    const diagnostics = validateDocument(workspace, params.textDocument.uri);
    connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics });
  }
});

connection.onDidCloseTextDocument(params => {
  log(`didClose: ${params.textDocument.uri}`);
  workspace.removeDocument(params.textDocument.uri);
});

// request handlers
connection.onCompletion(params => {
  log(`completion requested at line ${params.position.line}, col ${params.position.character}`);
  const items = getCompletions(workspace, params.textDocument.uri, params.position);
  log(`returning ${items.length} completion items`);
  return items;
});

connection.onHover(params => {
  log(`hover requested at line ${params.position.line}, col ${params.position.character}`);
  return getHover(workspace, params.textDocument.uri, params.position);
});

connection.onDefinition(params => {
  log(`definition requested at line ${params.position.line}, col ${params.position.character}`);
  return getDefinition(workspace, params.textDocument.uri, params.position);
});

// start connection listener
connection.listen();
log('abaqus language server started and listening on stdio');
