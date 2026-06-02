"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellService = void 0;
const child_process_1 = require("child_process");
const tokenUtils_1 = require("../utils/tokenUtils");
const OUTPUT_TOKEN_BUDGET = 2000;
class ShellService {
    runCommand(command, cwd) {
        try {
            const output = (0, child_process_1.execSync)(command, {
                cwd,
                encoding: 'utf8',
                timeout: 30_000,
                maxBuffer: 10 * 1024 * 1024,
            });
            return (0, tokenUtils_1.truncateToTokenBudget)(output || '(no output)', OUTPUT_TOKEN_BUDGET);
        }
        catch (err) {
            const e = err;
            const combined = `STDOUT:\n${e.stdout ?? ''}\n\nSTDERR:\n${e.stderr ?? ''}`;
            return `Exit ${e.status ?? 1}:\n${(0, tokenUtils_1.truncateToTokenBudget)(combined, OUTPUT_TOKEN_BUDGET)}`;
        }
    }
}
exports.ShellService = ShellService;
//# sourceMappingURL=ShellService.js.map