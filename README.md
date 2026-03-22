# AI PPT Generator

AI PPT Generator is a full-stack web app that turns raw text or uploaded documents into editable PowerPoint presentations. It combines a Next.js client, an Express API, MongoDB persistence, and Google Gemini for slide generation.

## What It Does

- Generates presentations from pasted text
- Extracts content from `.pdf`, `.doc`, `.docx`, and `.txt` uploads
- Saves presentations per user account
- Exports generated decks as `.pptx`
- Supports email verification and password reset flows
- Includes multiple built-in dark presentation themes

## Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Google Gemini API

### Presentation / File Processing
- PptxGenJS
- pdf-parse
- mammoth
