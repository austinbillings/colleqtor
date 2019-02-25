const { version } = require('./package.json');
const fs = require('fs');
const zaq = require('zaq').as('colleqtor@' + version);
const path = require('path');

const isArray = a => Array.isArray(a);
const isObject = o => typeof o === 'object';
const isString = s => typeof s === 'string';
const isFunction = f => typeof f === 'function';

function removeFileExtension (filePath) {
    if (!isString(filePath)) return new TypeError('filePath is not a string.');

    var extname = path.extname(filePath);
    return extname && extname.length ? filePath.substring(0, filePath.length - extname.length) : filePath;
}

function checkOptions (methodName = '?', options) {
  if (!isObject(options)) {
    throw new TypeError(`
        API changed in V2.0:
        colleqtor.${methodName} now requires an options *object* instead of individual string/bool arguments:
        { extension: string?, stripDirPath: bool?, recursive: bool? }
    `);
  }
}

const extensionFilter = ext => item => {
  if (isString(ext) && ext.length) {
    const itemExt = path.extname(item).toLowerCase();

    return isString(itemExt)
      && itemExt.length > 1
      && (itemExt === ext.toLowerCase()
      || itemExt.substring(1) === ext.toLowerCase());
  } else if (isArray(ext)) {
    return ext.some(subExtension => extensionFilter(subExtension)(item));
  }

  return true;
}

const exclusionFilter = predicate => item => {
  if (isFunction(predicate))
      return !predicate(item);
  if (isString(predicate))
      return item.indexOf(predicate) === -1;
  if (isArray(predicate))
      return predicate.every(subPredicate => excludeFilter(subPredicate)(item));

  return true;
};

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
