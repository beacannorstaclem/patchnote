import { renderTemplate } from './engine';
import { TemplateContext, TemplateOptions } from './types';

const mockContext: TemplateContext = {
  version: '1.2.0',
  date: '2024-06-01',
  repoUrl: 'https://github.com/user/repo',
  totalCommits: 3,
  breakingChanges: [],
  sections: [
    {
      title: 'Features',
      emoji: '✨',
      count: 2,
      commits: [
        { hash: 'abc1234def', shortHash: 'abc1234', message: 'add dark mode', scope: 'ui', author: 'alice' },
        { hash: 'bcd2345efg', shortHash: 'bcd2345', message: 'add export button', scope: 'ui', author: 'bob' },
      ],
    },
    {
      title: 'Bug Fixes',
      emoji: '🐛',
      count: 1,
      commits: [
        { hash: 'cde3456fgh', shortHash: 'cde3456', message: 'fix crash on startup', scope: 'core', author: 'alice' },
      ],
    },
  ],
};

const simpleOptions: TemplateOptions = { engine: 'simple', builtinTemplate: 'default' };

describe('renderTemplate', () => {
  it('renders version and date into default template', () => {
    const result = renderTemplate(mockContext, simpleOptions);
    expect(result.content).toContain('v1.2.0');
    expect(result.content).toContain('2024-06-01');
  });

  it('renders section titles', () => {
    const result = renderTemplate(mockContext, simpleOptions);
    expect(result.content).toContain('Features');
    expect(result.content).toContain('Bug Fixes');
  });

  it('renders commit messages', () => {
    const result = renderTemplate(mockContext, simpleOptions);
    expect(result.content).toContain('add dark mode');
    expect(result.content).toContain('fix crash on startup');
  });

  it('renders compact template', () => {
    const result = renderTemplate(mockContext, { engine: 'simple', builtinTemplate: 'compact' });
    expect(result.content).toContain('v1.2.0');
    expect(result.content).toContain('Features');
    expect(result.templateUsed).toBe('builtin:compact');
  });

  it('renders detailed template with author and scope', () => {
    const result = renderTemplate(mockContext, { engine: 'simple', builtinTemplate: 'detailed' });
    expect(result.content).toContain('alice');
    expect(result.content).toContain('ui');
  });

  it('throws for unsupported engine', () => {
    expect(() =>
      renderTemplate(mockContext, { engine: 'handlebars' as any })
    ).toThrow("Template engine 'handlebars' is not yet supported");
  });

  it('throws if custom template file not found', () => {
    expect(() =>
      renderTemplate(mockContext, { engine: 'simple', templatePath: '/nonexistent/template.txt' })
    ).toThrow('Template file not found');
  });

  it('returns correct engine in result', () => {
    const result = renderTemplate(mockContext, simpleOptions);
    expect(result.engine).toBe('simple');
  });
});
