import path from 'path';
import { HookRegistry, HookName, HookFn } from './types';

export interface Plugin {
  name: string;
  hooks: Partial<Record<HookName, HookFn>>;
}

export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  const resolved = path.isAbsolute(pluginPath)
    ? pluginPath
    : path.resolve(process.cwd(), pluginPath);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = await import(resolved);
  const plugin: Plugin = mod.default ?? mod;
  if (!plugin.name || typeof plugin.name !== 'string') {
    throw new Error(`Plugin at "${pluginPath}" must export a "name" string.`);
  }
  if (!plugin.hooks || typeof plugin.hooks !== 'object') {
    throw new Error(`Plugin at "${pluginPath}" must export a "hooks" object.`);
  }
  return plugin;
}

export function applyPlugin(registry: HookRegistry, plugin: Plugin): void {
  for (const [hookName, fn] of Object.entries(plugin.hooks)) {
    if (fn) {
      registry.register(hookName as HookName, fn);
    }
  }
}

export async function loadAndApplyPlugins(
  registry: HookRegistry,
  pluginPaths: string[]
): Promise<Plugin[]> {
  const loaded: Plugin[] = [];
  for (const p of pluginPaths) {
    const plugin = await loadPlugin(p);
    applyPlugin(registry, plugin);
    loaded.push(plugin);
  }
  return loaded;
}
