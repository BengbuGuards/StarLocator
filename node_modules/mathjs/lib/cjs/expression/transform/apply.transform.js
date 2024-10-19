"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createApplyTransform = void 0;
var _errorTransform = require("./utils/errorTransform.js");
var _factory = require("../../utils/factory.js");
var _apply = require("../../function/matrix/apply.js");
var _is = require("../../utils/is.js");
const name = 'apply';
const dependencies = ['typed', 'isInteger'];

/**
 * Attach a transform function to math.apply
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `dim` parameter of function apply
 * from one-based to zero based
 */
const createApplyTransform = exports.createApplyTransform = /* #__PURE__ */(0, _factory.factory)(name, dependencies, _ref => {
  let {
    typed,
    isInteger
  } = _ref;
  const apply = (0, _apply.createApply)({
    typed,
    isInteger
  });

  // @see: comment of concat itself
  return typed('apply', {
    '...any': function (args) {
      // change dim from one-based to zero-based
      const dim = args[1];
      if ((0, _is.isNumber)(dim)) {
        args[1] = dim - 1;
      } else if ((0, _is.isBigNumber)(dim)) {
        args[1] = dim.minus(1);
      }
      try {
        return apply.apply(null, args);
      } catch (err) {
        throw (0, _errorTransform.errorTransform)(err);
      }
    }
  });
}, {
  isTransformFunction: true
});