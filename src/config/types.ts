export interface PatchnoteConfig {
  /**
   * Output format for release notes
   */
  format: 'markdown' | 'json' | 'plain';

  /**
   * Git tag to start from (defaults to latest tag)
   */
  fromTag?: string;

  /**
   * Git tag to end at (defaults to HEAD)
   */
  toTag?: string;

  /**
   * Output file path (defaults to stdout)
   */
  output?: string;

  /**
   * Title for the release notes
   */
  title?: string;

  /**
   * Commit types to include in output
   */
  includeTypes?: string[];

  /**
   * Whether to group commits by scope
   */
  groupByScope?: boolean;

  /**
   * Whether to include breaking changes section
   */
  includeBreakingChanges?: boolean;

  /**
   * Repository URL for linking commits (e.g. https://github.com/user/repo)
   */
  repoUrl?: string;
}

export const DEFAULT_CONFIG: PatchnoteConfig = {
  format: 'markdown',
  includeTypes: ['feat', 'fix', 'perf', 'refactor', 'docs', 'chore'],
  groupByScope: false,
  includeBreakingChanges: true,
};
