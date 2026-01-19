# AI Children's Book SaaS MVP

A one-click web application that generates personalized children's picture books using AI. Parents enter a few details, and the system generates a complete book with consistent characters across a cover + 10 pages, available as a downloadable PDF.

## Overview

This MVP enables parents/caregivers to create personalized children's books without writing stories or learning prompt engineering. The app generates:

- **Complete story** via OpenAI (title, 3–5 characters, 11 pages: cover + 10)
- **Consistent character images** via Replicate FLUX (maintains visual consistency across pages)
- **Downloadable PDF** ready for printing or sharing

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI Services**: OpenAI (story generation), Replicate FLUX (image generation)
- **Deployment**: Firebase Hosting (planned)

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities, Firebase config, API clients
├── types/                  # TypeScript type definitions
├── docs/                   # Project documentation (PRD, process docs)
└── tasks/                  # Task breakdown and implementation checklist
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Auth, Firestore, and Storage enabled
- OpenAI API key
- Replicate API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/antoniocepeda/AI-Children-Book-SaaS.git
cd AI-Children-Book-SaaS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your `.env.local` with:
- Firebase config (API keys, project ID, etc.)
- `DEMO_ID` (e.g., `childrens-book-saas`)
- OpenAI API key
- Replicate API key

4. Run the development server:
```bash
npm run dev
```

## Documentation

- **[PRD](./docs/PRD.md)** — Product Requirements Document
- **[Task List](./tasks/tasks-PRD.md)** — Implementation checklist

## Features

- ✅ Email/password authentication (Firebase Auth)
- ✅ Book creation form with minimal inputs
- ✅ AI-powered story generation (OpenAI)
- ✅ Character-consistent image generation (Replicate FLUX)
- ✅ Book preview with flipbook-style viewer
- ✅ PDF download
- ✅ "My Books" dashboard for managing generated books

## Demo Namespace

This app runs in a shared Firebase project. All data is namespaced under `demos/{demoId}/...` to prevent collisions with other demos:

- Firestore: `demos/{demoId}/books/{bookId}/...`
- Storage: `demos/{demoId}/books/{bookId}/pages/...`

## Status

🚧 **In Development** — MVP implementation in progress. See [tasks](./tasks/tasks-PRD.md) for current status.

## License

[Add your license here]
