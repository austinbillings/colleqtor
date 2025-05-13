const path = require('path');
const chalk = require('chalk');
const colleqtor = require('./index');

const runTest = (code) => console.log(chalk.green(code), eval(code));
const runAsyncTest = (code) => eval(code).then(results => console.log(chalk.green(code), results));

const testDir = path.join(__dirname, '/test');

runTest(`colleqtor.listFiles(testDir)`);
runTest(`colleqtor.listFiles(testDir, { extension: 'txt', stripDirPath: true })`);
runTest(`colleqtor.listFiles(testDir, { extension: ['log', 'txt'] })`);
runTest(`colleqtor.listFiles(testDir, { extension: 'txt', stripDirPath: true })`);
runTest(`colleqtor.listFiles(testDir, { directories: true, recursive: true, stripDirPath: true })`);
runTest(`colleqtor.gatherFileNames(testDir)`);
runTest(`colleqtor.requireAll(testDir + '/requirable')`);
runTest(`colleqtor.getFileContents(colleqtor.listFiles(testDir, { extension: 'txt' }))`);
runAsyncTest(`colleqtor.listFiles(testDir, { extension: 'txt', useAsync: true })`);
runAsyncTest(`colleqtor.listFiles(testDir, { directories: true, useAsync: true, extension: 'log', recursive: true })`);
