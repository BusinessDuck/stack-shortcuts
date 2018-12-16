'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getHash = getHash;
exports.shortcuts = shortcuts;

var _KeyCode = require('./utils/KeyCode');

var _objectUtils = require('./utils/objectUtils');

var _userAgent = require('./utils/userAgent');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var keyMapCache = void 0;

/**
 * Platform keyboard mappings
 * @return {Object}
 */
function getPlatformKeyMap() {
    if (keyMapCache) {
        return keyMapCache;
    }

    var result = {};
    var platform = (0, _userAgent.getOSVersion)();

    if (platform !== 'Mac OS') {
        result.CMD = 'CTRL';
    }

    keyMapCache = result;

    return result;
}

var MODIFIERS_MAP = {
    metaKey: 'CMD',
    ctrlKey: 'CTRL',
    shiftKey: 'SHIFT',
    altKey: 'ALT'

};
var CodeKey = (0, _objectUtils.reverse)(_KeyCode.KeyCode);
var stack = [];

/**
 * Get shortcut hash not depend from order CTRL+SHIFT = SHIFT+CTRL
 * @param {Array} keyList
 * @return {number}
 * @private
 */
function getHash(keyList) {
    return keyList.map(function (keyChar) {
        return _KeyCode.KeyCode[keyChar];
    }).sort().join('');
}

/**
 * Handle event modifiers
 * @param {Event} event
 * @return {Array}
 * @private
 */
function getModifiersList(event) {
    var modifiers = [];

    ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'].forEach(function (key) {
        if (event[key]) {
            modifiers.push(MODIFIERS_MAP[key]);
        }
    });

    return modifiers;
}

/**
 * Event handler of service
 * @param {Event} event
 */
function handleEvent(event) {
    var keyList = [].concat(_toConsumableArray(getModifiersList(event)), [CodeKey[event.keyCode]]);
    var keysHash = getHash(keyList);
    var handler = function handler() {};

    for (var i = 0; i < stack.length; ++i) {
        var layer = stack[i];

        if (layer.hasHandler(keysHash)) {
            handler = layer.getHandler(keysHash).bind(null, event, handler);
        }
    }

    handler();
}

/**
 * Adds keyboard event listeners
 */
function bind() {
    document.addEventListener('keydown', handleEvent);
}

/**
 * Removes keyboard event listeners
 */
function unbind() {
    document.removeEventListener('keydown', handleEvent);
}

/**
 * @param {ShortcutsManager} managerInstance
 */
function removeLayer(managerInstance) {
    if (stack.length) {
        var index = stack.indexOf(managerInstance);

        if (index === -1) {
            return;
        }

        stack.splice(index, 1);

        // when stack becomes empty we need to stop listening for any events
        if (!stack.length) {
            unbind();
        }
    }
}

/**
 * Hotkeys manager
 */

var ShortcutsManager = function () {
    /**
     * Constructor
     * @param {Object} config
     * @param {Object} platformKeyMap
     */
    function ShortcutsManager(config) {
        var _this = this;

        _classCallCheck(this, ShortcutsManager);

        // eslint-disable-next-line
        this._shortcuts = {};
        this.platformKeyMap = getPlatformKeyMap();

        Object.keys(config).forEach(function (key) {
            _this.add(key, config[key]);
        });
    }

    /**
     * Handle shortcuts defined in customKeyMap
     * @param {String[]} keyList
     * @return {String[]}
     */


    _createClass(ShortcutsManager, [{
        key: 'resolveKeyMap',
        value: function resolveKeyMap(keyList) {
            var _this2 = this;

            return keyList.map(function (item) {
                return _this2.platformKeyMap[item] || item;
            });
        }

        /**
         * Add new hotkeys listener to layer
         * @param {String} shortcut
         * @param {Function} handler
         */

    }, {
        key: 'add',
        value: function add(shortcut, handler) {
            var keysHash = getHash(this.resolveKeyMap(shortcut.toUpperCase().split('+')));

            this._shortcuts[keysHash] = handler;
        }

        /**
         * Remove shortcut from layer
         * @param {String} shortcut
         */

    }, {
        key: 'remove',
        value: function remove(shortcut) {
            var keysHash = getHash(this.resolveKeyMap(shortcut.toUpperCase().split('+')));

            delete this._shortcuts[keysHash];
        }

        /**
         * Get shortcuts handler
         * @param {number} keysHash
         * @return {Function}
         */

    }, {
        key: 'getHandler',
        value: function getHandler(keysHash) {
            return this._shortcuts[keysHash] || this._shortcuts[_KeyCode.KeyCode.ALL];
        }

        /**
         * Can handle in current layer
         * @param {Number} keysHash
         * @return {Boolean}
         */

    }, {
        key: 'hasHandler',
        value: function hasHandler(keysHash) {
            return !!this.getHandler(keysHash);
        }
    }]);

    return ShortcutsManager;
}();

/**
 * Create a new layer
 * @param {Object} config
 * @return {Object}
 */


function shortcuts(config) {

    if (!config) {
        throw new Error('Config must be not empty');
    }

    var shortcutsManager = new ShortcutsManager(config);

    stack.push(shortcutsManager);

    if (stack.length === 1) {
        bind();
    }

    return {
        destroy: function destroy() {
            return removeLayer(shortcutsManager);
        },
        manager: shortcutsManager
    };
}
//# sourceMappingURL=shortcuts.js.map