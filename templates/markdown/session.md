# Session: {{session.project}}

**Date:** {{formatDate session.created_at}}
**Duration:** {{session.duration}}
**Observations:** {{session.observation_count}}

---

## Summary

{{#if session.summary}}
### What was requested
{{session.summary.request}}

### What was investigated
{{session.summary.investigated}}

### What was learned
{{session.summary.learned}}

### What was completed
{{session.summary.completed}}

### Next steps
{{session.summary.next_steps}}

{{#if session.summary.notes}}
### Notes
{{session.summary.notes}}
{{/if}}
{{else}}
*No summary available for this session.*
{{/if}}

---

## Observations

{{#each observations}}
### {{this.type}}: {{this.title}}

{{#if this.subtitle}}
*{{this.subtitle}}*
{{/if}}

{{this.narrative}}

{{#if this.facts}}
**Key Facts:**
{{#each this.facts}}
- {{this}}
{{/each}}
{{/if}}

{{#if this.concepts}}
**Concepts:** {{join this.concepts ", "}}
{{/if}}

{{#if this.files_modified}}
**Files Modified:**
{{#each this.files_modified}}
- `{{this}}`
{{/each}}
{{/if}}

---

{{/each}}

## Statistics

| Metric | Value |
|--------|-------|
| Total Observations | {{session.observation_count}} |
| Files Modified | {{session.files_modified_count}} |
| Files Read | {{session.files_read_count}} |
| Tokens Used | {{session.tokens_used}} |

---

*Exported from claude-recall on {{formatDate now}}*
