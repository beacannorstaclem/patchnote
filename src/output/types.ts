export interface OutputOptions {
  /** Write output to stdout instead of a file */
  stdout?: boolean;
  /** Path to the output file */
  filePath?: string;
  /** Prepend to existing file instead of overwriting */
  append?: boolean;
}

export type OutputFormat = 'markdown' | 'json' | 'plain';

export interface OutputResult {
  success: boolean;
  destination: 'stdout' | 'file';
  filePath?: string;
  bytesWritten?: number;
  error?: string;
}

export interface OutputConfig {
  format: OutputFormat;
  options: OutputOptions;
}
