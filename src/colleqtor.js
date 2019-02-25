const { version } = require('../package.json');
const fs = require('fs');
const path = require('path');
const zaq = require('zaq').as('colleqtor@' + version);

const {
  isString,
  isArray,
  isFunction,
  isObject,
  exclusionFilter,
  extensionFilter,
  removeFileExtension
} = require('./utils');

function checkOptions (methodName = '?', options) {
  if (!isObject(options)) {
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
    recursive = null,
    exclude = null
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

  return fileNames
    .filter(extensionFilter(extension))
    .filter(exclusionFilter(exclude));
};

function gatherFileNames (dir, options = {}) {
  checkOptions('gatherFileNames', options);

  const { extension = null, stripDirPath = false } = options;

  return listFiles(dir, options)
    .map(p => removeFileExtension(p));
};

function getFileContents (filePathList, objMode = true, stripFileExtensions = false, baseDir = null) {
  return filePathList.reduce((output, filePath) => {
    const fullPath = path.resolve(baseDir || '', filePath);
    const shortPath = path.relative('.', fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const pathKey = stripFileExtensions ? removeFileExtension(shortPath) : shortPath;

    return objMode
      ? { ...output, [pathKey]: content }
      : [ ...output, content ];
  }, objMode ? {} : []);
};

function collect (dir, options, objMode) {
  return getFileContent(listFiles(dir, options), objMode);
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
    collect,
    listFiles,
    requireAll,
    gatherFileNames,
    getFileContents,
    getFileContent: (...args) => {
      zaq.warn('colleqtor.getFileContent is deprecated and will be removed. Please use .getFileContents (plural) instead.');
      return getFileContents(...args);
    },
    require: (...args) => {
      zaq.warn('colleqtor.require() is deprecated and will be removed in future versions of colleqtor. Please use .requireAll() instead.')
      return requireAll(...args);
    }
};
