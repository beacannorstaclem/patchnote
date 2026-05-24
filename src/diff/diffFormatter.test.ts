import {
  formatFileStatus,
  formatDiffStats,
  formatDiffSummary,
  appendDiffToReleaseNotes,
} from './diffFormatter';
import type { CommitDiffSummary } from './diffParser';

const mockSummary: CommitDiffSummary = {
  commitHash: 'abc123',
  totalAdditions: 42,
  totalDeletions: 7,
  filesChanged: 3,
  files: [
    { filename: 'src/foo.ts', additions: 20, deletions: 5, status: 'modified' },
    { filename: 'src/bar.ts', additions: 15, deletions: 2, status: 'added' },
    { filename: 'src/old.ts', additions: 7, deletions: 0, status: 'deleted' },
  ],
};

describe('formatFileStatus', () => {
  it('formats a modified file with icon', () => {
    const result = formatFileStatus(mockSummary.files[0]);
    expect(result).toContain('src/foo.ts');
    expect(result).toContain('+20');
    expect(result).toContain('-5');
  });

  it('formats a renamed file with arrow', () => {
    const renamed = {
      filename: 'src/new.ts',
      oldFilename: 'src/old.ts',
      additions: 0,
      deletions: 0,
      status: 'renamed' as const,
    };
    const result = formatFileStatus(renamed);
    expect(result).toContain('src/old.ts → src/new.ts');
  });
});

describe('formatDiffStats', () => {
  it('includes files changed count', () => {
    const result = formatDiffStats(mockSummary);
    expect(result).toContain('3 files changed');
  });

  it('includes additions and deletions', () => {
    const result = formatDiffStats(mockSummary);
    expect(result).toContain('+42');
    expect(result).toContain('-7');
  });

  it('omits additions if zero', () => {
    const result = formatDiffStats({ ...mockSummary, totalAdditions: 0 });
    expect(result).not.toContain('additions');
  });
});

describe('formatDiffSummary', () => {
  it('shows stats by default', () => {
    const result = formatDiffSummary(mockSummary);
    expect(result).toContain('files changed');
  });

  it('shows files when showFiles is true', () => {
    const result = formatDiffSummary(mockSummary, { showFiles: true });
    expect(result).toContain('src/foo.ts');
  });

  it('limits files shown with maxFiles', () => {
    const result = formatDiffSummary(mockSummary, { showFiles: true, maxFiles: 1 });
    expect(result).toContain('2 more file');
  });
});

describe('appendDiffToReleaseNotes', () => {
  it('appends a Stats section to release notes', () => {
    const notes = '## v1.0.0\n\n- feat: something';
    const result = appendDiffToReleaseNotes(notes, mockSummary);
    expect(result).toContain('## Stats');
    expect(result).toContain('files changed');
  });

  it('returns original notes unchanged when stats disabled', () => {
    const notes = '## v1.0.0';
    const result = appendDiffToReleaseNotes(notes, mockSummary, { showStats: false });
    expect(result).toBe(notes);
  });
});
