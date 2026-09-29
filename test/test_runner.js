// test runner for zed-abaqus extension and tree-sitter parser

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// helper to run commands cleanly
function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

function runTests() {
  console.log('starting abaqus extension test suite...');
  const repoRoot = path.resolve(__dirname, '..');
  const treeSitterDir = path.join(repoRoot, 'tree-sitter-abaqus');

  let passedAll = true;

  // 1. run tree-sitter corpus tests
  console.log('running tree-sitter corpus tests...');
  try {
    const output = run('npx tree-sitter-cli test', treeSitterDir);
    console.log('corpus tests completed successfully');
  } catch (err) {
    console.error('corpus tests failed:\n' + err.stdout + '\n' + err.stderr);
    passedAll = false;
  }

  // 2. parse examples
  const exampleFiles = [
    path.join(repoRoot, 'examples', 'compression_test_ogden.inp'),
    path.join(repoRoot, 'examples', 'assembly_multistep.inp'),
    path.join(repoRoot, 'examples', 'edge_cases.inp')
  ];

  console.log('testing example decks...');
  for (const file of exampleFiles) {
    try {
      const relPath = path.relative(treeSitterDir, file);
      run(`npx tree-sitter-cli parse "${relPath}"`, treeSitterDir);
      console.log(`parsed example cleanly: ${path.basename(file)}`);
    } catch (err) {
      console.error(`error parsing example: ${path.basename(file)}\n` + err.stdout);
      passedAll = false;
    }
  }

  // 3. parse user compression fixture if accessible
  const userFixture = 'C:\\github\\variousScripts\\monica-projects\\MPI_template\\CompressionTest_Ogden.inp';
  if (fs.existsSync(userFixture)) {
    console.log('found user CompressionTest_Ogden.inp fixture, testing parse...');
    try {
      run(`npx tree-sitter-cli parse "${userFixture}"`, treeSitterDir);
      console.log('user CompressionTest_Ogden.inp parsed with zero errors');
    } catch (err) {
      console.error('user CompressionTest_Ogden.inp parse failed:\n' + err.stdout);
      passedAll = false;
    }
  } else {
    console.log('user CompressionTest_Ogden.inp not found at expected location, skipped');
  }

  // 4. validate highlight and outline queries
  console.log('testing highlight and outline queries...');
  try {
    const sample = path.join(repoRoot, 'examples', 'compression_test_ogden.inp');
    const highlightsQuery = path.join(repoRoot, 'languages', 'abaqus', 'highlights.scm');
    const outlineQuery = path.join(repoRoot, 'languages', 'abaqus', 'outline.scm');

    const hlOut = run(`npx tree-sitter-cli query "${highlightsQuery}" "${path.join(repoRoot, 'examples', 'assembly_multistep.inp')}"`, treeSitterDir);
    if (!hlOut.includes('PreloadStep') || !hlOut.includes('LoadStep')) {
      throw new Error('expected step keywords to be matched in highlights query');
    }
    console.log('highlights query compiled and matched successfully');

    const outlineOut = run(`npx tree-sitter-cli query "${outlineQuery}" "${path.join(repoRoot, 'examples', 'assembly_multistep.inp')}"`, treeSitterDir);
    if (!outlineOut.includes('PlatePart') || !outlineOut.includes('MainAssembly') || !outlineOut.includes('PreloadStep')) {
      throw new Error('expected parts, assembly and steps in outline query output');
    }
    console.log('outline query compiled and matched successfully');

    // test special characters in parameters and heading titles
    console.log('testing edge case syntax with special characters...');
    const edgeCaseSnippet = '*Heading\nspecimen #1 (test @ 25C) [series-A]\n*Material, name=Steel(AISI304)\n*Include, input=C:\\Program Files (x86)\\submodel.inp\n';
    const edgeTemp = path.join(treeSitterDir, 'temp_edge.inp');
    fs.writeFileSync(edgeTemp, edgeCaseSnippet, 'utf8');
    const parseOut = run(`npx tree-sitter-cli parse temp_edge.inp`, treeSitterDir);
    fs.unlinkSync(edgeTemp);
    if (parseOut.includes('ERROR')) {
      throw new Error('unexpected ERROR in edge case parsing: ' + parseOut);
    }
    console.log('edge case syntax parsed with zero errors');
  } catch (err) {
    console.error('query evaluation failed:\n' + err.stdout);
    passedAll = false;
  }

  // 5. parser recovery on incomplete / malformed inputs
  console.log('testing parser recovery during editing...');
  const recoveryCases = [
    // incomplete keyword line with bare asterisk
    '*Heading\n*\n*Node\n1, 0., 0., 0.\n',
    // unclosed parameter value
    '*Step, name=\n*Static\n*End Step\n',
    // data line with missing value
    '*Node\n1, ,\n2, 1.0, 2.0, 3.0\n',
    // keyword missing *end step
    '*Step, name=UnclosedStep\n*Static\n0.1, 1.0\n'
  ];

  const tempFile = path.join(treeSitterDir, 'temp_recovery.inp');
  for (let i = 0; i < recoveryCases.length; i++) {
    fs.writeFileSync(tempFile, recoveryCases[i], 'utf8');
    try {
      run(`npx tree-sitter-cli parse temp_recovery.inp`, treeSitterDir);
      console.log(`recovery case ${i + 1} parsed without crashing`);
    } catch (err) {
      // tree-sitter exits with code 1 if tree contains ERROR node, but it still parses the rest
      if (err.stdout && (err.stdout.includes('source_file') || err.stdout.includes('ERROR'))) {
        console.log(`recovery case ${i + 1} recovered and produced syntax tree with error node`);
      } else {
        console.error(`recovery case ${i + 1} crashed:\n` + err.message);
        passedAll = false;
      }
    }
  }
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }

  // 6. benchmark on a generated large mesh deck
  console.log('generating large mesh benchmark...');
  const numNodes = 25000;
  const numElements = 20000;
  const meshLines = [
    '*Heading',
    ' benchmark large mesh input deck',
    '*Node'
  ];

  for (let i = 1; i <= numNodes; i++) {
    meshLines.push(`${i}, ${(i * 0.1).toFixed(4)}, ${(i * 0.2).toFixed(4)}, ${(i * 0.3).toFixed(4)}`);
  }

  meshLines.push('*Element, type=C3D8, elset=BenchmarkSet');
  for (let i = 1; i <= numElements; i++) {
    meshLines.push(`${i}, 1, 2, 3, 4, 5, 6, 7, 8`);
  }

  meshLines.push('*End Step');
  const benchPath = path.join(treeSitterDir, 'benchmark_mesh.inp');
  fs.writeFileSync(benchPath, meshLines.join('\n') + '\n', 'utf8');

  const stats = fs.statSync(benchPath);
  const fileSizeKb = (stats.size / 1024).toFixed(1);
  console.log(`benchmark deck created: ${fileSizeKb} kb, ${numNodes} nodes, ${numElements} elements`);

  console.log('timing tree-sitter parse on large mesh...');
  const t0 = process.hrtime.bigint();
  try {
    const parseOut = run(`npx tree-sitter-cli parse benchmark_mesh.inp --quiet`, treeSitterDir);
    const t1 = process.hrtime.bigint();
    const durationMs = Number(t1 - t0) / 1e6;
    console.log(`large mesh parse finished in ${durationMs.toFixed(2)} ms`);
    console.log(`parse throughput: ${(stats.size / (durationMs / 1000) / (1024 * 1024)).toFixed(2)} mb/s`);
  } catch (err) {
    console.error('benchmark parse failed:\n' + err.stdout);
    passedAll = false;
  }

  if (fs.existsSync(benchPath)) {
    fs.unlinkSync(benchPath);
  }

  if (passedAll) {
    console.log('all checks passed successfully');
    process.exit(0);
  } else {
    console.error('some checks failed');
    process.exit(1);
  }
}

runTests();
