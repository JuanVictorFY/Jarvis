"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppVersion = getAppVersion;
exports.getElectronVersion = getElectronVersion;
exports.getNodeVersion = getNodeVersion;
exports.getChromeVersion = getChromeVersion;
exports.getVersionInfo = getVersionInfo;
const electron_1 = require("electron");
function getAppVersion() {
    return electron_1.app.getVersion();
}
function getElectronVersion() {
    return process.versions.electron ?? 'unknown';
}
function getNodeVersion() {
    return process.versions.node ?? 'unknown';
}
function getChromeVersion() {
    return process.versions.chrome ?? 'unknown';
}
function getVersionInfo() {
    return {
        app: getAppVersion(),
        electron: getElectronVersion(),
        node: getNodeVersion(),
        chrome: getChromeVersion(),
        platform: process.platform,
        arch: process.arch,
    };
}
//# sourceMappingURL=appVersion.js.map