"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = debounce;
exports.throttle = throttle;
function debounce(fn, delayMs) {
    let timer = null;
    return (...args) => {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delayMs);
    };
}
function throttle(fn, intervalMs) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= intervalMs) {
            lastCall = now;
            fn(...args);
        }
    };
}
//# sourceMappingURL=debounce.js.map