"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.optimizeCallback = optimizeCallback;
var _typedFunction = _interopRequireDefault(require("typed-function"));
var _array = require("./array.js");
var _is = require("./is.js");
/**
 * Simplifies a callback function by reducing its complexity and potentially improving its performance.
 *
 * @param {Function} callback The original callback function to simplify.
 * @param {Array|Matrix} array The array that will be used with the callback function.
 * @param {string} name The name of the function that is using the callback.
 * @returns {Function} Returns a simplified version of the callback function.
 */
function optimizeCallback(callback, array, name) {
  if (_typedFunction.default.isTypedFunction(callback)) {
    const firstIndex = (array.isMatrix ? array.size() : (0, _array.arraySize)(array)).map(() => 0);
    const firstValue = array.isMatrix ? array.get(firstIndex) : (0, _array.get)(array, firstIndex);
    const hasSingleSignature = Object.keys(callback.signatures).length === 1;
    const numberOfArguments = _findNumberOfArguments(callback, firstValue, firstIndex, array);
    const fastCallback = hasSingleSignature ? Object.values(callback.signatures)[0] : callback;
    if (numberOfArguments >= 1 && numberOfArguments <= 3) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _tryFunctionWithArgs(fastCallback, args.slice(0, numberOfArguments), name, callback.name);
      };
    }
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _tryFunctionWithArgs(fastCallback, args, name, callback.name);
    };
  }
  return callback;
}
function _findNumberOfArguments(callback, value, index, array) {
  const testArgs = [value, index, array];
  for (let i = 3; i > 0; i--) {
    const args = testArgs.slice(0, i);
    if (_typedFunction.default.resolve(callback, args) !== null) {
      return i;
    }
  }
}

/**
   * @param {function} func The selected function taken from one of the signatures of the callback function
   * @param {Array} args List with arguments to apply to the selected signature
   * @param {string} mappingFnName the name of the function that is using the callback
   * @param {string} callbackName the name of the callback function
   * @returns {*} Returns the return value of the invoked signature
   * @throws {TypeError} Throws an error when no matching signature was found
   */
function _tryFunctionWithArgs(func, args, mappingFnName, callbackName) {
  try {
    return func(...args);
  } catch (err) {
    _createCallbackError(err, args, mappingFnName, callbackName);
  }
}

/**
 * Creates and throws a detailed TypeError when a callback function fails.
 *
 * @param {Error} err The original error thrown by the callback function.
 * @param {Array} args The arguments that were passed to the callback function.
 * @param {string} mappingFnName The name of the function that is using the callback.
 * @param {string} callbackName The name of the callback function.
 * @throws {TypeError} Throws a detailed TypeError with enriched error message.
 */
function _createCallbackError(err, args, mappingFnName, callbackName) {
  var _err$data;
  // Enrich the error message so the user understands that it took place inside the callback function
  if (err instanceof TypeError && ((_err$data = err.data) === null || _err$data === void 0 ? void 0 : _err$data.category) === 'wrongType') {
    const argsDesc = [];
    argsDesc.push(`value: ${(0, _is.typeOf)(args[0])}`);
    if (args.length >= 2) {
      argsDesc.push(`index: ${(0, _is.typeOf)(args[1])}`);
    }
    if (args.length >= 3) {
      argsDesc.push(`array: ${(0, _is.typeOf)(args[2])}`);
    }
    throw new TypeError(`Function ${mappingFnName} cannot apply callback arguments ` + `${callbackName}(${argsDesc.join(', ')}) at index ${JSON.stringify(args[1])}`);
  } else {
    throw new TypeError(`Function ${mappingFnName} cannot apply callback arguments ` + `to function ${callbackName}: ${err.message}`);
  }
}