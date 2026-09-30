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

// initialize connection over stdio streams
const connection = createConnection(process.stdin, process.stdout);
const workspace = new AbaqusWorkspace();

connection.onInitialize(params => {
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
  // connection is ready
});

// open and change document handling
connection.onDidOpenTextDocument(params => {
  workspace.updateDocument(params.textDocument.uri, params.textDocument.text);
  const diagnostics = validateDocument(workspace, params.textDocument.uri);
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
  workspace.removeDocument(params.textDocument.uri);
});

// request handlers
connection.onCompletion(params => {
  return getCompletions(workspace, params.textDocument.uri, params.position);
});

connection.onHover(params => {
  return getHover(workspace, params.textDocument.uri, params.position);
});

connection.onDefinition(params => {
  return getDefinition(workspace, params.textDocument.uri, params.position);
});

// start connection listener
connection.listen();
