# {{observation.type}}: {{observation.title}}

**Project:** {{observation.project}}
**Date:** {{formatDate observation.created_at}}
**Session:** {{observation.session_id}}

---

{{#if observation.subtitle}}
## Context
{{observation.subtitle}}
{{/if}}

## Details

{{observation.narrative}}

{{#if observation.facts}}
## Key Facts

{{#each observation.facts}}
- {{this}}
{{/each}}
{{/if}}

{{#if observation.concepts}}
## Concepts

{{#each observation.concepts}}
`{{this}}` {{/each}}
{{/if}}

{{#if observation.files_read}}
## Files Read

{{#each observation.files_read}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if observation.files_modified}}
## Files Modified

{{#each observation.files_modified}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if observation.tags}}
## Tags

{{#each observation.tags}}
#{{this}} {{/each}}
{{/if}}

---

{{#if observation.is_favorite}}
⭐ **Favorited**
{{/if}}

*Observation ID: {{observation.id}} | Prompt #{{observation.prompt_number}}*
