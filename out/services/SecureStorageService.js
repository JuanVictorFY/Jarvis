"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureStorageService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_2 = require("electron");
class SecureStorageService {
    storePath;
    store = new Map();
    constructor() {
        this.storePath = path_1.default.join(electron_2.app.getPath('userData'), 'secure-store.bin');
        this.load();
    }
    load() {
        try {
            if (!fs_1.default.existsSync(this.storePath)) {
                return;
            }
            const raw = fs_1.default.readFileSync(this.storePath);
            if (electron_1.safeStorage.isEncryptionAvailable()) {
                const decrypted = electron_1.safeStorage.decryptString(raw);
                const parsed = JSON.parse(decrypted);
                for (const [key, value] of Object.entries(parsed)) {
                    this.store.set(key, value);
                }
            }
        }
        catch {
            // start fresh if decryption fails
        }
    }
    persist() {
        try {
            const data = JSON.stringify(Object.fromEntries(this.store));
            if (electron_1.safeStorage.isEncryptionAvailable()) {
                const encrypted = electron_1.safeStorage.encryptString(data);
                fs_1.default.writeFileSync(this.storePath, encrypted);
            }
        }
        catch {
            // non-critical
        }
    }
    set(key, value) {
        this.store.set(key, value);
        this.persist();
    }
    get(key) {
        return this.store.get(key);
    }
    delete(key) {
        this.store.delete(key);
        this.persist();
    }
    has(key) {
        return this.store.has(key);
    }
    isAvailable() {
        return electron_1.safeStorage.isEncryptionAvailable();
    }
}
exports.SecureStorageService = SecureStorageService;
//# sourceMappingURL=SecureStorageService.js.map