export type HookName =
  | 'before:generate'
  | 'after:generate'
  | 'before:write'
  | 'after:write'
  | 'on:error';

export interface HookContext {
  version?: string;
  fromTag?: string;
  toTag?: string;
  outputPath?: string;
  content?: string;
  error?: Error;
}

export type HookFn = (context: HookContext) => void | Promise<void>;

export interface HookMap {
  'before:generate'?: HookFn[];
  'after:generate'?: HookFn[];
  'before:write'?: HookFn[];
  'after:write'?: HookFn[];
  'on:error'?: HookFn[];
}

export interface HookRegistry {
  register(name: HookName, fn: HookFn): void;
  unregister(name: HookName, fn: HookFn): boolean;
  run(name: HookName, context: HookContext): Promise<void>;
  clear(name?: HookName): void;
}
