// deps ========================================================================
const fs = require('fs');
const jawn = require('node-jawn');
const _ = require('underscore');
let zaq = require('zaq');

let colleqtor = {
  listFiles (dir, ext = null, strip = false) {
    let all = _.map(fs.readdirSync(dir), (item) => (strip ? '' : dir + '/') + item);
    return !ext ? all : _.filter(all, (item) => jawn.getFileExtension(item) === ext.toLowerCase());
  },
  gatherFileNames (dir, ext = null, strip = false) {
    zaq.info(dir + ' gathering ' + ext + ' strip is '+(strip?'y':'n'));
    return _.map(colleqtor.listFiles(dir, ext, strip), jawn.removeFileExtension);
  },
  getFileContent (list, objMode = true, useBasename = true, baseDir = '') {
    let contents = (objMode ? {} : []);
    _.each(list, (path) => {
      let content = fs.readFileSync(baseDir + path, 'utf-8');
      let basename = useBasename ? jawn.removeFileExtension(jawn.filenameFromPath(path)) : path;
      if (objMode) contents[basename] = content;
      else contents.push(content);
    });
    return contents;
  },
  collect (dir, extension, objMode) {
    return colleqtor.getFileContent(colleqtor.listFiles(dir, extension), objMode);
  },
  require (dir) {
    let keys = colleqtor.gatherFileNames(dir, 'js', true);
    let output = {};
    _.each(keys, (key) => {
      output[key] = require(dir + '/' + key + '.js');
    });
    return output;
  }
};

module.exports = colleqtor;
