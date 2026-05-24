import { parseCliArgs, mergeCliOptions, CliOptions } from './options';
import { loadConfig, mergeConfig } from '../config/loader';
import { validateConfig } from '../config/validate';
import { getCommitsSince } from '../git/commitParser';
import { getLatestTag, isGitRepository } from '../git/index';
import { formatMarkdown } from '../formatter/markdownFormatter';
import { handleOutput } from '../output/writer';

export async function run(argv: string[]): Promise<void> {
  const opts: CliOptions = parseCliArgs(argv.slice(2));

  if (!(await isGitRepository())) {
    console.error('Error: Not a git repository.');
    process.exit(1);
  }

  const rawConfig = await loadConfig(opts.config);
  const config = mergeConfig(rawConfig);
  const finalConfig = mergeCliOptions(config, opts);

  const validation = validateConfig(finalConfig);
  if (!validation.valid) {
    console.error('Invalid configuration:', validation.errors.join(', '));
    process.exit(1);
  }

  const fromRef = opts.from ?? (await getLatestTag()) ?? undefined;
  const toRef = opts.to ?? 'HEAD';

  if (opts.verbose) {
    console.log(`Generating changelog from ${fromRef ?? 'beginning'} to ${toRef}`);
  }

  const commits = await getCommitsSince(fromRef, toRef);

  if (commits.length === 0) {
    console.warn('No commits found in the specified range.');
    return;
  }

  if (opts.verbose) {
    console.log(`Found ${commits.length} commits.`);
  }

  const releaseNotes = formatMarkdown(commits, finalConfig);

  await handleOutput(releaseNotes, finalConfig.output);
}
