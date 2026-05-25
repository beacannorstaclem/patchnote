import { HookName, HookFn, HookContext, HookMap, HookRegistry } from './types';

export function createHookRegistry(): HookRegistry {
  const hooks: HookMap = {};

  function register(name: HookName, fn: HookFn): void {
    if (!hooks[name]) {
      hooks[name] = [];
    }
    (hooks[name] as HookFn[]).push(fn);
  }

  function unregister(name: HookName, fn: HookFn): boolean {
    const list = hooks[name] as HookFn[] | undefined;
    if (!list) return false;
    const idx = list.indexOf(fn);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  async function run(name: HookName, context: HookContext): Promise<void> {
    const list = hooks[name] as HookFn[] | undefined;
    if (!list || list.length === 0) return;
    for (const fn of list) {
      await fn(context);
    }
  }

  function clear(name?: HookName): void {
    if (name) {
      delete hooks[name];
    } else {
      (Object.keys(hooks) as HookName[]).forEach((k) => delete hooks[k]);
    }
  }

  return { register, unregister, run, clear };
}

export const globalRegistry = createHookRegistry();
