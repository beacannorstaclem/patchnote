import { parseStatusLetter, getDiffSummary, getDiffBetweenTags } from './diffParser';
import { execSync } from 'child_process';

jest.mock('child_process');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('parseStatusLetter', () => {
  it('returns added for A', () => {
    expect(parseStatusLetter('A')).toBe('added');
  });

  it('returns deleted for D', () => {
    expect(parseStatusLetter('D')).toBe('deleted');
  });

  it('returns modified for M', () => {
    expect(parseStatusLetter('M')).toBe('modified');
  });

  it('returns renamed for R', () => {
    expect(parseStatusLetter('R')).toBe('renamed');
  });

  it('defaults to modified for unknown letters', () => {
    expect(parseStatusLetter('X')).toBe('modified');
  });
});

describe('getDiffSummary', () => {
  beforeEach(() => {
    mockExecSync
      .mockReturnValueOnce('10\t2\tsrc/foo.ts\n5\t0\tsrc/bar.ts' as any)
      .mockReturnValueOnce('M\tsrc/foo.ts\nA\tsrc/bar.ts' as any);
  });

  it('parses numstat and name-status output correctly', () => {
    const result = getDiffSummary('abc1234');
    expect(result.commitHash).toBe('abc1234');
    expect(result.filesChanged).toBe(2);
    expect(result.totalAdditions).toBe(15);
    expect(result.totalDeletions).toBe(2);
    expect(result.files[0].status).toBe('modified');
    expect(result.files[1].status).toBe('added');
  });
});

describe('getDiffBetweenTags', () => {
  it('returns summary for a tag range', () => {
    mockExecSync.mockReturnValueOnce('3\t1\tsrc/index.ts' as any);
    const result = getDiffBetweenTags('v1.0.0', 'v1.1.0');
    expect(result.commitHash).toBe('v1.0.0..v1.1.0');
    expect(result.filesChanged).toBe(1);
    expect(result.totalAdditions).toBe(3);
    expect(result.totalDeletions).toBe(1);
  });

  it('handles empty diff output', () => {
    mockExecSync.mockReturnValueOnce('' as any);
    const result = getDiffBetweenTags('v1.0.0');
    expect(result.filesChanged).toBe(0);
    expect(result.files).toHaveLength(0);
  });
});
