// deps ========================================================================
const fs = require('fs');
const jawn = require('node-jawn');
const _ = require('underscore');

let colleqtor = {
  listFiles (dir, ext = null, strip = false) {
    let all = _.map(fs.readdirSync(dir), (item) => (strip ? '' : dir + '/') + item);
    return !ext ? all : _.filter(all, (item) => jawn.getFileExtension(item) === ext.toLowerCase());
  },
  gatherFileNames (dir, ext = null, strip = false) {
    return _.map(colleqtor.listFiles(dir, ext, true), jawn.removeFileExtension);
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
  collect (directory, extension, objMode) {
    return colleqtor.getFileContent(colleqtor.listFiles(directory, extension), objMode);
  }
};

module.exports = colleqtor;
