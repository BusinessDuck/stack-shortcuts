import { KeyCode } from './utils/KeyCode';
import { reverse } from './utils/objectUtils';
import { getOSVersion } from './utils/userAgent';

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
export function getHash(keyList) {
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
export function shortcuts(config) {

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

export { KeyCode };
