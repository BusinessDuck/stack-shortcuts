'use strict';Object.defineProperty(exports,'__esModule',{value:!0}),exports.getOSVersion=getOSVersion;/**
 * @return {String}
 */function getOSVersion(){var a=window.navigator.userAgent,b=window.navigator.platform;if(-1!==['Macintosh','MacIntel','MacPPC','Mac68K'].indexOf(b))return'Mac OS';return-1===['iPhone','iPad','iPod'].indexOf(b)?-1===['Win32','Win64','Windows','WinCE'].indexOf(b)?/Android/.test(a)?'Android':/Linux/.test(b)?'Linux':'Unknown':'Windows':'iOS'}