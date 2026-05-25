import { searchCommits, buildSearchRegex, scoreMatch, extractSearchTerms } from './commitSearch';
import { ParsedCommit } from '../git/commitParser';

const makeCommit = (overrides: Partial<ParsedCommit>): ParsedCommit => ({
  hash: 'abc1234',
  type: 'feat',
  scope: null,
  subject: 'add new feature',
  body: null,
  breaking: false,
  raw: 'feat: add new feature',
  ...overrides,
});

describe('buildSearchRegex', () => {
  it('escapes special characters when not regex mode', () => {
    const re = buildSearchRegex('feat(core)', false, false);
    expect(re.source).toBe('feat\\(core\\)');
  });

  it('uses raw pattern in regex mode', () => {
    const re = buildSearchRegex('feat.*', false, true);
    expect(re.source).toBe('feat.*');
  });

  it('sets case-insensitive flag by default', () => {
    const re = buildSearchRegex('test', false, false);
    expect(re.flags).toContain('i');
  });

  it('omits case-insensitive flag when caseSensitive is true', () => {
    const re = buildSearchRegex('test', true, false);
    expect(re.flags).not.toContain('i');
  });
});

describe('scoreMatch', () => {
  it('returns 0 when no match', () => {
    const re = buildSearchRegex('xyz', false, false);
    expect(scoreMatch('no match here', re)).toBe(0);
  });

  it('counts multiple occurrences', () => {
    const re = buildSearchRegex('fix', false, false);
    expect(scoreMatch('fix the fix after fix', re)).toBe(3);
  });
});

describe('searchCommits', () => {
  const commits: ParsedCommit[] = [
    makeCommit({ hash: '1', type: 'feat', subject: 'add login page', scope: 'auth' }),
    makeCommit({ hash: '2', type: 'fix', subject: 'fix logout bug', scope: 'auth' }),
    makeCommit({ hash: '3', type: 'chore', subject: 'update dependencies', scope: null }),
  ];

  it('returns all commits with empty query', () => {
    const results = searchCommits(commits, { query: '' });
    expect(results).toHaveLength(3);
  });

  it('filters commits by subject keyword', () => {
    const results = searchCommits(commits, { query: 'login' });
    expect(results).toHaveLength(1);
    expect(results[0].commit.hash).toBe('1');
  });

  it('searches across multiple fields', () => {
    const results = searchCommits(commits, { query: 'auth', fields: ['scope'] });
    expect(results).toHaveLength(2);
  });

  it('sorts results by score descending', () => {
    const results = searchCommits(commits, { query: 'fix', fields: ['type', 'subject'] });
    expect(results[0].score).toBeGreaterThanOrEqual(results[1]?.score ?? 0);
  });

  it('returns empty array for invalid regex', () => {
    const results = searchCommits(commits, { query: '[invalid', regex: true });
    expect(results).toHaveLength(0);
  });
});

describe('extractSearchTerms', () => {
  it('splits query into terms', () => {
    expect(extractSearchTerms('feat fix chore')).toEqual(['feat', 'fix', 'chore']);
  });

  it('handles extra whitespace', () => {
    expect(extractSearchTerms('  feat   fix  ')).toEqual(['feat', 'fix']);
  });

  it('returns empty array for blank string', () => {
    expect(extractSearchTerms('   ')).toEqual([]);
  });
});
