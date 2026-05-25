import { ParsedCommit } from '../git/commitParser';

export interface FilterOptions {
  types?: string[];
  scopes?: string[];
  excludeTypes?: string[];
  excludeScopes?: string[];
  since?: Date;
  until?: Date;
  breakingOnly?: boolean;
}

export function filterByType(
  commits: ParsedCommit[],
  types: string[]
): ParsedCommit[] {
  return commits.filter((c) => types.includes(c.type));
}

export function filterByScope(
  commits: ParsedCommit[],
  scopes: string[]
): ParsedCommit[] {
  return commits.filter((c) => c.scope && scopes.includes(c.scope));
}

export function filterByDate(
  commits: ParsedCommit[],
  since?: Date,
  until?: Date
): ParsedCommit[] {
  return commits.filter((c) => {
    const date = c.date ? new Date(c.date) : null;
    if (!date) return true;
    if (since && date < since) return false;
    if (until && date > until) return false;
    return true;
  });
}

export function filterBreakingOnly(
  commits: ParsedCommit[]
): ParsedCommit[] {
  return commits.filter((c) => c.breaking === true);
}

export function applyFilters(
  commits: ParsedCommit[],
  options: FilterOptions
): ParsedCommit[] {
  let result = [...commits];

  if (options.types && options.types.length > 0) {
    result = filterByType(result, options.types);
  }

  if (options.excludeTypes && options.excludeTypes.length > 0) {
    result = result.filter((c) => !options.excludeTypes!.includes(c.type));
  }

  if (options.scopes && options.scopes.length > 0) {
    result = filterByScope(result, options.scopes);
  }

  if (options.excludeScopes && options.excludeScopes.length > 0) {
    result = result.filter(
      (c) => !c.scope || !options.excludeScopes!.includes(c.scope)
    );
  }

  if (options.since || options.until) {
    result = filterByDate(result, options.since, options.until);
  }

  if (options.breakingOnly) {
    result = filterBreakingOnly(result);
  }

  return result;
}
