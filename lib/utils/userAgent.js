'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getOSVersion = getOSVersion;
/**
 * @return {String}
 */
function getOSVersion() {
    var userAgent = window.navigator.userAgent;
    var platform = window.navigator.platform;
    var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    var iosPlatforms = ['iPhone', 'iPad', 'iPod'];

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
//# sourceMappingURL=userAgent.js.map