import { PatchnoteConfig } from '../config/types';

export interface CliOptions {
  from?: string;
  to?: string;
  output?: string;
  format?: 'markdown' | 'json';
  config?: string;
  stdout?: boolean;
  version?: string;
  tag?: boolean;
  verbose?: boolean;
}

export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--from':
      case '-f':
        options.from = next;
        i++;
        break;
      case '--to':
      case '-t':
        options.to = next;
        i++;
        break;
      case '--output':
      case '-o':
        options.output = next;
        i++;
        break;
      case '--format':
        options.format = next as 'markdown' | 'json';
        i++;
        break;
      case '--config':
      case '-c':
        options.config = next;
        i++;
        break;
      case '--stdout':
        options.stdout = true;
        break;
      case '--version':
      case '-v':
        options.version = next;
        i++;
        break;
      case '--tag':
        options.tag = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  return options;
}

export function mergeCliOptions(
  config: PatchnoteConfig,
  opts: CliOptions
): PatchnoteConfig {
  return {
    ...config,
    ...(opts.output && { output: { ...config.output, file: opts.output } }),
    ...(opts.stdout && { output: { ...config.output, stdout: true } }),
    ...(opts.format && { format: opts.format }),
    ...(opts.version && { version: opts.version }),
  };
}
