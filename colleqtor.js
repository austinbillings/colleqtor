// deps ========================================================================
const fs = require('fs');
const zaq = require('zaq');
const path = require('path');
const _ = require('underscore');
const jawn = require('node-jawn');

let Colleqtor = { version: '1.1.0' };

Colleqtor.listFiles = (dir, ext = null, strip = false) => {
  let all = _.map(fs.readdirSync(dir), (item) => (strip ? '' : dir + '/') + item);
  return !ext ? all : _.filter(all, (item) => jawn.getFileExtension(item) === ext.toLowerCase());
};

Colleqtor.gatherFileNames = (dir, ext = null, strip = false) => {
  return _.map(Colleqtor.listFiles(dir, ext, strip), jawn.removeFileExtension);
};

Colleqtor.getFileContent = (list, objMode = true, useBasename = true, baseDir = '') => {
  let contents = (objMode ? {} : []);
  _.each(list, (path) => {
    let content = fs.readFileSync(baseDir + path, 'utf-8');
    let basename = useBasename ? jawn.removeFileExtension(jawn.filenameFromPath(path)) : path;
    if (objMode) contents[basename] = content;
    else contents.push(content);
  });
  return contents;
};

Colleqtor.collect = (dir, extension, objMode) => {
  return Colleqtor.getFileContent(Colleqtor.listFiles(dir, extension), objMode);
};

Colleqtor.require = (dir, ext = 'js') => {
  let keys = Colleqtor.gatherFileNames(dir, ext, true);
  let output = {};
  _.each(keys, (key) => {
    let uri = path.join(dir, key + '.' + ext);
    try {
      output[key] = require(uri);
    } catch (e) {
      zaq.err(`Error requiring [${ext}] file: ${uri}`, e);
    }
  });
  return output;
};

module.exports = Colleqtor;
