import { applyFilters, filterByType, filterByScope, filterByDate, filterBreakingOnly } from './commitFilter';
import { ParsedCommit } from '../git/commitParser';

const makeCommit = (overrides: Partial<ParsedCommit>): ParsedCommit => ({
  hash: 'abc123',
  type: 'feat',
  scope: undefined,
  subject: 'test commit',
  body: '',
  breaking: false,
  date: '2024-01-15',
  raw: '',
  ...overrides,
});

const commits: ParsedCommit[] = [
  makeCommit({ type: 'feat', scope: 'auth', hash: '1' }),
  makeCommit({ type: 'fix', scope: 'api', hash: '2' }),
  makeCommit({ type: 'chore', scope: undefined, hash: '3' }),
  makeCommit({ type: 'feat', scope: 'ui', breaking: true, hash: '4' }),
  makeCommit({ type: 'docs', scope: 'readme', date: '2024-03-01', hash: '5' }),
];

describe('filterByType', () => {
  it('returns only commits matching given types', () => {
    const result = filterByType(commits, ['feat']);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.type === 'feat')).toBe(true);
  });

  it('returns empty array when no types match', () => {
    expect(filterByType(commits, ['refactor'])).toHaveLength(0);
  });
});

describe('filterByScope', () => {
  it('returns only commits with matching scope', () => {
    const result = filterByScope(commits, ['auth', 'api']);
    expect(result).toHaveLength(2);
  });

  it('excludes commits without scope', () => {
    const result = filterByScope(commits, ['auth']);
    expect(result.every((c) => c.scope === 'auth')).toBe(true);
  });
});

describe('filterByDate', () => {
  it('filters commits after since date', () => {
    const result = filterByDate(commits, new Date('2024-02-01'));
    expect(result).toHaveLength(1);
    expect(result[0].hash).toBe('5');
  });

  it('returns all commits when no dates provided', () => {
    expect(filterByDate(commits)).toHaveLength(commits.length);
  });
});

describe('filterBreakingOnly', () => {
  it('returns only breaking commits', () => {
    const result = filterBreakingOnly(commits);
    expect(result).toHaveLength(1);
    expect(result[0].hash).toBe('4');
  });
});

describe('applyFilters', () => {
  it('applies excludeTypes filter', () => {
    const result = applyFilters(commits, { excludeTypes: ['chore', 'docs'] });
    expect(result.every((c) => !['chore', 'docs'].includes(c.type))).toBe(true);
  });

  it('applies excludeScopes filter', () => {
    const result = applyFilters(commits, { excludeScopes: ['readme'] });
    expect(result.find((c) => c.scope === 'readme')).toBeUndefined();
  });

  it('combines multiple filters', () => {
    const result = applyFilters(commits, { types: ['feat'], breakingOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].breaking).toBe(true);
  });
});
