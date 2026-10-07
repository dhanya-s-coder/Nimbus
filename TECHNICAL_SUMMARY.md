# Technical Summary: Nimbus Project

## Architecture Overview
Nimbus is a MERN application (MongoDB, Express, React, Node.js) with a Supabase (Postgres + pgvector) knowledge store for retrieval-augmented generation.

### Key Design Decisions
- **Canvas posters (react-konva)**: Posters are rendered on a Konva stage authored in a 600-wide design space and exported from the very same stage (PNG / JPG / PDF), replacing the earlier DOM + html2canvas pipeline. Layouts are small functions (`poster-konva/layouts`), skins are Konva primitives (`layers/`), and every movable element is an `Editable` so users can drag, resize, hide and add text. Customisations (`custom.overrides`, `custom.extras`, size, font, palette) are saved with the poster.
- **Provider adapters**: `services/ai/text` and `services/ai/image` hide the vendor behind factories. The active provider comes from env (`ACTIVE_TEXT_PROVIDER`, `ACTIVE_IMAGE_PROVIDER`); a request may override it only if the provider is allow-listed; failures can fail over to `*_FALLBACK_PROVIDERS`.
- **Grounded generation (RAG)**: Knowledge is chunked, embedded with Gemini (768-d) and stored in Supabase. Retrieval is hybrid (vector + full-text, reciprocal-rank fusion) followed by a cosine-similarity gate so irrelevant notes are never used. The orchestrator fences retrieved text as data, validates structured output (zod), and logs each run in `generation_runs`.
- **Cloudinary for images**: AI backgrounds, uploaded photos and poster previews are hosted on Cloudinary, keeping MongoDB light.
- **Smart form-to-AI logic**: Users fill simple forms; prompts are assembled server-side. Poster autofill only fills empty fields and only takes facts from the user's input or the knowledge base.

---

## Full Tech Stack
- **Frontend**: React 19 (CRA), react-konva / Konva, jsPDF, self-hosted fonts (@fontsource)
- **Backend**: Node.js (ESM), Express, Mongoose, JWT, helmet, express-rate-limit, zod
- **Databases**: MongoDB (users, auth, activity history); Supabase Postgres + pgvector (knowledge base, generation runs)
- **AI**: Google Gemini (text, embeddings, optional image), Anthropic Claude (optional text), Hugging Face SDXL / Pollinations / Imagen / Replicate (images)
- **Media Storage**: Cloudinary
- **Email**: Nodemailer (SMTP)

### Backend layout (`nimbus-backend/src`)
- `controllers/`, `routes/`: thin HTTP layer (`/api/auth|email|logo|poster|report|rag|generate`)
- `services/ai/`: text + image provider adapters, retries, failover
- `services/rag/`: chunker, embeddings, ingest, retrieval, orchestrator
- `services/*.service.js`: poster, logo, report, email, poster-content generation
- `supabase/migrations/001_rag.sql`: RAG schema (run once in the Supabase SQL editor)

### Frontend layout (`nimbus-frontend/src/components/tools`)
- `PosterGenerator.jsx`: form, generation, save, export
- `poster-konva/`: `PosterStage`, `PosterCustomizer`, `engine/` (fonts, text fitting, colour, export, editing), `layers/` (backgrounds, decorations, frames, UI primitives), `layouts/` (7 layouts), `data/` (palettes, design recipes, form normaliser)
- `KnowledgeBase.jsx`: manage knowledge used for autofill and grounding

---

## Testing
- Backend: `cd nimbus-backend && npm test` (node:test: providers, failover, JSON parsing, chunker)
- Frontend: `cd nimbus-frontend && CI=true npm test` (colour/palette engine, size presets, design recipes, form normaliser)
- Visual QA page (dev only): `/dev/poster?t=event&i=0&p=royalPurple&size=story`

---

## List of all AI Tools used
- ChatGPT
- Google Gemini
- GitHub Copilot

---

## Mentor & Manager Interactions
- **Email foundation for OTP**: Implementing the standard email sending service was a major milestone achieved with mentor assistance.
- **Image generation API selection**: The choice of Stable Diffusion XL (via Hugging Face) was directed by mentor feedback.
