"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFlag = setFlag;
exports.isEnabled = isEnabled;
exports.getAll = getAll;
const flags = {};
function setFlag(name, value) { flags[name] = value; }
function isEnabled(name) { return flags[name] ?? false; }
function getAll() { return { ...flags }; }
// staging patch 1
// staging patch 2
// staging patch 3
// staging patch 4
// staging patch 5
// staging patch 6
// staging patch 7
// staging patch 8
// staging patch 9
// staging patch 10
// staging patch 11
// staging patch 12
// staging patch 13
// staging patch 14
//# sourceMappingURL=featureFlags.js.map