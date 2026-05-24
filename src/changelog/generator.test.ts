import { generateChangelog } from './generator';
import * as commitParser from '../git/commitParser';
import * as gitIndex from '../git/index';
import * as markdownFormatter from '../formatter/markdownFormatter';
import * as outputWriter from '../output/writer';
import * as configLoader from '../config/loader';

jest.mock('../git/commitParser');
jest.mock('../git/index');
jest.mock('../formatter/markdownFormatter');
jest.mock('../output/writer');
jest.mock('../config/loader');

const mockCommits = [
  { type: 'feat', scope: 'cli', subject: 'add version flag', breaking: false, raw: 'feat(cli): add version flag' },
  { type: 'fix', scope: null, subject: 'handle empty repo', breaking: false, raw: 'fix: handle empty repo' },
];

beforeEach(() => {
  jest.resetAllMocks();
  (configLoader.loadConfig as jest.Mock).mockResolvedValue({ repoUrl: 'https://github.com/org/repo', includeScopes: true });
  (gitIndex.getLatestTag as jest.Mock).mockResolvedValue('v1.0.0');
  (commitParser.getCommitsSince as jest.Mock).mockResolvedValue(mockCommits);
  (markdownFormatter.formatMarkdown as jest.Mock).mockReturnValue('## v1.1.0\n\n- feat: add version flag\n');
  (outputWriter.handleOutput as jest.Mock).mockResolvedValue(undefined);
});

describe('generateChangelog', () => {
  it('returns formatted markdown from commits', async () => {
    const result = await generateChangelog({ version: 'v1.1.0' });
    expect(result).toContain('v1.1.0');
    expect(markdownFormatter.formatMarkdown).toHaveBeenCalledWith(
      mockCommits,
      expect.objectContaining({ version: 'v1.1.0' })
    );
  });

  it('uses latest tag as from ref when not specified', async () => {
    await generateChangelog({ version: 'v1.1.0' });
    expect(commitParser.getCommitsSince).toHaveBeenCalledWith('v1.0.0', 'HEAD');
  });

  it('throws when no tags exist and no from option provided', async () => {
    (gitIndex.getLatestTag as jest.Mock).mockResolvedValue(null);
    await expect(generateChangelog({ version: 'v1.1.0' })).rejects.toThrow(
      'No git tags found'
    );
  });

  it('returns empty string when no commits found', async () => {
    (commitParser.getCommitsSince as jest.Mock).mockResolvedValue([]);
    const result = await generateChangelog({ version: 'v1.1.0' });
    expect(result).toBe('');
    expect(outputWriter.handleOutput).not.toHaveBeenCalled();
  });

  it('passes outputFile and append options to handleOutput', async () => {
    await generateChangelog({ version: 'v1.1.0', outputFile: 'CHANGELOG.md', append: true });
    expect(outputWriter.handleOutput).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ outputFile: 'CHANGELOG.md', append: true })
    );
  });
});
