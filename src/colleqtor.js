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

function dirEntriesToFileNames (dirPath, dirEntries, options) {
  const { stripDirPath, recursive, useAsync } = options;
  const cleanName = p => stripDirPath ? p : path.join(dirPath, p);
  const entries = dirEntries.filter(e => e.isFile() || e.isDirectory());

  return !useAsync
    ? entries.reduce(function (output, dirEntry) {
        if (dirEntry.isFile())
          return [ ...output, cleanName(dirEntry.name) ];
        else if (dirEntry.isDirectory() && recursive) {
          const subDirPath = path.join(dirPath, dirEntry.name);
          return [ ...output, ...listFiles(subDirPath, options) ];
        } else return output;
      }, [])
    : new Promise((resolve, reject) => {
        const output = [];
        let finishedCount = 0;

        try {
          entries.forEach((dirEntry, index) => {
            const finish = () => ++finishedCount === entries.length ? resolve(output) : null;

            if (dirEntry.isFile()) {
              output.push(cleanName(dirEntry.name));
              finish();
            } else if (dirEntry.isDirectory() && recursive) {
              const subDirPath = path.join(dirPath, dirEntry.name);

              listFiles(subDirPath, options)
                .then(list => {
                  list.forEach(item => output.push(item));

                  finish();
                }, reject);
            } else {
              finish();
            }
          });
        } catch (e) {
          reject(e);
        }
      });
}

function listFiles (dir, options = {}) {
  checkOptions('listFiles', options);

  const { useAsync, extension, exclude } = options;

  if (!useAsync) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const fileNames = dirEntriesToFileNames(dir, files, options);

    return fileNames
      .filter(extensionFilter(extension))
      .filter(exclusionFilter(exclude));
  }

  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) return reject(err);

      dirEntriesToFileNames(dir, files, options)
        .then(fileNames => {
          const filteredFilenames = fileNames
            .filter(extensionFilter(extension))
            .filter(exclusionFilter(exclude));

          resolve(filteredFilenames);
        }, reject);
    });
  });
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
