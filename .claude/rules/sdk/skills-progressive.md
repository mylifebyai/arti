---
paths: src/main/lib/**/*.ts, scripts/**/*.ts
---

# Skills and Progressive Disclosure

Skills are reusable domain knowledge packages stored in `.claude/skills/`. Each skill contains:
- `SKILL.md` - Main documentation with YAML frontmatter
- `reference.md` - Detailed technical specifications (optional)
- `examples.md` - Concrete usage examples (optional)
- `scripts/` - Python or bash scripts the skill uses

## Loading Skills in Pipelines

**Use Progressive Skill Disclosure** - Load only YAML metadata (~50 tokens) and let agents read full docs on demand:

```typescript
import { loadSkillYaml, type SkillMetadata } from './utils/load-skill';

// Load YAML frontmatter only (PREFERRED - ~50 tokens)
const skillMeta = await loadSkillYaml('news-tools');

// Build system prompt with skill reference
function buildSkillPrompt(skillMeta: SkillMetadata): string {
  const skillDir = `.claude/skills/${skillMeta.name}`;
  return `--- AVAILABLE SKILL: ${skillMeta.name} ---
Description: ${skillMeta.description}
Documentation: ${skillDir}/SKILL.md
Reference: ${skillDir}/reference.md (if you need deeper detail)

You MUST Read ${skillDir}/SKILL.md to understand how to use this skill.
--- END SKILL ---`;
}
```

## Tool Configuration

For progressive disclosure to work, agents need the **Read tool**:

| Stage Type | Tools | Notes |
|------------|-------|-------|
| Research | `['WebSearch', 'Read']` | Fetches external data + reads skills |
| Analysis | `['Read']` | Reads skills + input files |
| Writer | `['Read']` | Reads skills for formatting rules |

## YAML Frontmatter Format

Every skill must have YAML frontmatter:

```markdown
---
name: news-tools
description: Utilities for fetching and structuring AI news items.
allowed-tools: WebSearch, Read
---

# News Tools Skill
[Full documentation here]
```

## Token Savings

Progressive disclosure saves ~95% of skill-related tokens:
- Full injection: ~3500 tokens (3-stage pipeline)
- Progressive disclosure: ~150 tokens

