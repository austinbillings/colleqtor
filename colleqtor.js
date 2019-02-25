const { version } = require('./package.json');
const fs = require('fs');
const zaq = require('zaq').as('colleqtor@' + version);
const path = require('path');
const jawn = require('node-jawn');

function checkOptions (methodName = '?', options) {
  if (typeof options !== 'object') {
    throw new TypeError(`
        API changed in V2.0:
        colleqtor.${methodName} now requires an options *object* instead of individual string/bool arguments:
        { extension: string?, stripDirPath: bool?, recursive: bool? }
    `);
  }
}

function listFiles (dir, options = {}) {
  checkOptions('listFiles', options);

  const {
    extension = null,
    stripDirPath = null,
    recursive = null
  } = options;

  const cleanName = p => stripDirPath ? p : path.join(dir, p);
  const dirContents = fs.readdirSync(dir, { withFileTypes: true });
  const fileNames = dirContents.reduce(function (output, dirItem) {
    if (dirItem.isFile())
      return [
        ...output,
        cleanName(dirItem.name)
      ];
    else if (dirItem.isDirectory() && recursive)
      return [
        ...output,
        ...listFiles(path.join(dir, dirItem.name), { extension, stripDirPath, recursive })
      ];
    else return output;
  }, []);

  const resultFilter = item => !extension
    || (jawn.getFileExtension(item) === extension.toLowerCase());

  return fileNames.filter(resultFilter);
};

function gatherFileNames (dir, options = {}) {
  checkOptions(options);

  const { extension = null, stripDirPath = false } = options;

  return listFiles(dir, options)
    .map(p => jawn.removeFileExtension(p));
};

function getFileContents (filePathList, objMode = true, stripFileExtensions = true, baseDir = null) {
  return filePathList.reduce((output, filePath) => {
    const fullPath = path.resolve(baseDir || '', filePath);
    const shortPath = path.relative('.', fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const pathKey = stripFileExtensions ? jawn.removeFileExtension(shortPath) : shortPath;

    return objMode
      ? { ...output, [pathKey]: content }
      : [ ...output, content ];
  }, objMode ? {} : []);
};

function collect (dir, extension, objMode) {
  return getFileContent(listFiles(dir, { extension: extension }), objMode);
};

function requireAll (dir, extension = 'js') {
  const fileNames = gatherFileNames(dir, { extension, stripDirPath: true });

  return fileNames.reduce((output, fileName) => {
    const uri = path.join(dir, `${fileName}.${extension}`);

    try {
      output[fileName] = require(uri);
    } catch (e) {
      zaq.err(e);
      throw Error(`colleqtor: couldn\'t require [${extension}] file: ${uri}`);
    }

    return output;
  }, {});
};

module.exports = {
    version,
    listFiles,
    gatherFileNames,
    getFileContents,
    getFileContent: (...args) => {
      zaq.warn('colleqtor.getFileContent is deprecated and will be removed. Please use .getFileContents (plural) instead.');
      return getFileContents(...args);
    },
    collect,
    requireAll,
    require: (...args) => {
      zaq.warn('colleqtor.require() is deprecated and will be removed in future versions of colleqtor. Please use .requireAll() instead.')
      return requireAll(...args);
    }
};
