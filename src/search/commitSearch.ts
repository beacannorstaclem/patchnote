import { ParsedCommit } from '../git/commitParser';

export interface SearchOptions {
  query: string;
  fields?: Array<'subject' | 'body' | 'scope' | 'type'>;
  caseSensitive?: boolean;
  regex?: boolean;
}

export interface SearchResult {
  commit: ParsedCommit;
  matchedFields: string[];
  score: number;
}

export function buildSearchRegex(query: string, caseSensitive: boolean, isRegex: boolean): RegExp {
  const flags = caseSensitive ? 'g' : 'gi';
  const pattern = isRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(pattern, flags);
}

export function scoreMatch(text: string, regex: RegExp): number {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

export function searchCommits(
  commits: ParsedCommit[],
  options: SearchOptions
): SearchResult[] {
  const {
    query,
    fields = ['subject', 'body', 'scope', 'type'],
    caseSensitive = false,
    regex = false,
  } = options;

  if (!query || query.trim() === '') {
    return commits.map((commit) => ({ commit, matchedFields: [], score: 0 }));
  }

  let searchRegex: RegExp;
  try {
    searchRegex = buildSearchRegex(query, caseSensitive, regex);
  } catch {
    return [];
  }

  const results: SearchResult[] = [];

  for (const commit of commits) {
    const matchedFields: string[] = [];
    let totalScore = 0;

    const fieldMap: Record<string, string> = {
      subject: commit.subject ?? '',
      body: commit.body ?? '',
      scope: commit.scope ?? '',
      type: commit.type ?? '',
    };

    for (const field of fields) {
      const value = fieldMap[field];
      if (!value) continue;
      const score = scoreMatch(value, searchRegex);
      if (score > 0) {
        matchedFields.push(field);
        totalScore += score;
      }
    }

    if (matchedFields.length > 0) {
      results.push({ commit, matchedFields, score: totalScore });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function extractSearchTerms(query: string): string[] {
  return query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
