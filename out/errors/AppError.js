"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.NetworkError = exports.AppError = void 0;
class AppError extends Error {
    code;
    recoverable;
    constructor(message, code, recoverable = true) {
        super(message);
        this.code = code;
        this.recoverable = recoverable;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class NetworkError extends AppError {
    constructor(message) {
        super(message, 'NETWORK_ERROR', true);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class AuthError extends AppError {
    constructor(message) {
        super(message, 'AUTH_ERROR', false);
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
// stable
//# sourceMappingURL=AppError.js.map