# Web3NoteApp

Web3NoteApp is a modern note-taking application built with React, TypeScript, and Vite.
It supports Firebase authentication, Supabase-backed persistence, rich notes, checklists, reminders, image attachments, and code snippets in a clean responsive interface.

## Features

- Email/password and Google sign-in (Firebase Auth)
- Rich note editor with:
  - Plain notes
  - Checklists
  - Code blocks
  - Image attachments
  - Reminder date/time
- Pin, archive, trash, restore, and permanent delete
- Bulk selection and permanent delete in Trash
- Duplicate notes and export note as Markdown
- Quick-create templates (Meeting, Task List, Journal)
- Color-accented notes and edited-time sorting
- Responsive UI for desktop and mobile

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Firebase Authentication
- Supabase (Database + Storage)

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment variables

Create a local environment file from your template:

```sh
cp .env.example .env
```

Set the following values in `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_GOOGLE_CLIENT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Apply database migrations

```sh
supabase db push
```

### 4. Start the development server

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Test

```sh
npm run test
```

## Deployment

The project is ready for Vercel deployment.

```sh
npx vercel --prod
```

## Project Structure

- `src/components`: Reusable UI and feature components
- `src/hooks`: App state and interaction hooks
- `src/integrations/firebase`: Firebase setup
- `src/integrations/supabase`: Supabase client and types
- `supabase/migrations`: Database and policy migrations

## License

This project is private unless explicitly licensed by the repository owner.
