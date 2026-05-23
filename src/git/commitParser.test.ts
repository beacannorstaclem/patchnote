import { describe, it, expect } from 'vitest';
import { parseCommitMessage, ParsedCommit } from './commitParser';

const FAKE_HASH = 'abc123def456789';

describe('parseCommitMessage', () => {
  it('parses a standard feat commit', () => {
    const result = parseCommitMessage('feat: add login page', FAKE_HASH);
    expect(result.type).toBe('feat');
    expect(result.subject).toBe('add login page');
    expect(result.scope).toBeUndefined();
    expect(result.breaking).toBe(false);
    expect(result.shortHash).toBe('abc123d');
  });

  it('parses a commit with scope', () => {
    const result = parseCommitMessage('fix(auth): handle token expiry', FAKE_HASH);
    expect(result.type).toBe('fix');
    expect(result.scope).toBe('auth');
    expect(result.subject).toBe('handle token expiry');
  });

  it('detects breaking change via ! marker', () => {
    const result = parseCommitMessage('feat!: redesign API response format', FAKE_HASH);
    expect(result.breaking).toBe(true);
    expect(result.type).toBe('feat');
  });

  it('detects breaking change via BREAKING CHANGE in body', () => {
    const msg = 'refactor: update config schema\n\nBREAKING CHANGE: removed legacy keys';
    const result = parseCommitMessage(msg, FAKE_HASH);
    expect(result.breaking).toBe(true);
    expect(result.body).toContain('BREAKING CHANGE');
  });

  it('falls back gracefully for non-conventional commits', () => {
    const result = parseCommitMessage('Merge branch main into dev', FAKE_HASH);
    expect(result.type).toBe('other');
    expect(result.subject).toBe('Merge branch main into dev');
    expect(result.breaking).toBe(false);
  });

  it('parses commit body correctly', () => {
    const msg = 'docs: update README\n\nAdded installation section and usage examples.';
    const result = parseCommitMessage(msg, FAKE_HASH);
    expect(result.body).toBe('Added installation section and usage examples.');
  });
});
