"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCheckerService = void 0;
const https_1 = __importDefault(require("https"));
const electron_1 = require("electron");
class UpdateCheckerService {
    repoOwner = 'JuanVictorFY';
    repoName = 'jarvis';
    async checkForUpdates() {
        const currentVersion = electron_1.app.getVersion();
        try {
            const release = await this.fetchLatestRelease();
            const latestVersion = release.tag_name.replace(/^v/, '');
            const available = this.isNewerVersion(latestVersion, currentVersion);
            return {
                available,
                currentVersion,
                latestVersion,
                releaseUrl: release.html_url,
                releaseNotes: release.body,
            };
        }
        catch {
            return { available: false, currentVersion };
        }
    }
    fetchLatestRelease() {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
        return new Promise((resolve, reject) => {
            const req = https_1.default.get(url, { headers: { 'User-Agent': 'Jarvis-App' } }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk.toString(); });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch {
                        reject(new Error('Failed to parse GitHub release response'));
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(10_000, () => {
                req.destroy();
                reject(new Error('Update check timed out'));
            });
        });
    }
    isNewerVersion(latest, current) {
        const parse = (v) => v.split('.').map(Number);
        const [lMaj, lMin, lPatch] = parse(latest);
        const [cMaj, cMin, cPatch] = parse(current);
        if (lMaj !== cMaj) {
            return (lMaj ?? 0) > (cMaj ?? 0);
        }
        if (lMin !== cMin) {
            return (lMin ?? 0) > (cMin ?? 0);
        }
        return (lPatch ?? 0) > (cPatch ?? 0);
    }
}
exports.UpdateCheckerService = UpdateCheckerService;
//# sourceMappingURL=UpdateCheckerService.js.map