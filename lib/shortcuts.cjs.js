'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const KeyCode = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    CMD: 91,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    ALL: '*'
};

/**
 * @param {Object} obj
 * @return {Object}
 */
function reverse(obj) {
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

/**
 * @return {String}
 */
function getOSVersion() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    }

    return 'Unknown';
}

let keyMapCache;

/**
 * Platform keyboard mappings
 * @return {Object}
 */
function getPlatformKeyMap() {
    if (keyMapCache) {
        return keyMapCache;
    }

    const result = {};
    const platform = getOSVersion();

    if (platform !== 'Mac OS') {
        result.CMD = 'CTRL';
    }

    keyMapCache = result;

    return result;
}

const MODIFIERS_MAP = {
    metaKey: 'CMD',
    ctrlKey: 'CTRL',
    shiftKey: 'SHIFT',
    altKey: 'ALT'

};
const CodeKey = reverse(KeyCode);
const stack = [];

/**
 * Get shortcut hash not depend from order CTRL+SHIFT = SHIFT+CTRL
 * @param {Array} keyList
 * @return {number}
 * @private
 */
function getHash(keyList) {
    return keyList.map(keyChar => KeyCode[keyChar]).sort().join('');
}

/**
 * Handle event modifiers
 * @param {Event} event
 * @return {Array}
 * @private
 */
function getModifiersList(event) {
    const modifiers = [];

    ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'].forEach(key => {
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
    const keyList = [...getModifiersList(event), CodeKey[event.keyCode]];
    const keysHash = getHash(keyList);
    let handler = () => {};

    for (let i = 0; i < stack.length; ++i) {
        const layer = stack[i];

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
        const index = stack.indexOf(managerInstance);

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
class ShortcutsManager {
    /**
     * Constructor
     * @param {Object} config
     * @param {Object} platformKeyMap
     */
    constructor(config) {
        // eslint-disable-next-line
        this._shortcuts = {};
        this.platformKeyMap = getPlatformKeyMap();

        Object.keys(config).forEach(key => {
            this.add(key, config[key]);
        });
    }

    /**
     * Handle shortcuts defined in customKeyMap
     * @param {String[]} keyList
     * @return {String[]}
     */
    resolveKeyMap(keyList) {
        return keyList.map(item => this.platformKeyMap[item] || item);
    }

    /**
     * Add new hotkeys listener to layer
     * @param {String} shortcut
     * @param {Function} handler
     */
    add(shortcut, handler) {
        const keysHash = getHash(this.resolveKeyMap(shortcut.toUpperCase().split('+')));

        this._shortcuts[keysHash] = handler;
    }

    /**
     * Remove shortcut from layer
     * @param {String} shortcut
     */
    remove(shortcut) {
        const keysHash = getHash(this.resolveKeyMap(shortcut.toUpperCase().split('+')));

        delete this._shortcuts[keysHash];
    }

    /**
     * Get shortcuts handler
     * @param {number} keysHash
     * @return {Function}
     */
    getHandler(keysHash) {
        return this._shortcuts[keysHash] || this._shortcuts[KeyCode.ALL];
    }

    /**
     * Can handle in current layer
     * @param {Number} keysHash
     * @return {Boolean}
     */
    hasHandler(keysHash) {
        return !!this.getHandler(keysHash);
    }
}

/**
 * Create a new layer
 * @param {Object} config
 * @return {Object}
 */
function shortcuts(config) {

    if (!config) {
        throw new Error('Config must be not empty');
    }

    const shortcutsManager = new ShortcutsManager(config);

    stack.push(shortcutsManager);

    if (stack.length === 1) {
        bind();
    }

    return {
        destroy: () => removeLayer(shortcutsManager),
        manager: shortcutsManager
    };
}

if (typeof window !== 'undefined') {
    window.shortcuts = shortcuts;
}

exports.getHash = getHash;
exports.shortcuts = shortcuts;
exports.KeyCode = KeyCode;
