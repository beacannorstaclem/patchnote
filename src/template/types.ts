export type TemplateEngine = 'mustache' | 'handlebars' | 'simple';

export interface TemplateVariable {
  key: string;
  value: string | number | boolean | string[];
}

export interface TemplateContext {
  version: string;
  date: string;
  repoUrl?: string;
  sections: TemplateSectionContext[];
  totalCommits: number;
  breakingChanges: string[];
}

export interface TemplateSectionContext {
  title: string;
  emoji?: string;
  commits: TemplateCommitContext[];
  count: number;
}

export interface TemplateCommitContext {
  hash: string;
  shortHash: string;
  message: string;
  scope?: string;
  author?: string;
  url?: string;
}

export interface TemplateOptions {
  engine: TemplateEngine;
  templatePath?: string;
  builtinTemplate?: 'default' | 'compact' | 'detailed';
  dateFormat?: string;
}

export interface TemplateResult {
  content: string;
  engine: TemplateEngine;
  templateUsed: string;
}
