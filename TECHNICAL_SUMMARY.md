# Technical Summary: Nimbus Project

## Architecture Overview
Nimbus is built on the **MERN** (MongoDB, Express, React, Node.js) stack, following a client-server architecture designed for asynchronous AI orchestration.

### Key Design Decisions:
- **Cloudinary for Fast Images**: We decided to use Cloudinary to store and host all AI-generated images. This keeps our database lightweight and ensures that your posters and logos load instantly and can be downloaded in high quality.
- **Smart Form-to-AI Logic**: Instead of making users learn how to talk to AI, we use simple forms. The system automatically turns your basic input into a professional instruction for the AI behind the scenes.

---

## Full Tech Stack
- **Frontend**: React 19, CSS , Javascript
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB (via Mongoose)
- **AI Processing**: Google Generative AI (`@google/generative-ai`), Hugging Face Inference(`@huggingface/inference`)
- **Media Storage**: Cloudinary (for image assets)
- **Email Service**: Nodemailer (via SMTP)

### Core Libraries & Dependencies:

**Frontend**
- **react / react-dom**: Core UI library for building the component-based interface.
- **react-router-dom**: Handles client-side routing and navigation between dashboard views.
- **axios**: Used for standardized HTTP requests and API communication.
- **react-icons**: Provides a comprehensive set of icons for the sidebar, header, and buttons.
- **@brenoroosevelt/toast**: Implements the notification system .
- **react-scripts**: Manages the build pipeline and development server.

**Backend**
- **express**: The foundation for the RESTful API and route orchestration.
- **mongoose**: MongoDB object modeling tool for managing user data and activity audits.
- **jsonwebtoken (JWT)**: Securely handles user sessions and stateless authentication.
- **bcryptjs**: Used for secure password hashing and encryption.
- **dotenv**: Manages sensitive credentials and environment-specific configurations.
- **cors**: Enables secure cross-origin resource sharing between frontend and backend.
- **nodemailer**: Powering the SMTP service for OTP delivery and email automation.
- **cloudinary**: Manages image buffer uploads and cloud hosting.
- **@google/generative-ai**: Official SDK for integrating Gemini Large Language Models.
- **@huggingface/inference**: Hub for Stable Diffusion XL image generation tasks.

---

## List of all AI Tools used
- CHAT GPT
- Google Gemini
- CoPilot

---

## Third-Party Integrations & APIs
- **Google Generative AI SDK**: Core text generation.
- **Hugging Face Inference API**: Stable Diffusion XL access.
- **Cloudinary SDK**: Media storage.

---

## Mentor & Manager Interactions
During the development of Nimbus, the project underwent several key evolutionary shifts based on guidance:
- **Email Foundation for OTP**: Successfully implementing the standard email sending service was a major milestone achieved with mentor assistance.
- **Image Generation API Selection**: The strategic choice of using Hugging Face's Stable Diffusion XL (SDXL) was directed by mentor feedback.