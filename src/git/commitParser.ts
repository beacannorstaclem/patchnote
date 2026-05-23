import { execSync } from 'child_process';

export interface ParsedCommit {
  hash: string;
  shortHash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  raw: string;
}

const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(([^)]+)\))?(!)?:\s(.+)$/;

export function parseCommitMessage(raw: string, hash: string): ParsedCommit {
  const lines = raw.trim().split('\n');
  const headline = lines[0];
  const body = lines.slice(1).join('\n').trim() || undefined;

  const match = headline.match(CONVENTIONAL_COMMIT_REGEX);

  if (!match) {
    return {
      hash,
      shortHash: hash.slice(0, 7),
      type: 'other',
      subject: headline,
      body,
      breaking: false,
      raw,
    };
  }

  const [, type, , scope, breakingMark, subject] = match;
  const breaking =
    breakingMark === '!' || (body?.includes('BREAKING CHANGE:') ?? false);

  return {
    hash,
    shortHash: hash.slice(0, 7),
    type,
    scope: scope || undefined,
    subject,
    body,
    breaking,
    raw,
  };
}

export function getCommitsSince(tag?: string, repoPath = '.'): ParsedCommit[] {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const delimiter = '---COMMIT---';
  const format = `--pretty=format:%H${delimiter}%B${delimiter}END`;

  const output = execSync(`git -C ${repoPath} log ${range} ${format}`, {
    encoding: 'utf-8',
  });

  if (!output.trim()) return [];

  return output
    .split(`${delimiter}END`)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const idx = block.indexOf(delimiter);
      const hash = block.slice(0, idx).trim();
      const message = block.slice(idx + delimiter.length).trim();
      return parseCommitMessage(message, hash);
    });
}
