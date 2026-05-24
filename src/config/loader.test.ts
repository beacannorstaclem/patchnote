import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { findConfigFile, loadConfig, mergeConfig } from './loader';
import { DEFAULT_CONFIG } from './types';

describe('mergeConfig', () => {
  it('returns defaults when no overrides provided', () => {
    const result = mergeConfig(DEFAULT_CONFIG, {});
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('overrides specific fields', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { format: 'json', groupByScope: true });
    expect(result.format).toBe('json');
    expect(result.groupByScope).toBe(true);
    expect(result.includeBreakingChanges).toBe(DEFAULT_CONFIG.includeBreakingChanges);
  });
});

describe('findConfigFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patchnote-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when no config file exists', () => {
    const result = findConfigFile(tmpDir);
    expect(result).toBeNull();
  });

  it('finds patchnote.config.json in the given directory', () => {
    const configPath = path.join(tmpDir, 'patchnote.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ format: 'json' }));
    const result = findConfigFile(tmpDir);
    expect(result).toBe(configPath);
  });

  it('finds .patchnoterc in a parent directory', () => {
    const configPath = path.join(tmpDir, '.patchnoterc');
    fs.writeFileSync(configPath, JSON.stringify({ format: 'plain' }));
    const subDir = path.join(tmpDir, 'sub', 'dir');
    fs.mkdirSync(subDir, { recursive: true });
    const result = findConfigFile(subDir);
    expect(result).toBe(configPath);
  });
});

describe('loadConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patchnote-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns defaults when no config file found', () => {
    const result = loadConfig(undefined);
    expect(result).toMatchObject(DEFAULT_CONFIG);
  });

  it('loads and merges config from explicit path', () => {
    const configPath = path.join(tmpDir, 'patchnote.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ format: 'json', title: 'My Release' }));
    const result = loadConfig(configPath);
    expect(result.format).toBe('json');
    expect(result.title).toBe('My Release');
    expect(result.includeBreakingChanges).toBe(DEFAULT_CONFIG.includeBreakingChanges);
  });

  it('throws on invalid JSON', () => {
    const configPath = path.join(tmpDir, 'patchnote.config.json');
    fs.writeFileSync(configPath, '{ invalid json }');
    expect(() => loadConfig(configPath)).toThrow('Failed to load config');
  });
});
