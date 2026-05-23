# welcome to my project
## this was done by Lovable + Hamed

## Build & Deploy

1. Create a `.env` in the project root (do NOT commit secrets) or configure the following environment variables in your hosting platform:

	- `VITE_SUPABASE_URL` — your Supabase project URL (example: `https://xyz.supabase.co`)
	- `VITE_SUPABASE_PUBLISHABLE_KEY` — the Supabase public anon key

	You can copy `.env.example` and fill in values:

	```bash
	cp .env.example .env
	# then edit .env and replace placeholders
	```

2. Install dependencies and build:

	```bash
	npm install
	npm run build
	```

3. Preview the production build locally:

	```bash
	npm run preview
	```

4. Deploy: upload the output from the `dist` folder to any static hosting (Netlify, Vercel, Cloudflare Pages, etc.) that serves a SPA. Make sure to set the same `VITE_*` env vars in the hosting dashboard.

Notes:
- The project uses Vite environment variable prefix `VITE_` for values exposed to the browser.
- The Supabase client is guarded against server-side `localStorage` access during build/SSR.

Database / Supabase
-------------------

This project includes Supabase integration and migrations under the `supabase/` folder. To initialize and manage the database locally you can use the Supabase CLI (install: https://supabase.com/docs/guides/cli).

Quick steps to apply migrations and seed an admin user locally:

1. Install and login to the Supabase CLI:

```bash
npm install -g supabase
supabase login
```

2. Link your local project to the Supabase project (or skip and run migrations against a remote project):

```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:

```bash
supabase db push --yes
```

4. Run the provided seed script to create an admin user (set env vars first):

```bash
# copy example env and fill secrets (do NOT commit .env)
cp .env.example .env
# edit .env and set VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL
node scripts/seed-admin.mjs
```

Security note: `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` are sensitive — keep them out of source control and only use them in secure environments.

If you want help running migrations or connecting a local Supabase instance, tell me and I can walk through the steps or run helper commands here.