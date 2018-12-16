"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.reverse=reverse;/**
 * @param {Object} obj
 * @return {Object}
 */function reverse(a){var b={};return Object.keys(a).forEach(function(c){Array.isArray(a[c])?a[c].forEach(function(a){b[a]=(b[a]||[]).concat(c)}):b[a[c]]=c}),b}