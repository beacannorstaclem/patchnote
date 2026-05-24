import { groupByScope, formatSectionWithScopes, extractScopes } from './scopeFormatter';
import { ParsedCommit } from './types';

const makeCommit = (scope: string | undefined, description: string): ParsedCommit => ({
  type: 'feat',
  scope,
  description,
  breaking: false,
  raw: `feat${scope ? `(${scope})` : ''}: ${description}`,
  hash: 'abc1234',
});

describe('extractScopes', () => {
  it('returns unique scopes from commits', () => {
    const commits = [
      makeCommit('auth', 'add login'),
      makeCommit('auth', 'add logout'),
      makeCommit('api', 'add endpoint'),
      makeCommit(undefined, 'misc change'),
    ];
    const scopes = extractScopes(commits);
    expect(scopes).toContain('auth');
    expect(scopes).toContain('api');
    expect(scopes).toHaveLength(2);
  });

  it('returns empty array when no scopes present', () => {
    const commits = [makeCommit(undefined, 'no scope')];
    expect(extractScopes(commits)).toEqual([]);
  });
});

describe('groupByScope', () => {
  it('groups commits by scope', () => {
    const commits = [
      makeCommit('auth', 'login'),
      makeCommit('auth', 'logout'),
      makeCommit('api', 'endpoint'),
    ];
    const grouped = groupByScope(commits);
    expect(grouped['auth']).toHaveLength(2);
    expect(grouped['api']).toHaveLength(1);
  });

  it('groups commits with no scope under empty string key', () => {
    const commits = [makeCommit(undefined, 'general fix')];
    const grouped = groupByScope(commits);
    expect(grouped['']).toHaveLength(1);
  });
});

describe('formatSectionWithScopes', () => {
  it('formats section with scope headers', () => {
    const commits = [
      makeCommit('auth', 'add login'),
      makeCommit('api', 'add endpoint'),
    ];
    const result = formatSectionWithScopes('Features', commits);
    expect(result).toContain('### Features');
    expect(result).toContain('**auth**');
    expect(result).toContain('**api**');
    expect(result).toContain('add login');
    expect(result).toContain('add endpoint');
  });

  it('returns empty string for empty commits array', () => {
    expect(formatSectionWithScopes('Features', [])).toBe('');
  });
});
