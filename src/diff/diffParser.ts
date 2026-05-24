import { execSync } from 'child_process';

export interface FileDiff {
  filename: string;
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldFilename?: string;
}

export interface CommitDiffSummary {
  commitHash: string;
  totalAdditions: number;
  totalDeletions: number;
  filesChanged: number;
  files: FileDiff[];
}

export function parseStatusLetter(letter: string): FileDiff['status'] {
  switch (letter) {
    case 'A': return 'added';
    case 'D': return 'deleted';
    case 'M': return 'modified';
    case 'R': return 'renamed';
    default: return 'modified';
  }
}

export function getDiffSummary(commitHash: string, repoPath = '.'): CommitDiffSummary {
  const numstatOutput = execSync(
    `git -C ${repoPath} diff-tree --no-commit-id -r --numstat ${commitHash}`,
    { encoding: 'utf-8' }
  ).trim();

  const nameStatusOutput = execSync(
    `git -C ${repoPath} diff-tree --no-commit-id -r --name-status ${commitHash}`,
    { encoding: 'utf-8' }
  ).trim();

  const nameStatusLines = nameStatusOutput ? nameStatusOutput.split('\n') : [];
  const numstatLines = numstatOutput ? numstatOutput.split('\n') : [];

  const files: FileDiff[] = numstatLines
    .filter(line => line.trim() !== '')
    .map((line, index) => {
      const [additions, deletions, filename] = line.split('\t');
      const statusLine = nameStatusLines[index] || '';
      const statusLetter = statusLine.split('\t')[0]?.charAt(0) || 'M';
      const status = parseStatusLetter(statusLetter);

      const fileDiff: FileDiff = {
        filename,
        additions: parseInt(additions, 10) || 0,
        deletions: parseInt(deletions, 10) || 0,
        status,
      };

      if (status === 'renamed') {
        const parts = statusLine.split('\t');
        fileDiff.oldFilename = parts[1];
        fileDiff.filename = parts[2] || filename;
      }

      return fileDiff;
    });

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  return {
    commitHash,
    totalAdditions,
    totalDeletions,
    filesChanged: files.length,
    files,
  };
}

export function getDiffBetweenTags(fromTag: string, toTag = 'HEAD', repoPath = '.'): CommitDiffSummary {
  const range = `${fromTag}..${toTag}`;
  const numstatOutput = execSync(
    `git -C ${repoPath} diff --numstat ${range}`,
    { encoding: 'utf-8' }
  ).trim();

  const files: FileDiff[] = (numstatOutput ? numstatOutput.split('\n') : [])
    .filter(line => line.trim() !== '')
    .map(line => {
      const [additions, deletions, filename] = line.split('\t');
      return {
        filename,
        additions: parseInt(additions, 10) || 0,
        deletions: parseInt(deletions, 10) || 0,
        status: 'modified' as const,
      };
    });

  return {
    commitHash: range,
    totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
    totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
    filesChanged: files.length,
    files,
  };
}
