export const BUILTIN_TEMPLATES: Record<'default' | 'compact' | 'detailed', string> = {
  default: `# Changelog — v{{version}}

> Released on {{date}} · {{totalCommits}} commit(s)

{{#sections}}
## {{emoji}} {{title}}

{{#commits}}
- {{message}} ([\`{{shortHash}}\`])
{{/commits}}

{{/sections}}
`,

  compact: `## v{{version}} ({{date}})

{{#sections}}
**{{title}}** ({{count}})
{{#commits}}
- {{message}}
{{/commits}}
{{/sections}}
`,

  detailed: `# Release v{{version}}

**Date:** {{date}}  
**Total Commits:** {{totalCommits}}  
{{repoUrl}}

---

{{#sections}}
### {{emoji}} {{title}}

| Commit | Scope | Message | Author |
|--------|-------|---------|--------|
{{#commits}}
| \`{{shortHash}}\` | {{scope}} | {{message}} | {{author}} |
{{/commits}}

{{/sections}}
`,
};
