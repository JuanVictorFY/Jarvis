"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = profile;
exports.profileAsync = profileAsync;
function profile(label, fn) {
    const start = performance.now();
    const result = fn();
    console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
}
async function profileAsync(label, fn) {
    const start = performance.now();
    const result = await fn();
    console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
}
//# sourceMappingURL=profiler.js.map