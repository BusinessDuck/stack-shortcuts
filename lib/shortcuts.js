'use strict';var _createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();Object.defineProperty(exports,'__esModule',{value:!0});exports.getHash=getHash,exports.shortcuts=shortcuts;var _KeyCode=require('./utils/KeyCode'),_objectUtils=require('./utils/objectUtils'),_userAgent=require('./utils/userAgent');function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _toConsumableArray(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}var keyMapCache=void 0;/**
 * Platform keyboard mappings
 * @return {Object}
 */function getPlatformKeyMap(){if(keyMapCache)return keyMapCache;var a={},b=(0,_userAgent.getOSVersion)();return'Mac OS'!==b&&(a.CMD='CTRL'),keyMapCache=a,a}var MODIFIERS_MAP={metaKey:'CMD',ctrlKey:'CTRL',shiftKey:'SHIFT',altKey:'ALT'},CodeKey=(0,_objectUtils.reverse)(_KeyCode.KeyCode),stack=[];/**
 * Get shortcut hash not depend from order CTRL+SHIFT = SHIFT+CTRL
 * @param {Array} keyList
 * @return {number}
 * @private
 */function getHash(a){return a.map(function(a){return _KeyCode.KeyCode[a]}).sort().join('')}/**
 * Handle event modifiers
 * @param {Event} event
 * @return {Array}
 * @private
 */function getModifiersList(a){var b=[];return['ctrlKey','metaKey','shiftKey','altKey'].forEach(function(c){a[c]&&b.push(MODIFIERS_MAP[c])}),b}/**
 * Event handler of service
 * @param {Event} event
 */function handleEvent(a){for(var b,c=[].concat(_toConsumableArray(getModifiersList(a)),[CodeKey[a.keyCode]]),d=getHash(c),e=function(){},f=0;f<stack.length;++f)b=stack[f],b.hasHandler(d)&&(e=b.getHandler(d).bind(null,a,e));e()}/**
 * Adds keyboard event listeners
 */function bind(){document.addEventListener('keydown',handleEvent)}/**
 * Removes keyboard event listeners
 */function unbind(){document.removeEventListener('keydown',handleEvent)}/**
 * @param {ShortcutsManager} managerInstance
 */function removeLayer(a){if(stack.length){var b=stack.indexOf(a);if(-1===b)return;stack.splice(b,1),stack.length||unbind()}}/**
 * Hotkeys manager
 */var ShortcutsManager=function(){/**
     * Constructor
     * @param {Object} config
     * @param {Object} platformKeyMap
     */function a(b){var c=this;_classCallCheck(this,a),this._shortcuts={},this.platformKeyMap=getPlatformKeyMap(),Object.keys(b).forEach(function(a){c.add(a,b[a])})}/**
     * Handle shortcuts defined in customKeyMap
     * @param {String[]} keyList
     * @return {String[]}
     */return _createClass(a,[{key:'resolveKeyMap',value:function c(a){var b=this;return a.map(function(a){return b.platformKeyMap[a]||a})}/**
     * Add new hotkeys listener to layer
     * @param {String} shortcut
     * @param {Function} handler
     */},{key:'add',value:function d(a,b){var c=getHash(this.resolveKeyMap(a.toUpperCase().split('+')));this._shortcuts[c]=b}/**
     * Remove shortcut from layer
     * @param {String} shortcut
     */},{key:'remove',value:function c(a){var b=getHash(this.resolveKeyMap(a.toUpperCase().split('+')));delete this._shortcuts[b]}/**
     * Get shortcuts handler
     * @param {number} keysHash
     * @return {Function}
     */},{key:'getHandler',value:function b(a){return this._shortcuts[a]||this._shortcuts[_KeyCode.KeyCode.ALL]}/**
     * Can handle in current layer
     * @param {Number} keysHash
     * @return {Boolean}
     */},{key:'hasHandler',value:function b(a){return!!this.getHandler(a)}}]),a}();/**
 * Create a new layer
 * @param {Object} config
 * @return {Object}
 */function shortcuts(a){if(!a)throw new Error('Config must be not empty');var b=new ShortcutsManager(a);return stack.push(b),1===stack.length&&bind(),{destroy:function a(){return removeLayer(b)},manager:b}}