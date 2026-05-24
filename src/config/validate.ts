import { PatchnoteConfig } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_FORMATS = ['markdown', 'json', 'plain'] as const;
const VALID_COMMIT_TYPES = ['feat', 'fix', 'perf', 'refactor', 'docs', 'chore', 'test', 'ci', 'build', 'style', 'revert'];

/**
 * Validates a PatchnoteConfig object and returns any errors found.
 */
export function validateConfig(config: PatchnoteConfig): ValidationResult {
  const errors: string[] = [];

  if (!VALID_FORMATS.includes(config.format as typeof VALID_FORMATS[number])) {
    errors.push(`Invalid format "${config.format}". Must be one of: ${VALID_FORMATS.join(', ')}.`);
  }

  if (config.includeTypes !== undefined) {
    if (!Array.isArray(config.includeTypes) || config.includeTypes.length === 0) {
      errors.push('includeTypes must be a non-empty array.');
    } else {
      const unknown = config.includeTypes.filter((t) => !VALID_COMMIT_TYPES.includes(t));
      if (unknown.length > 0) {
        errors.push(`Unknown commit type(s): ${unknown.join(', ')}.`);
      }
    }
  }

  if (config.repoUrl !== undefined) {
    try {
      new URL(config.repoUrl);
    } catch {
      errors.push(`repoUrl "${config.repoUrl}" is not a valid URL.`);
    }
  }

  if (config.fromTag && config.toTag && config.fromTag === config.toTag) {
    errors.push('fromTag and toTag must not be the same value.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
