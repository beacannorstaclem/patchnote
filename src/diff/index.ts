export type { FileDiff, CommitDiffSummary } from './diffParser';
export { parseStatusLetter, getDiffSummary, getDiffBetweenTags } from './diffParser';
export type { DiffFormatterOptions } from './diffFormatter';
export {
  formatFileStatus,
  formatDiffStats,
  formatDiffSummary,
  appendDiffToReleaseNotes,
} from './diffFormatter';
