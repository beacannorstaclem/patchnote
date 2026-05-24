import * as fs from 'fs';
import * as path from 'path';
import { TemplateContext, TemplateOptions, TemplateResult } from './types';
import { BUILTIN_TEMPLATES } from './builtins';

function renderSimpleTemplate(template: string, context: TemplateContext): string {
  let result = template;

  result = result.replace(/\{\{version\}\}/g, context.version);
  result = result.replace(/\{\{date\}\}/g, context.date);
  result = result.replace(/\{\{totalCommits\}\}/g, String(context.totalCommits));
  result = result.replace(/\{\{repoUrl\}\}/g, context.repoUrl ?? '');

  const sectionBlock = result.match(/\{\{#sections\}\}([\s\S]*?)\{\{\/sections\}\}/);
  if (sectionBlock) {
    const sectionTemplate = sectionBlock[1];
    const renderedSections = context.sections
      .filter((s) => s.commits.length > 0)
      .map((section) => {
        let sectionStr = sectionTemplate;
        sectionStr = sectionStr.replace(/\{\{title\}\}/g, section.title);
        sectionStr = sectionStr.replace(/\{\{emoji\}\}/g, section.emoji ?? '');
        sectionStr = sectionStr.replace(/\{\{count\}\}/g, String(section.count));

        const commitBlock = sectionStr.match(/\{\{#commits\}\}([\s\S]*?)\{\{\/commits\}\}/);
        if (commitBlock) {
          const commitTemplate = commitBlock[1];
          const renderedCommits = section.commits.map((commit) => {
            let commitStr = commitTemplate;
            commitStr = commitStr.replace(/\{\{message\}\}/g, commit.message);
            commitStr = commitStr.replace(/\{\{shortHash\}\}/g, commit.shortHash);
            commitStr = commitStr.replace(/\{\{hash\}\}/g, commit.hash);
            commitStr = commitStr.replace(/\{\{scope\}\}/g, commit.scope ?? '');
            commitStr = commitStr.replace(/\{\{author\}\}/g, commit.author ?? '');
            return commitStr;
          });
          sectionStr = sectionStr.replace(commitBlock[0], renderedCommits.join(''));
        }
        return sectionStr;
      });
    result = result.replace(sectionBlock[0], renderedSections.join(''));
  }

  return result;
}

export function renderTemplate(context: TemplateContext, options: TemplateOptions): TemplateResult {
  let templateContent: string;
  let templateUsed: string;

  if (options.templatePath) {
    const resolved = path.resolve(options.templatePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Template file not found: ${resolved}`);
    }
    templateContent = fs.readFileSync(resolved, 'utf-8');
    templateUsed = resolved;
  } else {
    const builtin = options.builtinTemplate ?? 'default';
    templateContent = BUILTIN_TEMPLATES[builtin];
    templateUsed = `builtin:${builtin}`;
  }

  if (options.engine !== 'simple') {
    throw new Error(`Template engine '${options.engine}' is not yet supported. Use 'simple'.`);
  }

  const content = renderSimpleTemplate(templateContent, context);
  return { content, engine: options.engine, templateUsed };
}
