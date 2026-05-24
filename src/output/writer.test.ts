import fs from 'fs';
import path from 'path';
import os from 'os';
import { writeToFile, appendToFile, handleOutput } from './writer';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patchnote-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('writeToFile', () => {
  it('creates file with content', () => {
    const filePath = path.join(tmpDir, 'CHANGELOG.md');
    writeToFile('# Changelog', filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('# Changelog');
  });

  it('creates nested directories if missing', () => {
    const filePath = path.join(tmpDir, 'nested', 'dir', 'CHANGELOG.md');
    writeToFile('# Changelog', filePath);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('overwrites existing file', () => {
    const filePath = path.join(tmpDir, 'CHANGELOG.md');
    writeToFile('old content', filePath);
    writeToFile('new content', filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('new content');
  });
});

describe('appendToFile', () => {
  it('prepends content to existing file', () => {
    const filePath = path.join(tmpDir, 'CHANGELOG.md');
    fs.writeFileSync(filePath, '## v1.0.0', 'utf-8');
    appendToFile('## v1.1.0', filePath);
    const result = fs.readFileSync(filePath, 'utf-8');
    expect(result).toContain('## v1.1.0');
    expect(result.indexOf('## v1.1.0')).toBeLessThan(result.indexOf('## v1.0.0'));
  });

  it('creates file if it does not exist', () => {
    const filePath = path.join(tmpDir, 'CHANGELOG.md');
    appendToFile('## v1.0.0', filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('## v1.0.0');
  });
});

describe('handleOutput', () => {
  it('writes to file when filePath is provided', () => {
    const filePath = path.join(tmpDir, 'out.md');
    handleOutput('content', { filePath });
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('content');
  });

  it('uses append mode when append is true', () => {
    const filePath = path.join(tmpDir, 'out.md');
    fs.writeFileSync(filePath, 'old', 'utf-8');
    handleOutput('new', { filePath, append: true });
    expect(fs.readFileSync(filePath, 'utf-8')).toContain('new');
  });
});
