# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## MongoDB Atlas setup (serverless notes storage)

Notes are persisted in MongoDB Atlas through a local Node API server (`server/index.js`) that uses the MongoDB URI.

1. Create a MongoDB Atlas project and cluster.
2. In Atlas, open Network Access and allow your IP (or `0.0.0.0/0` for temporary testing).
3. In Atlas, create a Database User with read/write access to your app database.
4. Copy `.env.example` to `.env`.
5. Set these values in `.env`:

- `VITE_NOTES_API_BASE_URL` (default `http://localhost:8787`)
- `MONGODB_URI`
- `MONGODB_URI_DIRECT` (optional fallback if SRV DNS fails)
- `MONGODB_DATABASE` (for example `aether_notes`)
- `MONGODB_NOTES_COLLECTION` (for example `user_states`)
- `NOTES_API_PORT` (default `8787`)

1. Start backend API in one terminal: `npm run dev:api`
2. Start frontend in another terminal: `npm run dev`

If you see `querySrv ECONNREFUSED`, your DNS is likely blocking SRV lookup for `mongodb+srv`. In Atlas Drivers for Node.js, copy the standard (non-SRV) connection string and set it as `MONGODB_URI_DIRECT`, then restart the API server.

The app stores one document per user in `user_states`:

```json
{
  "ownerId": "<auth-user-id>",
  "state": {
    "version": 2,
    "notes": []
  },
  "updatedAt": "2026-03-12T00:00:00.000Z"
}
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
