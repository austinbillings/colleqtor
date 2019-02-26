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

const extensionFilter = (ext, keepDirectories) => item => {
  if (isString(ext) && ext.length) {
    const itemExt = path.extname(item).toLowerCase();

    return (keepDirectories && item[item.length - 1] === path.sep)
      || (isString(itemExt) && itemExt.length > 1 && (itemExt === ext.toLowerCase() || itemExt.substring(1) === ext.toLowerCase()));
  } else if (isArray(ext)) {
    return ext.some(subExtension => extensionFilter(subExtension, keepDirectories)(item));
  }

  return true;
}

const exclusionFilter = predicate => item => {
  if (isFunction(predicate))
      return !predicate(item);
  if (isString(predicate))
      return item.indexOf(predicate) === -1;
  if (isArray(predicate))
      return predicate.every(subPredicate => exclusionFilter(subPredicate)(item));

  return true;
};

module.exports = {
    isString,
    isArray,
    isFunction,
    isObject,
    exclusionFilter,
    extensionFilter,
    removeFileExtension
};
