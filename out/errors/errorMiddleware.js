"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorMiddleware = withErrorMiddleware;
const errorReporter_1 = require("./errorReporter");
function withErrorMiddleware(handler) {
    return async (ctx) => {
        try {
            await handler(ctx);
        }
        catch (err) {
            (0, errorReporter_1.reportError)(err);
            throw err;
        }
    };
}
// validated
//# sourceMappingURL=errorMiddleware.js.map