import { arraySize } from '../../utils/array.js';
import { factory } from '../../utils/factory.js';
import { noMatrix } from '../../utils/noop.js';
var name = 'size';
var dependencies = ['typed', 'config', '?matrix'];
export var createSize = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    typed,
    config,
    matrix
  } = _ref;
  /**
   * Calculate the size of a matrix or scalar.
   *
   * Syntax:
   *
   *     math.size(x)
   *
   * Examples:
   *
   *     math.size(2.3)                       // returns []
   *     math.size('hello world')             // returns [11]
   *
   *     const A = [[1, 2, 3], [4, 5, 6]]
   *     math.size(A)                         // returns [2, 3]
   *     math.size(math.range(1,6).toArray()) // returns [5]
   *
   * See also:
   *
   *     count, resize, squeeze, subset
   *
   * @param {boolean | number | Complex | Unit | string | Array | Matrix} x  A matrix
   * @return {Array | Matrix} A vector with size of `x`.
   */
  return typed(name, {
    Matrix: function Matrix(x) {
      return x.create(x.size(), 'number');
    },
    Array: arraySize,
    string: function string(x) {
      return config.matrix === 'Array' ? [x.length] : matrix([x.length], 'dense', 'number');
    },
    'number | Complex | BigNumber | Unit | boolean | null': function number__Complex__BigNumber__Unit__boolean__null(x) {
      // scalar
      return config.matrix === 'Array' ? [] : matrix ? matrix([], 'dense', 'number') : noMatrix();
    }
  });
});