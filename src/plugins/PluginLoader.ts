import * as path from 'path';
import { Plugin } from './PluginManager';

export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  const absolutePath = path.resolve(pluginPath);
  const mod = await import(absolutePath);
  if (typeof mod.default !== 'object') throw new Error(`Plugin at ${pluginPath} must export a default object`);
  return mod.default as Plugin;
}
