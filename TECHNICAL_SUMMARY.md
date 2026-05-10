# Technical Summary: Nimbus Project

## Architecture Overview

Nimbus is built on the **MERN** (MongoDB, Express, React, Node.js) stack, following a client-server architecture designed for asynchronous AI orchestration. The platform serves as an all-in-one **AI-powered society management tool**, enabling users to generate professional posters, logos, and written reports — all driven by AI and a self-learning RAG (Retrieval-Augmented Generation) pipeline.

### Key Design Decisions:
- **Cloudinary for Fast Images**: All AI-generated images (posters & logos) are uploaded to and hosted on Cloudinary. This keeps MongoDB lightweight and ensures instant, high-quality image delivery.
- **Smart Form-to-AI Logic**: Users fill simple forms. The backend automatically converts form data into detailed, professional AI prompts. Users never have to "talk to AI" directly.
- **RAG-Powered Aesthetic Memory**: Every generated image is analyzed by Gemini Vision, embedded into a 768-dimensional vector, and stored in MongoDB. Future generations use vector search to retrieve stylistically similar past designs and inject their aesthetic context into the new prompt — making the AI improve over time.
- **Self-Learning Loop**: Every image generated (poster or logo) is automatically ingested back into the knowledge base as a fire-and-forget background operation, without blocking the user's response.

---

## Full Tech Stack

- **Frontend**: React 19, CSS, JavaScript
- **Backend**: Node.js (ESM), Express.js, Mongoose, JWT
- **Database**: MongoDB (via Mongoose + Atlas Vector Search)
- **AI — Text & Vision**: Google GenAI SDK (`@google/genai`) → Gemini 2.5 Flash
- **AI — Image Generation**: Pollinations.ai API (model: `grok-imagine`, 1024×1024)
- **Media Storage**: Cloudinary (`nimbus/` folder)
- **Email Service**: Nodemailer (via SMTP)

### Core Libraries & Dependencies:

**Frontend**
| Package | Purpose |
|---|---|
| `react` / `react-dom` | Core UI library for the component-based interface |
| `react-router-dom` | Client-side routing between dashboard views |
| `axios` | Standardized HTTP requests to the backend API |
| `react-icons` | Icon set for sidebar, header, and interactive buttons |
| `@brenoroosevelt/toast` | Notification/toast system |
| `react-scripts` | Build pipeline and development server |

**Backend**
| Package | Purpose |
|---|---|
| `express` | RESTful API foundation and route orchestration |
| `mongoose` | MongoDB ODM — models, schema validation, aggregation |
| `jsonwebtoken (JWT)` | Stateless authentication via access + refresh token pairs |
| `bcryptjs` | Password hashing stored on the User model |
| `dotenv` | Manages environment credentials (`.env`) |
| `cors` | Secure cross-origin sharing (whitelists localhost:3000 & 3001) |
| `nodemailer` | SMTP email service for OTP delivery and notifications |
| `cloudinary` | Buffer-based image upload to Cloudinary CDN |
| `@google/genai` | Official Google GenAI SDK — Gemini Vision + text generation |

---

## Complete Data Models (MongoDB)

### `User`
Stores registered user credentials and active refresh tokens.
- `name`, `email` (unique), `password` (bcrypt hashed), `role`
- `refreshTokens: [String]` — supports up to **5 simultaneous sessions**
- Methods: `comparePassword()`, `addRefreshToken()`, `removeRefreshToken()`

### `OtpToken`
Temporary token used for email OTP verification during signup and password reset.
- `email`, `otp` (6-digit), `type` (`signup` | `forgotPassword`)
- `expiresAt` (3 minutes for signup, 5 minutes post-verify for reset)
- `attempts` (max 5 attempts before lockout), `isVerified`
- `userData` (stores pending user data for signup before account creation)
- Methods: `verifyOtp()`, `isExpired()`

### `DesignAsset`
The **RAG knowledge base** — stores every AI-generated or ingested image alongside its Gemini Vision description and vector embedding.
- `cloudinaryUrl` — the hosted image URL
- `type` — `"poster"` or `"logo"`
- `templateType` — subcategory (e.g. `academic`, `recruitment`, `event`, `hackathon`)
- `description` — Gemini Vision's 2-3 sentence aesthetic analysis
- `embedding: [Number]` — **768-dimensional** vector for similarity search
- `isSystemTemplate` — `true` for pre-loaded system designs, `false` for user-generated
- `userId` — linked to the generating user (or `null` for system assets)

---

## API Routes & Endpoints

### `/api/auth` — Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Validates fields, checks for duplicate email, sends OTP |
| POST | `/verify-otp` | Verifies OTP, creates User in DB, returns JWT pair |
| POST | `/resend-otp` | Resends signup OTP |
| POST | `/login` | Validates credentials, returns access + refresh token |
| POST | `/refresh-token` | Issues new JWT pair from a valid refresh token |
| POST | `/logout` | Removes refresh token from user's active sessions |
| POST | `/forgot-password` | Sends password-reset OTP to email |
| POST | `/verify-forgot-otp` | Verifies reset OTP, marks it as verified |
| POST | `/reset-password` | Resets password, sends confirmation email |
| GET | `/me` | Returns current logged-in user's profile (auth guarded) |

### `/api/poster` — Poster Generation
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate` | Full RAG pipeline: form → prompt → vector search → image gen → upload |
| POST | `/save` | Saves generated poster to user history |
| GET | `/history` | Returns all poster activities for the user |
| DELETE | `/history/:activityId` | Deletes a specific poster history entry |

### `/api/logo` — Logo Generation
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate` | Full RAG pipeline: form → prompt → vector search → image gen → upload |
| POST | `/save` | Saves generated logo to user history |
| GET | `/history` | Returns all logo activities for the user |
| DELETE | `/history/:activityId` | Deletes a specific logo history entry |

### `/api/report` — AI Report Writing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate` | Sends raw notes to Gemini 2.5 Flash, returns structured Markdown report |
| POST | `/save` | Saves the final report to user history |
| GET | `/history` | Returns all report activities for the user |
| DELETE | `/history/:activityId` | Deletes a specific report history entry |

### `/api/email` — Email Utility
- Handles OTP delivery and transactional emails via Nodemailer SMTP.

---

## Core AI Workflows

### 1. Poster & Logo Generation — Full RAG Pipeline (7 Steps)

This is the primary AI workflow, used identically for both posters and logos:

```
[User fills form]
        ↓
Step 1: Build Natural-Language Prompt
        (buildPromptFromForm / buildLogoPrompt)
        ↓
Step 2: Embed the Prompt → 768-dim vector
        (embedText — currently mocked for demo stability)
        ↓
Step 3: RAG Retrieve — MongoDB Atlas $vectorSearch
        → filter by type: "poster" or "logo"
        → numCandidates: 50, limit: 1
        → returns closest matching DesignAsset.description
        ↓
Step 4: Augment — Inject retrieved aesthetic context into Imagen prompt
        ("Strictly match this design aesthetic: [retrieved description]")
        ↓
Step 5: Generate Image via Pollinations.ai
        (model: zimage, 1024×1024, unique seed per request)
        ↓
Step 6: Upload image buffer to Cloudinary
        (stored in 'nimbus/' folder)
        ↓
Step 7: Self-Learning Ingest (fire-and-forget, non-blocking)
        → Gemini Vision describes the new image
        → embedText creates its vector
        → Saved as new DesignAsset in MongoDB
        (RAG knowledge base grows with every generation)
```

### 2. Report Generation — Direct LLM Call

Reports use a **direct API call** (no RAG), since they are text-based and contextless:

```
[User provides: reportType, title, rawInput/notes]
        ↓
Structured prompt is built server-side
        ↓
Gemini 2.5 Flash generates a formatted Markdown report
(Sections vary by type: Meeting Minutes / Event Summary / Monthly Progress)
        ↓
Report returned to frontend and user can save to history
```

### 3. Authentication — OTP Email Flow

```
[User submits signup form]
        ↓
Server validates fields, checks for duplicate email
        ↓
6-digit OTP generated → stored in OtpToken (expires 3 min)
User data (name, password, role) stored temporarily in OtpToken.userData
        ↓
OTP emailed via Nodemailer SMTP
        ↓
[User enters OTP]
        ↓
verifyOtp() checks OTP + expiry + attempts (max 5)
        ↓
User account created in MongoDB
Access Token (15 min) + Refresh Token (7 days) issued
        ↓
[Session managed via refresh token rotation]
Max 5 active sessions per user, expired tokens auto-cleaned
```

### 4. Cloudinary Bulk Ingestion Script (`ingestCloudinaryFolder.js`)

A standalone Node.js script used to **pre-populate the RAG knowledge base** with existing designs:

```
[Run script manually]
        ↓
Connect to MongoDB
        ↓
Fetch all images from Cloudinary 'nimbus/' folder (paginated, up to 50/page)
        ↓
For each image:
  → Check if already in DB (skip if exists)
  → Gemini Vision classifies it: "poster" or "logo"
  → Gemini Vision describes the aesthetic (2-3 sentences)
  → embedText creates 768-dim vector
  → Save as DesignAsset (isSystemTemplate: true)
  → Wait 35 seconds between images (rate limit protection)
        ↓
Report: succeeded / failed / total in DB
```

---

## Gemini Service (`gemini.service.js`) — Exported Functions

| Function | Description |
|---|---|
| `describeDesign(imageUrl)` | Fetches image, converts to base64, sends to Gemini 2.5 Flash Vision. Returns 2-3 sentence aesthetic description. |
| `embedText(text)` | Generates a 768-dim embedding vector. **Currently mocked** (returns random floats) due to API region limitations — RAG pipeline still executes correctly. |
| `generateImage(prompt)` | Calls Pollinations.ai (`zimage` model) with the augmented prompt. Returns a raw image buffer. |
| `ingestDesignAsset(url, type, userId, prompt, templateType)` | Full ingestion pipeline: describe → embed → save to MongoDB. Called after every generation as fire-and-forget. |
| `generateText(prompt)` | Simple Gemini 2.5 Flash text generation. Used by the report and email controllers. |

---

## Frontend Structure

```
nimbus-frontend/src/
├── api/           → Axios API call wrappers (auth, poster, logo, report)
├── assets/        → Static images and icons
├── components/
│   ├── auth/      → Login, Signup, OTP verification, Forgot Password pages
│   ├── common/    → Shared UI: Navbar, Sidebar, LoadingSpinner, Modals
│   ├── dashboard/ → Main dashboard view with activity summary
│   ├── home/      → Landing page / marketing section
│   ├── profile/   → User profile management
│   ├── tools/     → AI tool pages: PosterGenerator, LogoGenerator, ReportGenerator
│   └── zprotect/  → Route protection (PrivateRoute, auth guards)
├── context/       → React Context for global auth state
├── utils/         → Helper utilities (token management, formatting)
├── App.js         → Route definitions
└── index.css / theme.css → Global styles and design tokens
```

---

## Third-Party Integrations & APIs

| Service | SDK / Method | Usage |
|---|---|---|
| **Google GenAI (Gemini 2.5 Flash)** | `@google/genai` | Vision analysis, text generation, report writing |
| **Pollinations.ai** | REST API (Bearer token) | Image generation (`grok-imagine` model) |
| **Cloudinary** | `cloudinary` SDK | Buffer upload, CDN hosting, folder search (`nimbus/`) |
| **MongoDB Atlas** | `$vectorSearch` aggregation | RAG retrieval via 768-dim vector similarity |
| **Nodemailer** | SMTP | OTP and notification emails |

---

## Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=...                  # MongoDB Atlas connection string
JWT_SECRET=...                 # Access token signing secret
JWT_REFRESH_SECRET=...         # Refresh token signing secret
GEMINI_API_KEY=...             # Google GenAI API key
POLLINATIONS_API_KEY=...       # Pollinations.ai API key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...                 # SMTP email address
EMAIL_PASS=...                 # SMTP app password
```

---

## AI Tools Used During Development

- **Google Gemini** — Core AI model (Vision + text, integrated in product)
- **GitHub Copilot** — Code completion and acceleration
- **ChatGPT** — Research, debugging assistance, and ideation

---

## Mentor & Manager Interactions

During the development of Nimbus, the project underwent several key evolutionary shifts based on guidance:

- **Email Foundation for OTP**: Successfully implementing the standard email sending service was a major milestone achieved with mentor assistance.
- **Image Generation API Selection**: The strategic decision to move from Hugging Face Stable Diffusion XL (SDXL) to **Pollinations.ai** (`grok-imagine`) was made to improve reliability and image quality.
- **RAG Architecture Introduction**: The shift from direct API calls to a full **Retrieval-Augmented Generation pipeline** with MongoDB Atlas Vector Search was a key architectural evolution — driven by the goal of building a self-improving AI system.
- **Self-Learning Loop**: The `ingestDesignAsset` fire-and-forget pattern (automatically learning from every generation) was implemented to make Nimbus's AI progressively smarter with each use.