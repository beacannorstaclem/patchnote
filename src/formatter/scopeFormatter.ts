import type { ParsedCommit, ReleaseSection } from './types';

/**
 * Groups commits within a section by their scope.
 * Useful for large releases with many scoped changes.
 */
export function groupByScope(
  section: ReleaseSection
): Record<string, ParsedCommit[]> {
  const groups: Record<string, ParsedCommit[]> = {};

  for (const commit of section.commits) {
    const key = commit.scope ?? 'general';
    if (!groups[key]) groups[key] = [];
    groups[key].push(commit);
  }

  return groups;
}

/**
 * Renders a section with commits grouped by scope into markdown.
 */
export function formatSectionWithScopes(
  section: ReleaseSection,
  repoUrl?: string
): string {
  const lines: string[] = [];
  const grouped = groupByScope(section);

  lines.push(`### ${section.title}`);
  lines.push('');

  for (const [scope, commits] of Object.entries(grouped)) {
    if (scope !== 'general') {
      lines.push(`#### ${scope}`);
      lines.push('');
    }
    for (const commit of commits) {
      const hashShort = commit.hash.slice(0, 7);
      const hashRef = repoUrl
        ? `([${hashShort}](${repoUrl}/commit/${commit.hash}))`
        : `(${hashShort})`;
      lines.push(`- ${commit.subject} ${hashRef}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/**
 * Returns a sorted list of unique scopes found across all commits.
 */
export function extractScopes(commits: ParsedCommit[]): string[] {
  const scopes = new Set<string>();
  for (const commit of commits) {
    if (commit.scope) scopes.add(commit.scope);
  }
  return Array.from(scopes).sort();
}
