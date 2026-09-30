// end-to-end json-rpc stdio integration test for abaqus language server

const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

function runStdioTest() {
  console.log('starting json-rpc stdio integration test...');

  const serverScript = path.resolve(__dirname, '../src/index.js');
  const server = spawn('node', [serverScript], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  let buffer = '';
  let msgId = 1;
  const pendingRequests = new Map();
  const notifications = [];

  server.stdout.on('data', chunk => {
    buffer += chunk.toString('utf8');

    while (true) {
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) break;

      const headers = buffer.slice(0, headerEnd);
      const match = /Content-Length:\s*(\d+)/i.exec(headers);
      if (!match) break;

      const contentLength = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      if (buffer.length < bodyStart + contentLength) break;

      const bodyStr = buffer.slice(bodyStart, bodyStart + contentLength);
      buffer = buffer.slice(bodyStart + contentLength);

      const msg = JSON.parse(bodyStr);
      if (msg.id !== undefined && pendingRequests.has(msg.id)) {
        const resolve = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg);
      } else if (msg.method) {
        notifications.push(msg);
      }
    }
  });

  function sendRpc(method, params, isNotification = false) {
    return new Promise(resolve => {
      const payload = {
        jsonrpc: '2.0',
        method,
        params
      };

      if (!isNotification) {
        const id = msgId++;
        payload.id = id;
        pendingRequests.set(id, resolve);
      }

      const body = JSON.stringify(payload);
      const fullMsg = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
      server.stdin.write(fullMsg);

      if (isNotification) resolve();
    });
  }

  (async () => {
    try {
      // 1. send initialize request
      console.log('sending initialize request...');
      const initResp = await sendRpc('initialize', {
        processId: process.pid,
        rootUri: null,
        capabilities: {}
      });

      assert(initResp.result, 'server should return capabilities');
      assert.strictEqual(initResp.result.capabilities.hoverProvider, true);
      assert.strictEqual(initResp.result.capabilities.definitionProvider, true);
      assert.strictEqual(initResp.result.serverInfo.name, 'abaqus-language-server');
      console.log('initialize handshake passed');

      // notify initialized
      await sendRpc('initialized', {}, true);

      // 2. send textDocument/didOpen
      console.log('sending didOpen notification...');
      const docUri = 'file:///C:/test_deck.inp';
      const docText = [
        '*Heading',
        '** simple integration test',
        '*Material, name=Steel',
        '*Elastic',
        '210000.0, 0.3',
        '*Solid Section, elset=PartElset, material=Steel',
        '*Step, name=StaticStep, nlgeom=YES',
        '*Static',
        '0.1, 1.0',
        '*End Step'
      ].join('\n');

      await sendRpc('textDocument/didOpen', {
        textDocument: {
          uri: docUri,
          languageId: 'abaqus',
          version: 1,
          text: docText
        }
      }, true);

      // give server brief tick to index
      await new Promise(r => setTimeout(r, 50));
      console.log('document indexed cleanly');

      // 3. send completion request for keywords
      console.log('sending completion request for keywords...');
      const compResp = await sendRpc('textDocument/completion', {
        textDocument: { uri: docUri },
        position: { line: 0, character: 1 }
      });
      assert(Array.isArray(compResp.result), 'completions should be an array');
      assert(compResp.result.some(c => c.label === '*STEP'), 'should suggest *STEP');
      console.log('keyword completion passed over stdio');

      // 4. send completion request for material dynamic symbols
      console.log('sending completion request for material values...');
      // line 5 is: *Solid Section, elset=PartElset, material=Steel
      const matCompResp = await sendRpc('textDocument/completion', {
        textDocument: { uri: docUri },
        position: { line: 5, character: 48 } // cursor at material=
      });
      assert(matCompResp.result.some(c => c.label === 'Steel'), 'should suggest Steel material');
      console.log('dynamic material completion passed over stdio');

      // 5. send hover request
      console.log('sending hover request...');
      const hoverResp = await sendRpc('textDocument/hover', {
        textDocument: { uri: docUri },
        position: { line: 3, character: 3 } // *Elastic
      });
      assert(hoverResp.result && hoverResp.result.contents.value.includes('elastic'), 'expected elastic hover docs');
      console.log('hover passed over stdio');

      // 6. send definition request
      console.log('sending definition request...');
      const defResp = await sendRpc('textDocument/definition', {
        textDocument: { uri: docUri },
        position: { line: 5, character: 43 } // hovering on 'material=Steel' -> Steel
      });
      assert(defResp.result, 'definition should resolve Steel material');
      assert.strictEqual(defResp.result.range.start.line, 2);
      console.log('go-to-definition passed over stdio');

      // clean exit
      console.log('all stdio integration tests passed');
      server.kill();
      process.exit(0);
    } catch (err) {
      console.error('stdio test failed:', err);
      server.kill();
      process.exit(1);
    }
  })();
}

runStdioTest();
