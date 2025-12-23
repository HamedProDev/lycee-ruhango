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