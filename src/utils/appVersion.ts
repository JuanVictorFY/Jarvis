import { app } from 'electron';

export function getAppVersion(): string {
  return app.getVersion();
}

export function getElectronVersion(): string {
  return process.versions.electron ?? 'unknown';
}

export function getNodeVersion(): string {
  return process.versions.node ?? 'unknown';
}

export function getChromeVersion(): string {
  return process.versions.chrome ?? 'unknown';
}

export function getVersionInfo(): {
  app: string;
  electron: string;
  node: string;
  chrome: string;
  platform: string;
  arch: string;
} {
  return {
    app: getAppVersion(),
    electron: getElectronVersion(),
    node: getNodeVersion(),
    chrome: getChromeVersion(),
    platform: process.platform,
    arch: process.arch,
  };
}
