import { ParsedCommit } from './types';

/**
 * Extracts unique scopes from a list of commits.
 */
export function extractScopes(commits: ParsedCommit[]): string[] {
  const scopes = commits
    .map((c) => c.scope)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
  return [...new Set(scopes)];
}

/**
 * Groups commits by their scope. Commits without a scope are grouped under ''.
 */
export function groupByScope(commits: ParsedCommit[]): Record<string, ParsedCommit[]> {
  return commits.reduce<Record<string, ParsedCommit[]>>((acc, commit) => {
    const key = commit.scope ?? '';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(commit);
    return acc;
  }, {});
}

/**
 * Formats a changelog section grouping commits by scope.
 * Scoped commits appear under bold scope headers; unscoped commits are listed directly.
 */
export function formatSectionWithScopes(
  sectionTitle: string,
  commits: ParsedCommit[]
): string {
  if (commits.length === 0) return '';

  const grouped = groupByScope(commits);
  const lines: string[] = [`### ${sectionTitle}`, ''];

  const scopes = Object.keys(grouped).sort();

  // Render unscoped commits first
  const unscopedKey = '';
  if (grouped[unscopedKey]?.length) {
    for (const commit of grouped[unscopedKey]) {
      lines.push(`- ${commit.description} (${commit.hash.slice(0, 7)})`);
    }
    lines.push('');
  }

  // Render scoped commits grouped under their scope header
  for (const scope of scopes) {
    if (scope === unscopedKey) continue;
    lines.push(`- **${scope}**`);
    for (const commit of grouped[scope]) {
      lines.push(`  - ${commit.description} (${commit.hash.slice(0, 7)})`);
    }
  }

  lines.push('');
  return lines.join('\n');
}
