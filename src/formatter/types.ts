export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'chore'
  | 'ci'
  | 'build'
  | 'revert';

export interface ParsedCommit {
  hash: string;
  type: CommitType | string;
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  raw: string;
}

export interface ReleaseSection {
  title: string;
  commits: ParsedCommit[];
}

export interface ReleaseNotes {
  version: string;
  date: string;
  sections: ReleaseSection[];
  breakingChanges: ParsedCommit[];
}

export interface FormatterOptions {
  version: string;
  repoUrl?: string;
  dateFormat?: string;
  includeTypes?: CommitType[];
}

export const DEFAULT_TYPE_TITLES: Record<string, string> = {
  feat: '🚀 Features',
  fix: '🐛 Bug Fixes',
  perf: '⚡ Performance Improvements',
  refactor: '♻️ Code Refactoring',
  docs: '📚 Documentation',
  chore: '🔧 Chores',
  ci: '👷 CI/CD',
  build: '📦 Build System',
  revert: '⏪ Reverts',
};

export const DEFAULT_INCLUDE_TYPES: CommitType[] = [
  'feat',
  'fix',
  'perf',
  'refactor',
  'docs',
  'revert',
];
