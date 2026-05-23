export { getCommitsSince, parseCommitMessage } from './commitParser';
export type { ParsedCommit } from './commitParser';

import { execSync } from 'child_process';

/**
 * Returns the most recent git tag in the repository.
 * Returns undefined if no tags exist.
 */
export function getLatestTag(repoPath = '.'): string | undefined {
  try {
    const tag = execSync(
      `git -C ${repoPath} describe --tags --abbrev=0`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    return tag || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returns all tags sorted by version (descending).
 */
export function getAllTags(repoPath = '.'): string[] {
  try {
    const output = execSync(
      `git -C ${repoPath} tag --sort=-version:refname`,
      { encoding: 'utf-8' }
    ).trim();
    return output ? output.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * Checks whether the current working directory is a git repository.
 */
export function isGitRepository(repoPath = '.'): boolean {
  try {
    execSync(`git -C ${repoPath} rev-parse --git-dir`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}
