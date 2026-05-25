import { ParsedCommit } from '../git/commitParser';

export type VersionBump = 'major' | 'minor' | 'patch' | 'none';

export interface VersionInfo {
  current: string;
  next: string;
  bump: VersionBump;
}

export function determineBump(commits: ParsedCommit[]): VersionBump {
  if (commits.length === 0) return 'none';

  const hasBreaking = commits.some(
    (c) => c.breaking || c.footer?.includes('BREAKING CHANGE')
  );
  if (hasBreaking) return 'major';

  const hasFeature = commits.some((c) => c.type === 'feat');
  if (hasFeature) return 'minor';

  const hasFix = commits.some((c) =>
    ['fix', 'perf', 'refactor'].includes(c.type)
  );
  if (hasFix) return 'patch';

  return 'none';
}

export function parseVersion(version: string): [number, number, number] {
  const cleaned = version.replace(/^v/, '');
  const parts = cleaned.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver version: "${version}"`);
  }
  return [parts[0], parts[1], parts[2]];
}

export function bumpVersion(current: string, bump: VersionBump): string {
  if (bump === 'none') return current;

  const prefix = current.startsWith('v') ? 'v' : '';
  const [major, minor, patch] = parseVersion(current);

  switch (bump) {
    case 'major':
      return `${prefix}${major + 1}.0.0`;
    case 'minor':
      return `${prefix}${major}.${minor + 1}.0`;
    case 'patch':
      return `${prefix}${major}.${minor}.${patch + 1}`;
  }
}

export function getVersionInfo(
  current: string,
  commits: ParsedCommit[]
): VersionInfo {
  const bump = determineBump(commits);
  const next = bumpVersion(current, bump);
  return { current, next, bump };
}
