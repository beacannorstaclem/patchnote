# patchnote

> Self-hosted changelog generator that pulls from git commits and formats release notes.

---

## Installation

```bash
npm install -g patchnote
```

---

## Usage

Run `patchnote` from the root of any git repository to generate a changelog:

```bash
patchnote generate --from v1.0.0 --to v1.1.0
```

This will parse commits between the two tags and output formatted release notes to `CHANGELOG.md`.

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--from` | Starting git tag or commit | previous tag |
| `--to` | Ending git tag or commit | `HEAD` |
| `--output` | Output file path | `CHANGELOG.md` |
| `--format` | Output format (`md`, `json`) | `md` |

**Example output:**

```markdown
## v1.1.0 — 2024-06-01

### Features
- Add dark mode support (#42)
- Improve CLI flag parsing (#38)

### Bug Fixes
- Fix crash on empty commit history (#40)
```

You can also use `patchnote` as a library:

```typescript
import { generate } from 'patchnote';

const notes = await generate({ from: 'v1.0.0', to: 'HEAD' });
console.log(notes);
```

---

## License

[MIT](./LICENSE)