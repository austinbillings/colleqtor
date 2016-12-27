const colleqtor = require('./colleqtor.js');
const zaq = require('zaq');

let testDir = './test';

zaq.info('LIST FILES: Only dir provided:', colleqtor.listFiles(testDir));

zaq.info('LIST FILES: Dir and extension (log) provided:', colleqtor.listFiles(testDir, 'log'));
zaq.info('LIST FILES: Dir and extension (txt) provided:', colleqtor.listFiles(testDir, 'txt'));
zaq.info('LIST FILES: Dir and extension (xml) provided:', colleqtor.listFiles(testDir, 'xml'));

zaq.info('LIST FILES: Dir and extension (txt) provided, stripping directory:', colleqtor.listFiles(testDir, 'txt', true));

zaq.info('GATHER FILENAMES: Only dir provided:', colleqtor.gatherFileNames(testDir));

let reqd = colleqtor.require(testDir + '/requirable');
zaq.info('Require\'m', reqd);
zaq.info('is gamma a thing?', reqd.gamma());
