import { getCommitsSince } from '../git/commitParser';
import { getLatestTag } from '../git/index';
import { formatMarkdown } from '../formatter/markdownFormatter';
import { loadConfig } from '../config/loader';
import { handleOutput } from '../output/writer';
import type { ParsedCommit } from '../formatter/types';
import type { ChangelogOptions } from './types';

export async function generateChangelog(options: ChangelogOptions): Promise<string> {
  const config = await loadConfig(options.configPath);

  const fromTag = options.from ?? (await getLatestTag());
  const toRef = options.to ?? 'HEAD';

  if (!fromTag && !options.from) {
    throw new Error(
      'No git tags found and no --from ref specified. Cannot determine commit range.'
    );
  }

  const rawCommits = await getCommitsSince(fromTag ?? '', toRef);

  if (rawCommits.length === 0) {
    return '';
  }

  const version = options.version ?? toRef;
  const date = options.date ?? new Date().toISOString().split('T')[0];

  const releaseNotes = formatMarkdown(rawCommits as ParsedCommit[], {
    version,
    date,
    repoUrl: config.repoUrl,
    includeScopes: config.includeScopes ?? true,
  });

  await handleOutput(releaseNotes, {
    outputFile: options.outputFile,
    append: options.append ?? false,
    stdout: options.stdout ?? false,
  });

  return releaseNotes;
}
