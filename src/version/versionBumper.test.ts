import {
  determineBump,
  parseVersion,
  bumpVersion,
  getVersionInfo,
} from './versionBumper';
import { ParsedCommit } from '../git/commitParser';

const makeCommit = (overrides: Partial<ParsedCommit>): ParsedCommit => ({
  hash: 'abc1234',
  type: 'chore',
  scope: null,
  subject: 'update deps',
  body: null,
  footer: null,
  breaking: false,
  raw: 'chore: update deps',
  ...overrides,
});

describe('determineBump', () => {
  it('returns none for empty commits', () => {
    expect(determineBump([])).toBe('none');
  });

  it('returns patch for fix commits', () => {
    expect(determineBump([makeCommit({ type: 'fix' })])).toBe('patch');
  });

  it('returns minor for feat commits', () => {
    expect(determineBump([makeCommit({ type: 'feat' })])).toBe('minor');
  });

  it('returns major for breaking commits', () => {
    expect(determineBump([makeCommit({ type: 'feat', breaking: true })])).toBe('major');
  });

  it('returns major when footer contains BREAKING CHANGE', () => {
    expect(
      determineBump([makeCommit({ footer: 'BREAKING CHANGE: removed API' })])
    ).toBe('major');
  });

  it('prefers major over minor', () => {
    const commits = [
      makeCommit({ type: 'feat' }),
      makeCommit({ type: 'fix', breaking: true }),
    ];
    expect(determineBump(commits)).toBe('major');
  });
});

describe('parseVersion', () => {
  it('parses plain semver', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
  });

  it('parses v-prefixed semver', () => {
    expect(parseVersion('v2.0.1')).toEqual([2, 0, 1]);
  });

  it('throws on invalid version', () => {
    expect(() => parseVersion('not-a-version')).toThrow();
  });
});

describe('bumpVersion', () => {
  it('bumps patch', () => expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4'));
  it('bumps minor', () => expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0'));
  it('bumps major', () => expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0'));
  it('preserves v prefix', () => expect(bumpVersion('v1.2.3', 'minor')).toBe('v1.3.0'));
  it('returns same version for none', () => expect(bumpVersion('1.2.3', 'none')).toBe('1.2.3'));
});

describe('getVersionInfo', () => {
  it('returns full version info object', () => {
    const commits = [makeCommit({ type: 'feat' })];
    const info = getVersionInfo('1.0.0', commits);
    expect(info).toEqual({ current: '1.0.0', next: '1.1.0', bump: 'minor' });
  });
});
