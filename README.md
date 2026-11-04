Lucea ✨

A clean and modern space for visual discovery.

Lucea is built for creatives. It's a focused environment designed to help you find your next spark of inspiration without the noise. Explore beautifully curated collections and a vast library of high-quality photos and videos, all presented in a minimal, content-first interface.

Discover.

## Project structure

- `client/` — React, TypeScript, and Vite frontend.
- `server/` — Express API and server-only integrations.

## Backend setup

The backend requires Node.js 22 or newer. From `server/`:

```sh
npm install
cp .env.example .env
npm run dev
```

Copy `server/.env.example` to `server/.env` and set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `PEXELS_API_KEY`, and `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-3-flash-preview`. Keep provider secrets in the server environment; never add a secret key to a `VITE_` variable or commit it.

For browser sign-in, copy `client/.env.example` to `client/.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the matching Supabase project. The publishable key is intended for browser use; the secret key is not. Apply `server/supabase/migrations/202611040001_moodboards.sql` in the Supabase SQL editor before using cloud moodboards.

### Daily discovery topics

The topic strip is backed by one replaceable `daily_topics` row. Supabase Cron runs a Supabase Edge Function once a day at **00:00 UTC**; the function asks Gemini for 10 fresh topics and replaces the row only after validating the complete response. If generation fails, the previously published topics remain in place. The existing topic list is seeded as the initial set. The client refreshes topics periodically and keeps its last loaded set if Supabase is temporarily unavailable.

To enable the scheduled refresh:

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), run `supabase login`, and link the `server/` project with `supabase link --project-ref <your-project-ref>`.
2. Generate a strong random secret locally (for example, `openssl rand -hex 32`). Keep it private. Set the Gemini key and this secret for Edge Functions, then deploy the function:

   ```sh
   cd server
   supabase secrets set GEMINI_API_KEY=<your-gemini-api-key> DAILY_TOPICS_CRON_SECRET=<your-random-secret>
   supabase functions deploy refresh-daily-topics
   ```

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Do not put these secrets in the client or commit them.
3. In the Supabase dashboard, open **Database → Vault** and add two secrets:
   - Name `project_url`, value `https://<your-project-ref>.supabase.co`
   - Name `daily_topics_cron_secret`, value the **same random secret** used in the `supabase secrets set` command.

   Enter secrets in the Vault UI rather than putting their values in SQL or source control.

4. Apply `server/supabase/migrations/202611040002_daily_topics.sql` in the SQL editor. It creates the public read-only topic row, enables `pg_cron`/`pg_net`, and schedules the daily call. The Vault entries must exist before applying this migration.
5. To publish the first Gemini-generated set immediately rather than wait until the next midnight UTC, invoke the deployed function once from a trusted terminal:

   ```sh
   curl --fail-with-body -X POST \
     "https://<your-project-ref>.supabase.co/functions/v1/refresh-daily-topics" \
     -H "x-cron-secret: <the-same-random-secret>" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

   The function reports success only after the new set has been saved. Check function logs and `select jobname, schedule from cron.job where jobname = 'refresh-daily-topics';` if the scheduled run does not occur.

To enable Google sign-in:

1. Create a Google OAuth client in Google Cloud Console. Add your local and production app origins as authorized JavaScript origins.
2. In Google Cloud's authorized redirect URIs, add the callback URL shown by the Supabase dashboard under **Authentication → Providers → Google** (usually `https://<project-ref>.supabase.co/auth/v1/callback`). This is the Supabase provider callback, not the app callback.
3. In Supabase **Authentication → Providers → Google**, enable Google and enter the Google OAuth client ID and client secret.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed app origin and add `http://localhost:5173/auth/callback` plus the production `https://<app-domain>/auth/callback` to the redirect URL allow list.

The client uses Supabase's PKCE flow and completes the code exchange at `/auth/callback`. Google OAuth credentials belong in the Supabase dashboard, never in client or server env files.

In Supabase Auth settings, also enable email/password if you want to retain password sign-in, and add local and deployed client URLs to the allowed redirect URLs.

Run `npm run dev` in both `server/` and `client/` (two terminals). The Vite development server proxies `/api` requests to Express on port 3001. The frontend sends Pexels media requests, Gemini recommendations/image-keyword requests, and moodboard operations through this API. Pexels and Gemini endpoints are rate-limited. Moodboards and bookmarks require a signed-in account and are loaded from and saved directly to Supabase; guests are prompted to sign in or create an account before accessing them.

`GET /api/health` reports whether provider configuration is present. `GET /api/health/supabase`, `/api/health/pexels`, and `/api/health/gemini` check live provider connectivity. For production, deploy the Express server and configure `VITE_API_BASE_URL` in the client build to the API base URL including `/api`; set `CLIENT_ORIGIN` on the server to the deployed client origin(s).