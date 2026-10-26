# Shared knowledge (loaded into the Knowledge Base for everyone)

Put plain files here, then run `npm run seed:knowledge` from `nimbus-backend`.
Re-running is safe: unchanged files are skipped and edited files replace their old version.

```
knowledge/
  brand/        brand kit: club description, colours, tone, tagline, logo usage      -> type brand_kit
  events/       one file per past event: date, venue, numbers, outcomes              -> type past_event
  policies/     report / notice guidelines, naming rules                             -> type policy
  contacts/     office bearers (roles + shared emails only)                          -> type contact
  templates/    reusable wording (event blurbs, email openers)                       -> type template_copy
  notes/        anything else                                                        -> type note
```

The folder name sets the type. Files whose name starts with `_` (like the examples) and this README are ignored.

## File formats
`.md`, `.txt`, `.csv`, `.pdf` (must contain real text, not a scan), `.docx`.

## Optional header (Markdown / text only)
```
---
title: Recruitathon 2.0
type: past_event
tags: recruitment, 2025
---
```
Without a header, the title is the first `# Heading` (or the file name) and the type comes from the folder.

## Writing good knowledge
- One topic per file, about one page. Short, focused files are found more accurately than one huge file.
- State facts plainly with dates and numbers: "Recruitathon 2.0 was held on 14 Sept 2025 at the Computer Centre. 212 students registered, 64 were selected."
- Put the name of the thing in the text (not only in the file name), so searches for it match.
- For the brand kit, write colours as words *and* hex codes: "navy blue #0b1f4b, mint green #3ddc97".

## Never put here
Passwords, API keys, private phone numbers or personal emails. This folder is committed to git.

## Where it ends up
Supabase tables `knowledge_sources` (one row per file) and `knowledge_chunks` (searchable pieces with their embeddings).
The files themselves stay in this folder; the database holds the text and its search index.
