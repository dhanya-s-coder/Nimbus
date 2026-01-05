# Nimbus: Internal Agentic AI Tool

>Nimbus is a premium, AI-powered orchestration platform designed to serve as an "Intelligent Halo" for academic and departmental tasks. It automates the creation of professional communications, event graphics, brand identities, and structural reports, allowing faculty and society members to focus on high-value human interaction.

## Table of Contents
- [Nimbus: Internal Agentic AI Tool](#nimbus-internal-agentic-ai-tool)
  - [Table of Contents](#table-of-contents)
  - [Problem Statement](#problem-statement)
  - [Live Demo](#live-demo)
  - [Features](#features)
    - [Email Generation Agent](#email-generation-agent)
    - [Poster Generation Agent](#poster-generation-agent)
    - [Logo Generation Agent](#logo-generation-agent)
    - [Report Generation Agent](#report-generation-agent)
  - [User Guide](#user-guide)
    - [1. Getting Started](#1-getting-started)
    - [2. Dashboard Overview](#2-dashboard-overview)
    - [3. Using the Agents](#3-using-the-agents)
      - [Email Generator Agent](#email-generator-agent)
      - [Poster Generation Agent](#poster-generation-agent-1)
      - [Logo Generation Agent](#logo-generation-agent-1)
      - [Report Generation Agent](#report-generation-agent-1)
    - [4. History and Activity Management](#4-history-and-activity-management)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [AI \& Services](#ai--services)
  - [Setup \& Installation](#setup--installation)
    - [Prerequisites](#prerequisites)
    - [Backend Installation](#backend-installation)
    - [Frontend Installation](#frontend-installation)
  - [Credits \& Attributions](#credits--attributions)

---

## Problem Statement
In an academic environment, administrative work often consumes a significant portion of time. Professors, society members /students, and office staff spend hours:
1.  **Drafting formal emails** for announcements, notices, and individual feedback.
2.  **Designing event posters** for seminars, hackathons, and recruitment drives.
3.  **Creating brand concepts** for new societies or initiatives.
4.  **Preparing Report from raw notes** into structured departmental reports.

**Nimbus** solves this by providing a unified, role-aware dashboard where AI agents handle these tasks in seconds, maintaining a consistent professional standard across the institution.

---

## Live Demo
- **Live Application**:
- **Demo Video**:

---

## Features

### Email Generation Agent
- **AI Generation**: Formal emails are generated based on a subject and prompt using Gemini 2.5 Flash, with the option for manual editing.
- **One-Click Send**: Emails can be sent directly through an integrated SMTP service with a single click.
- **Audits**: Drafts and sent emails are saved and tracked in the user's personalized history.
- **Export**: Generated email content can be exported to the user's local system.

### Poster Generation Agent
- **Template Options**: User can select from Academic, Recruitment, Event, Hackathon, or Announcement templates and fill in the required input fields accordingly.
- **AI Generation**: posters are generated using **Stable Diffusion XL** via Hugging Face.
- **Audits**: All generated posters are saved as drafts or finals, and are tracked accordingly.
- **Export**: Generated poster content can be exported to the user's local system.

### Logo Generation Agent
- **Brand Identity**: User can define the brand name, tagline, and preferred style (Minimal, Modern, Bold, etc.) to guide logo creation.
- **AI Generation**: Logo concepts are generated using **Stable Diffusion XL AI** based on the provided brand inputs and stylistic preferences.
- **Audits**: All generated logos are saved in the user's history as draft or finals, for easy tracking.
- **Export**: Generated logo content can be exported to the user's local system.

### Report Generation Agent
- **Administrative Synthesis**: Raw notes are converted into structured reports such as Meeting Minutes, Event Summaries, and Monthly Progress updates.
- **AI Generation**: Reports are generated using AI to ensure clear hierarchy, concise points, and actionable summaries.
- **Audits**: All generated reports are saved in the user's history with draft and final statuses for traceability.
- **Export**: Generated report content can be exported to the user's local system.

---

## User Guide

Nimbus is designed to be intuitive and powerful. Below is a detailed guide on how to make the most of each agent.

### 1. Getting Started
- **Account Creation**: Navigate to the **signup** page and provide your details.
- **OTP Verification**: A 6-digit OTP will be sent to your email. Enter it on the verification page to activate your account.
- **Login**: Use your credentials to access the secure dashboard.

### 2. Dashboard Overview
The Dashboard is your control center.
- **Navigation**: Use the sidebar to switch between different AI agents.
- **Quick Stats**: view your total activities and recent creations at a glance on the profile page.
- **Direct Access**: Click on any agent card to start a new task from the quick actions in dashboard.

### 3. Using the Agents

#### Email Generator Agent
1. **Inputs**: Enter a descriptive **subject** and a brief **prompt** (e.g., "Request for a project update meeting").
2. **Generation**: Click **Generate Email**. The AI will draft a formal email.
3. **Editing**: You can manually refine the generated text in the editor.
4. **Sending**: Enter the recipient's email and click **Send Email** to dispatch it instantly.
5. **Auditing**: Click **Save Draft** to store it for later.
6. **Export**: Once generated, use the **Download** button to download a high-quality PNG.

#### Poster Generation Agent
1. **Template**: Choose from **Academic**, **Hackathon**, **Event**, etc.
2. **Details**: Fill in the form with event name, date, venue, and description.
3. **Generation**: Click **Generate Poster**.
4. **Auditing**: Click **Save Draft** to store it for later and **Finalize** to store it with status as final.
5. **Export**: Once generated, use the **Export** button to download a high-quality PNG.

#### Logo Generation Agent
1. **Identity**: provide the **Brand Name** and an optional **Tagline**.
2. **Details**: Fill the detials related to the brand , and preferences for logo.
3. **Generation**: Click **Generate Logo**.
4. **Auditing**: Click **Save Draft** to store it for later and **Finalize** to store it with status as final.
5. **Export**: Once generated, use the **Export** button to download a high-quality PNG.

#### Report Generation Agent
1. **Source Data**: Paste your raw notes or meeting minutes.
2. **Synthesis**: The AI organizes the content with clear headings and bullet points.
3. **Generation**: Click **Generate Report**.
4. **Auditing**: Click **Save Draft** to store it for later and **Finalize** to store it with status as final.
5. **Export**: Save the report to your system by using the **Download** button.

### 4. History and Activity Management
- **History**: Access the **History** page to see a chronological log of everything you've generated.
- **Filtering**: View specific types of activities (Emails, Posters, Logs, Reports, Drafts).
- **Revisiting**: Click on **Edit** button on any past activity to reload it into the respective agent for further editing or viewing.
- **Deleting**: Click on **Delete** button on any past activity to delete it from the history.

---

## Tech Stack

### Frontend
- **React**: Component-based UI for dashboard and agent workflows
- **HTML**: Semantic structure for accessibility and layout
- **CSS**: Custom theming and responsive styling
- **JavaScript**: Client-side logic and API communication

### Backend
- **Node.js & Express**: REST API and agent orchestration
- **MongoDB & Mongoose**: Persistent storage for users, audits, and generated content
- **JWT**: Secure authentication using access and refresh tokens

### AI & Services
- **Google Gemini API**: Email and report content generation
- **Hugging Face Inference**: Stable Diffusion XL for poster and logo generation
- **Cloudinary**: Media hosting for generated posters and logos
- **Nodemailer**: SMTP-based email delivery


---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- API Keys: Hugging Face, Gemini, and SMTP credentials.

### Backend Installation
1.  Navigate to the backend folder:
    ```bash
    cd nimbus-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and and write follwing credentials in it:
    ```env
    PORT=5000
    GEMINI_API_KEY=
    HF_API_KEY=
    MONGO_URI=
    EMAIL_USER=
    EMAIL_PASS=
    ACCESS_TOKEN_SECRET=
    REFRESH_TOKEN_SECRET=
    ACCESS_TOKEN_EXPIRY=
    REFRESH_TOKEN_EXPIRY=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### Frontend Installation
1.  Navigate to the frontend folder:
    ```bash
    cd nimbus-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm start
    ```

---

## Credits & Attributions
- Use of **Antigravity IDE** for some of the UI design and styling.
- Use of **ChatGPT** for some error correction and suggestions for how to proceed with the project.
- **Website Logo**: Custom-designed SVG generated via **Google Gemini AI**
- **Toast Notifications**: [@brenoroosevelt/toast](https://github.com/brenoroosevelt/toast-js)
- **Image Model**: Stability AI's Stable Diffusion XL (via Hugging Face)
- **Text Model**: Google's Gemini 2.5 Flash
- **Cloud Hosting**: Cloudinary Media Management

---

### API Documentation References
- Google Gemini API: https://ai.google.dev/gemini-api/docs/api-key
- Hugging Face Inference API: https://huggingface.co/docs/inference-providers/en/tasks/text-to-image
- Cloudinary Documentation: https://cloudinary.com/documentation
- Nodemailer Documentation: https://nodemailer.com/about/
