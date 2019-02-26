const zaq = require('zaq');
const path = require('path');
const colleqtor = require('./index');

let testDir = path.join(__dirname, '/test');


zaq.ok('LIST FILES: Only dir provided:', colleqtor.listFiles(testDir));
zaq.ok('lsitFiles: Dir and extension (log) provided:', colleqtor.listFiles(testDir, { extension: 'log' }));
zaq.ok('listFiles: Dir and extension (txt) provided:', colleqtor.listFiles(testDir, { extension: 'txt' }));
zaq.ok('listFiles: Dir and extensions (log, txt) provided:', colleqtor.listFiles(testDir, { extension: ['log', 'txt'] }));
zaq.ok('listFiles: Dir and extension (txt) provided, stripping directory:', colleqtor.listFiles(testDir, { extension: 'txt', stripDirPath: true }));
zaq.ok('gatherFileNames: Only dir provided:', colleqtor.gatherFileNames(testDir));
zaq.ok('.requireAll(testDir + \'/requireable\')', colleqtor.requireAll(testDir + '/requirable'));
zaq.ok('getFileContent(listFiles(testDir, \'txt\'))', colleqtor.getFileContents(colleqtor.listFiles(testDir, { extension: 'txt' })));
colleqtor.listFiles(testDir, { extension: 'txt', useAsync: true })
    .then(list => zaq.ok('listFiles with { useAsync: true }', list));
