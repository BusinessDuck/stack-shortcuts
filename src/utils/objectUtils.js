/**
 * @param {Object} obj
 * @return {Object}
 */
export function reverse(obj) {
    const result = {};
    Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
            obj[key].forEach(value => {
                result[value] = (result[value] || []).concat(key);
            });
        } else {
            result[obj[key]] = key;
        }
    });
    return result;

}
