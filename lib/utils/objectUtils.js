"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reverse = reverse;
/**
 * @param {Object} obj
 * @return {Object}
 */
function reverse(obj) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
        if (Array.isArray(obj[key])) {
            obj[key].forEach(function (value) {
                result[value] = (result[value] || []).concat(key);
            });
        } else {
            result[obj[key]] = key;
        }
    });
    return result;
}
//# sourceMappingURL=objectUtils.js.map