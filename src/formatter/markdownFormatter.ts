import type { ParsedCommit, ReleaseNotes, FormatterOptions, ReleaseSection } from './types';
import { DEFAULT_TYPE_TITLES, DEFAULT_INCLUDE_TYPES } from './types';

function formatCommitLine(commit: ParsedCommit, repoUrl?: string): string {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  const subject = commit.subject;
  const hashShort = commit.hash.slice(0, 7);
  const hashLink = repoUrl
    ? `([${hashShort}](${repoUrl}/commit/${commit.hash}))`
    : `(${hashShort})`;
  return `- ${scope}${subject} ${hashLink}`;
}

function buildSections(
  commits: ParsedCommit[],
  includeTypes: string[]
): ReleaseSection[] {
  const grouped: Record<string, ParsedCommit[]> = {};

  for (const commit of commits) {
    if (!includeTypes.includes(commit.type)) continue;
    if (!grouped[commit.type]) grouped[commit.type] = [];
    grouped[commit.type].push(commit);
  }

  return Object.entries(grouped).map(([type, typeCommits]) => ({
    title: DEFAULT_TYPE_TITLES[type] ?? type,
    commits: typeCommits,
  }));
}

export function buildReleaseNotes(
  commits: ParsedCommit[],
  options: FormatterOptions
): ReleaseNotes {
  const includeTypes = options.includeTypes ?? DEFAULT_INCLUDE_TYPES;
  const sections = buildSections(commits, includeTypes);
  const breakingChanges = commits.filter((c) => c.breaking);
  const date = new Date().toISOString().split('T')[0];

  return {
    version: options.version,
    date,
    sections,
    breakingChanges,
  };
}

export function formatMarkdown(
  notes: ReleaseNotes,
  repoUrl?: string
): string {
  const lines: string[] = [];

  lines.push(`## [${notes.version}] - ${notes.date}`);
  lines.push('');

  if (notes.breakingChanges.length > 0) {
    lines.push('### ⚠️ Breaking Changes');
    lines.push('');
    for (const commit of notes.breakingChanges) {
      lines.push(formatCommitLine(commit, repoUrl));
    }
    lines.push('');
  }

  for (const section of notes.sections) {
    if (section.commits.length === 0) continue;
    lines.push(`### ${section.title}`);
    lines.push('');
    for (const commit of section.commits) {
      lines.push(formatCommitLine(commit, repoUrl));
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
