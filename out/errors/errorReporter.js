"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportError = reportError;
exports.getReports = getReports;
const AppError_1 = require("./AppError");
const reports = [];
function reportError(err) {
    if (err instanceof AppError_1.AppError) {
        reports.push({ code: err.code, message: err.message, timestamp: Date.now(), recoverable: err.recoverable });
    }
    else if (err instanceof Error) {
        reports.push({ code: 'UNKNOWN', message: err.message, timestamp: Date.now(), recoverable: false });
    }
}
function getReports() {
    return [...reports];
}
// tested
//# sourceMappingURL=errorReporter.js.map