import * as fs from 'fs';
import * as path from 'path';
import { PatchnoteConfig, DEFAULT_CONFIG } from './types';

const CONFIG_FILE_NAMES = [
  'patchnote.config.json',
  '.patchnoterc',
  '.patchnoterc.json',
];

/**
 * Searches for a config file starting from the given directory
 * and walking up to the filesystem root.
 */
export function findConfigFile(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;

  while (true) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const candidate = path.join(currentDir, fileName);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

/**
 * Loads and merges config from file with defaults.
 * Returns DEFAULT_CONFIG if no file is found.
 */
export function loadConfig(configPath?: string): PatchnoteConfig {
  const resolvedPath = configPath ?? findConfigFile();

  if (!resolvedPath) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const parsed: Partial<PatchnoteConfig> = JSON.parse(raw);
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch (err) {
    throw new Error(`Failed to load config from ${resolvedPath}: ${(err as Error).message}`);
  }
}

/**
 * Merges user-provided config over the defaults.
 */
export function mergeConfig(
  defaults: PatchnoteConfig,
  overrides: Partial<PatchnoteConfig>
): PatchnoteConfig {
  return {
    ...defaults,
    ...overrides,
  };
}
