import { parseCliArgs, mergeCliOptions } from './options';
import { PatchnoteConfig } from '../config/types';

const baseConfig: PatchnoteConfig = {
  format: 'markdown',
  output: { stdout: false, file: 'CHANGELOG.md' },
  version: '1.0.0',
  types: [],
};

describe('parseCliArgs', () => {
  it('parses --from and --to flags', () => {
    const opts = parseCliArgs(['--from', 'v1.0.0', '--to', 'v2.0.0']);
    expect(opts.from).toBe('v1.0.0');
    expect(opts.to).toBe('v2.0.0');
  });

  it('parses short flags -f and -t', () => {
    const opts = parseCliArgs(['-f', 'abc123', '-t', 'HEAD']);
    expect(opts.from).toBe('abc123');
    expect(opts.to).toBe('HEAD');
  });

  it('parses --output flag', () => {
    const opts = parseCliArgs(['--output', 'RELEASE.md']);
    expect(opts.output).toBe('RELEASE.md');
  });

  it('parses --stdout flag as boolean', () => {
    const opts = parseCliArgs(['--stdout']);
    expect(opts.stdout).toBe(true);
  });

  it('parses --format flag', () => {
    const opts = parseCliArgs(['--format', 'json']);
    expect(opts.format).toBe('json');
  });

  it('parses --verbose flag', () => {
    const opts = parseCliArgs(['--verbose']);
    expect(opts.verbose).toBe(true);
  });

  it('returns empty object for no args', () => {
    const opts = parseCliArgs([]);
    expect(opts).toEqual({});
  });
});

describe('mergeCliOptions', () => {
  it('overrides output file when --output is provided', () => {
    const result = mergeCliOptions(baseConfig, { output: 'NOTES.md' });
    expect(result.output.file).toBe('NOTES.md');
  });

  it('sets stdout true when --stdout is provided', () => {
    const result = mergeCliOptions(baseConfig, { stdout: true });
    expect(result.output.stdout).toBe(true);
  });

  it('overrides format when --format is provided', () => {
    const result = mergeCliOptions(baseConfig, { format: 'json' });
    expect(result.format).toBe('json');
  });

  it('does not mutate original config', () => {
    mergeCliOptions(baseConfig, { format: 'json' });
    expect(baseConfig.format).toBe('markdown');
  });
});
