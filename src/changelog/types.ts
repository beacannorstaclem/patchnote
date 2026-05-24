export interface ChangelogOptions {
  /** Git ref or tag to start from (exclusive). Defaults to latest tag. */
  from?: string;
  /** Git ref or tag to end at (inclusive). Defaults to HEAD. */
  to?: string;
  /** Release version label used in the heading. */
  version?: string;
  /** Release date string (YYYY-MM-DD). Defaults to today. */
  date?: string;
  /** Path to a patchnote config file. */
  configPath?: string;
  /** File path to write changelog output to. */
  outputFile?: string;
  /** If true, append to outputFile instead of overwriting. */
  append?: boolean;
  /** If true, also write output to stdout. */
  stdout?: boolean;
}

export interface ChangelogResult {
  content: string;
  commitCount: number;
  version: string;
  date: string;
}
