import type { CommitDiffSummary, FileDiff } from './diffParser';

export interface DiffFormatterOptions {
  showFiles?: boolean;
  maxFiles?: number;
  showStats?: boolean;
}

const DEFAULT_OPTIONS: DiffFormatterOptions = {
  showFiles: false,
  maxFiles: 10,
  showStats: true,
};

export function formatFileStatus(file: FileDiff): string {
  const icons: Record<FileDiff['status'], string> = {
    added: '➕',
    deleted: '➖',
    modified: '✏️',
    renamed: '🔄',
  };
  const icon = icons[file.status] ?? '•';
  const name = file.status === 'renamed' && file.oldFilename
    ? `${file.oldFilename} → ${file.filename}`
    : file.filename;
  return `${icon} ${name} (+${file.additions}/-${file.deletions})`;
}

export function formatDiffStats(summary: CommitDiffSummary): string {
  const parts: string[] = [];
  parts.push(`${summary.filesChanged} file${summary.filesChanged !== 1 ? 's' : ''} changed`);
  if (summary.totalAdditions > 0) {
    parts.push(`**+${summary.totalAdditions}** additions`);
  }
  if (summary.totalDeletions > 0) {
    parts.push(`**-${summary.totalDeletions}** deletions`);
  }
  return parts.join(', ');
}

export function formatDiffSummary(
  summary: CommitDiffSummary,
  options: DiffFormatterOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];

  if (opts.showStats) {
    lines.push(`> ${formatDiffStats(summary)}`);
  }

  if (opts.showFiles && summary.files.length > 0) {
    const filesToShow = summary.files.slice(0, opts.maxFiles);
    lines.push('');
    filesToShow.forEach(file => {
      lines.push(`> - ${formatFileStatus(file)}`);
    });
    if (summary.files.length > (opts.maxFiles ?? 10)) {
      const remaining = summary.files.length - (opts.maxFiles ?? 10);
      lines.push(`> - _...and ${remaining} more file${remaining !== 1 ? 's' : ''}_`);
    }
  }

  return lines.join('\n');
}

export function appendDiffToReleaseNotes(
  releaseNotes: string,
  summary: CommitDiffSummary,
  options: DiffFormatterOptions = {}
): string {
  const diffBlock = formatDiffSummary(summary, options);
  if (!diffBlock) return releaseNotes;
  return `${releaseNotes}\n\n## Stats\n\n${diffBlock}`;
}
