// automated test suite for abaqus language server

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const { AbaqusWorkspace } = require('../src/workspace');
const { getCompletions } = require('../src/features/completion');
const { getHover } = require('../src/features/hover');
const { getDefinition } = require('../src/features/definition');
const { validateDocument } = require('../src/features/diagnostics');

function runLspTests() {
  console.log('starting abaqus language server test suite...');
  const workspace = new AbaqusWorkspace();

  const fixturePath = path.resolve(__dirname, '../../examples/compression_test_ogden.inp');
  const fixtureText = fs.readFileSync(fixturePath, 'utf8');
  const fixtureUri = pathToFileURL(fixturePath).href;

  workspace.updateDocument(fixtureUri, fixtureText);

  // 1. test keyword completions
  console.log('testing keyword completions...');
  const kwCompletions = getCompletions(workspace, fixtureUri, { line: 0, character: 1 });
  assert(kwCompletions.length > 20, 'expected abundant keyword suggestions when typing *');
  assert(kwCompletions.some(c => c.label === '*STEP'), 'expected *STEP in completions');
  assert(kwCompletions.some(c => c.label === '*MATERIAL'), 'expected *MATERIAL in completions');
  console.log(`keyword completions passed (${kwCompletions.length} keywords found)`);

  // 2. test parameter name completions
  console.log('testing parameter completions...');
  const paramTestDeck = '*Step, \n*End Step\n';
  const paramUri = 'file:///dummy/param.inp';
  workspace.updateDocument(paramUri, paramTestDeck);

  const paramCompletions = getCompletions(workspace, paramUri, { line: 0, character: 7 });
  assert(paramCompletions.some(c => c.label === 'name'), 'expected name parameter on *Step');
  assert(paramCompletions.some(c => c.label === 'nlgeom'), 'expected nlgeom parameter on *Step');
  assert(paramCompletions.some(c => c.label === 'inc'), 'expected inc parameter on *Step');
  console.log('parameter name completions passed');

  // 3. test parameter choices / boolean completions
  console.log('testing parameter value completions...');
  const choiceTestDeck = '*Step, nlgeom=\n*End Step\n';
  workspace.updateDocument(paramUri, choiceTestDeck);
  const choiceCompletions = getCompletions(workspace, paramUri, { line: 0, character: 15 });
  assert(choiceCompletions.some(c => c.label === 'YES'), 'expected YES choice for nlgeom');
  assert(choiceCompletions.some(c => c.label === 'NO'), 'expected NO choice for nlgeom');
  console.log('parameter choices completions passed');

  // 4. test dynamic symbol completion (materials & sets)
  console.log('testing dynamic workspace symbol completion...');
  const symbolTestDeck = fixtureText + '\n*Solid Section, elset=SolidSpecimen, material=\n';
  workspace.updateDocument(fixtureUri, symbolTestDeck);
  const lines = symbolTestDeck.split('\n');
  const lastLineIdx = lines.length - 2;
  const matCompletions = getCompletions(workspace, fixtureUri, { line: lastLineIdx, character: lines[lastLineIdx].length });
  assert(matCompletions.some(c => c.label === 'Rubber-Ogden'), 'expected Rubber-Ogden in material completions');
  console.log('dynamic material completion passed');

  // 5. test hover documentation
  console.log('testing hover documentation...');
  const kwHover = getHover(workspace, fixtureUri, { line: 38, character: 5 }); // *Hyperelastic
  assert(kwHover && kwHover.contents.value.includes('hyperelastic'), 'expected hover docs for *Hyperelastic');

  const paramHover = getHover(workspace, fixtureUri, { line: 38, character: 18 }); // ogden
  assert(paramHover && paramHover.contents.value.includes('Ogden'), 'expected hover docs for ogden parameter');

  const symHover = getHover(workspace, fixtureUri, { line: 16, character: 48 }); // Rubber-Ogden reference
  assert(symHover && symHover.contents.value.includes('Material'), 'expected hover info for Rubber-Ogden reference');
  console.log('hover documentation passed');

  // 6. test go-to-definition
  console.log('testing go-to-definition...');
  // line 16 has: *Solid Section, elset=SolidSpecimen, material=Rubber-Ogden
  const defResult = getDefinition(workspace, fixtureUri, { line: 16, character: 48 });
  assert(defResult, 'expected definition location for Rubber-Ogden');
  assert.strictEqual(defResult.range.start.line, 37, 'expected definition to point to line 38 (*Material, name=Rubber-Ogden)');

  // test set definition
  const setDefResult = getDefinition(workspace, fixtureUri, { line: 16, character: 25 }); // SolidSpecimen
  assert(setDefResult, 'expected definition location for SolidSpecimen');
  console.log('go-to-definition passed');

  // 7. test diagnostics validation
  console.log('testing diagnostics validation...');
  // unclosed step
  const unclosedDeck = '*Heading\n*Step, name=Test\n*Static\n0.1, 1.0\n';
  const unclosedUri = 'file:///dummy/unclosed.inp';
  workspace.updateDocument(unclosedUri, unclosedDeck);
  const unclosedDiags = validateDocument(workspace, unclosedUri);
  assert(unclosedDiags.some(d => d.message.includes('Unclosed *STEP block')), 'expected unclosed step diagnostic');

  // missing required parameter
  const missingParamDeck = '*Part\n*Node\n1, 0, 0, 0\n*End Part\n';
  const missingUri = 'file:///dummy/missing.inp';
  workspace.updateDocument(missingUri, missingParamDeck);
  const missingDiags = validateDocument(workspace, missingUri);
  assert(missingDiags.some(d => d.message.includes("Missing required parameter 'name'")), 'expected missing name diagnostic on *Part');

  // invalid enum choice validation
  const invalidChoiceDeck = '*Step, name=Test, nlgeom=MAYBE\n*End Step\n';
  const invalidUri = 'file:///dummy/invalid.inp';
  workspace.updateDocument(invalidUri, invalidChoiceDeck);
  const choiceDiags = validateDocument(workspace, invalidUri);
  assert(choiceDiags.some(d => d.message.includes("Invalid value 'MAYBE' for parameter 'nlgeom'")), 'expected invalid enum choice diagnostic');

  // duplicate name validation
  const duplicateDeck = '*Part, name=Bracket\n*End Part\n*Part, name=Bracket\n*End Part\n';
  const duplicateUri = 'file:///dummy/dup.inp';
  workspace.updateDocument(duplicateUri, duplicateDeck);
  const dupDiags = validateDocument(workspace, duplicateUri);
  assert(dupDiags.some(d => d.message.includes("Duplicate part name 'Bracket'")), 'expected duplicate part name diagnostic');

  // unclosed coupling block
  const unclosedCouplingDeck = '*Coupling, name=C1, ref node=100, surface=TopFace\n';
  const couplingUri = 'file:///dummy/coupling.inp';
  workspace.updateDocument(couplingUri, unclosedCouplingDeck);
  const couplingDiags = validateDocument(workspace, couplingUri);
  assert(couplingDiags.some(d => d.message.includes('Unclosed *COUPLING block')), 'expected unclosed coupling block diagnostic');

  // cross-file include resolution and definition
  const tmpDir = path.resolve(__dirname, 'temp_test_model');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const matFile = path.join(tmpDir, 'materials.inc');
  const mainFile = path.join(tmpDir, 'main.inp');
  fs.writeFileSync(matFile, '*Material, name=Titanium\n*Elastic\n110000.0, 0.34\n', 'utf8');
  fs.writeFileSync(mainFile, '*Heading\n*Include, input=materials.inc\n*Solid Section, elset=Wing, material=Titanium\n', 'utf8');

  const mainUri = pathToFileURL(mainFile).href;
  workspace.updateDocument(mainUri, fs.readFileSync(mainFile, 'utf8'));

  // verify material from included file is resolved
  const crossDef = getDefinition(workspace, mainUri, { line: 2, character: 43 }); // Titanium
  assert(crossDef, 'expected cross-file definition for Titanium');
  assert(crossDef.uri.includes('materials.inc'), 'expected definition to point to materials.inc');

  // clean up temp files
  try {
    fs.unlinkSync(matFile);
    fs.unlinkSync(mainFile);
    fs.rmdirSync(tmpDir);
  } catch {}

  // clean deck validation
  workspace.updateDocument(fixtureUri, fixtureText);
  const cleanDiags = validateDocument(workspace, fixtureUri);
  const errorsOnly = cleanDiags.filter(d => d.severity === 1);
  assert.strictEqual(errorsOnly.length, 0, 'expected zero error diagnostics on clean compression fixture');
  console.log('diagnostics and cross-file validation passed');

  console.log('all language server tests passed successfully');
}

runLspTests();
