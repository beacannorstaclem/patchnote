import { describe, it, expect } from 'vitest';
import { buildReleaseNotes, formatMarkdown } from './markdownFormatter';
import type { ParsedCommit } from './types';

const makeCommit = (overrides: Partial<ParsedCommit>): ParsedCommit => ({
  hash: 'abc1234567890',
  type: 'feat',
  subject: 'add something cool',
  breaking: false,
  raw: 'feat: add something cool',
  ...overrides,
});

describe('buildReleaseNotes', () => {
  it('groups commits by type', () => {
    const commits = [
      makeCommit({ type: 'feat', subject: 'new feature' }),
      makeCommit({ type: 'fix', subject: 'bug fix', hash: 'def456' }),
    ];
    const notes = buildReleaseNotes(commits, { version: '1.0.0' });
    expect(notes.sections).toHaveLength(2);
    expect(notes.sections[0].commits[0].subject).toBe('new feature');
  });

  it('filters out excluded types', () => {
    const commits = [
      makeCommit({ type: 'chore', subject: 'update deps' }),
      makeCommit({ type: 'feat', subject: 'new feature' }),
    ];
    const notes = buildReleaseNotes(commits, {
      version: '1.0.0',
      includeTypes: ['feat'],
    });
    expect(notes.sections).toHaveLength(1);
  });

  it('collects breaking changes', () => {
    const commits = [
      makeCommit({ breaking: true, subject: 'remove old api' }),
    ];
    const notes = buildReleaseNotes(commits, { version: '2.0.0' });
    expect(notes.breakingChanges).toHaveLength(1);
  });
});

describe('formatMarkdown', () => {
  it('renders version header', () => {
    const notes = buildReleaseNotes(
      [makeCommit({ type: 'feat', subject: 'initial release' })],
      { version: '1.0.0' }
    );
    const md = formatMarkdown(notes);
    expect(md).toContain('## [1.0.0]');
  });

  it('includes commit hash as short link', () => {
    const notes = buildReleaseNotes(
      [makeCommit({ hash: 'abc1234567890', type: 'fix', subject: 'patch bug' })],
      { version: '1.0.1' }
    );
    const md = formatMarkdown(notes);
    expect(md).toContain('abc1234');
  });

  it('renders repo url as hyperlink', () => {
    const notes = buildReleaseNotes(
      [makeCommit({ type: 'feat', subject: 'linked commit' })],
      { version: '1.1.0' }
    );
    const md = formatMarkdown(notes, 'https://github.com/user/repo');
    expect(md).toContain('https://github.com/user/repo/commit/');
  });

  it('renders breaking changes section', () => {
    const notes = buildReleaseNotes(
      [makeCommit({ breaking: true, type: 'feat', subject: 'drop node 14' })],
      { version: '3.0.0' }
    );
    const md = formatMarkdown(notes);
    expect(md).toContain('⚠️ Breaking Changes');
    expect(md).toContain('drop node 14');
  });
});
