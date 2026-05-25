import { createHookRegistry } from './hookRunner';
import { HookContext } from './types';

describe('hookRunner', () => {
  it('registers and runs a hook', async () => {
    const registry = createHookRegistry();
    const calls: HookContext[] = [];
    registry.register('before:generate', (ctx) => { calls.push(ctx); });
    await registry.run('before:generate', { version: '1.0.0' });
    expect(calls).toHaveLength(1);
    expect(calls[0].version).toBe('1.0.0');
  });

  it('runs multiple hooks in order', async () => {
    const registry = createHookRegistry();
    const order: number[] = [];
    registry.register('after:generate', () => { order.push(1); });
    registry.register('after:generate', () => { order.push(2); });
    await registry.run('after:generate', {});
    expect(order).toEqual([1, 2]);
  });

  it('supports async hooks', async () => {
    const registry = createHookRegistry();
    let done = false;
    registry.register('before:write', async () => {
      await new Promise((r) => setTimeout(r, 10));
      done = true;
    });
    await registry.run('before:write', {});
    expect(done).toBe(true);
  });

  it('unregisters a specific hook', async () => {
    const registry = createHookRegistry();
    const calls: number[] = [];
    const fn1 = () => { calls.push(1); };
    const fn2 = () => { calls.push(2); };
    registry.register('after:write', fn1);
    registry.register('after:write', fn2);
    const removed = registry.unregister('after:write', fn1);
    expect(removed).toBe(true);
    await registry.run('after:write', {});
    expect(calls).toEqual([2]);
  });

  it('returns false when unregistering unknown hook', () => {
    const registry = createHookRegistry();
    const result = registry.unregister('on:error', () => {});
    expect(result).toBe(false);
  });

  it('clears a named hook list', async () => {
    const registry = createHookRegistry();
    const calls: number[] = [];
    registry.register('before:generate', () => { calls.push(1); });
    registry.clear('before:generate');
    await registry.run('before:generate', {});
    expect(calls).toHaveLength(0);
  });

  it('clears all hooks', async () => {
    const registry = createHookRegistry();
    const calls: number[] = [];
    registry.register('before:generate', () => { calls.push(1); });
    registry.register('after:generate', () => { calls.push(2); });
    registry.clear();
    await registry.run('before:generate', {});
    await registry.run('after:generate', {});
    expect(calls).toHaveLength(0);
  });

  it('does nothing when running hook with no registered fns', async () => {
    const registry = createHookRegistry();
    await expect(registry.run('on:error', {})).resolves.toBeUndefined();
  });
});
