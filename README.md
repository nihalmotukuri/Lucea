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

### Public profiles and moodboards

Apply `server/supabase/migrations/202611060001_public_moodboards.sql` after the moodboards migration to enable public profiles and per-board visibility, then apply `server/supabase/migrations/202611070001_public_moodboard_search.sql` to enable relevance-ranked public-board search. Moodboards remain private by default. Signed-in users can choose a unique 3–30 character handle at `/profile`, then publish individual boards from their moodboard page. Public profile links use `/profiles/<handle>` and board links use `/profiles/<handle>/boards/<id>`. Only published boards appear in profile pages and search recommendations; matching uses board titles and saved-item descriptions/creators. The public API returns the profile handle and user ID, never account email addresses.

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

Run `npm run dev` in both `server/` and `client/` (two terminals). The Vite development server proxies `/api` requests to Express on port 3001. The frontend sends Pexels media requests, Gemini recommendations/image-keyword requests, public moodboard discovery, profile updates, and private moodboard operations through this API. Pexels and Gemini endpoints are rate-limited. Managing moodboards and profiles requires a signed-in account; public profiles and explicitly published boards are viewable without signing in.

`GET /api/health` reports whether provider configuration is present. `GET /api/health/ready` reports API and rate-limit-store readiness. `GET /api/health/supabase`, `/api/health/pexels`, and `/api/health/gemini` check live provider connectivity. For production, deploy the Express server and configure `VITE_API_BASE_URL` in the client build to the API base URL including `/api`; set `CLIENT_ORIGIN` on the server to the deployed client origin(s).

## CI, production, and release checks

GitHub Actions runs the client tests, lint, production build, and server API tests for pull requests and pushes to `main`. Run the same checks locally with `npm test`, `npm run lint`, and `npm run build` in `client/`, and `npm test` in `server/`.

The API uses per-process in-memory rate limits during local development. In production, configure `RATE_LIMIT_REDIS_URL` with a private Redis service URL (`rediss://` is recommended for managed services). All API replicas must use the same Redis service so rate limits are shared. Production startup fails without Redis unless `RATE_LIMIT_STORE=memory` is explicitly set; that opt-in is suitable only for a deliberate single-instance deployment, and startup logs a warning.

Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies between clients and the API (usually `1` behind one ingress/load balancer; use `0` when the API is directly exposed). Do not enable broad proxy trust or forward client-provided `X-Forwarded-For` values through an untrusted proxy: this setting determines the client IP used by rate limiting. Set `NODE_ENV=production`, `CLIENT_ORIGIN` to the deployed frontend origin(s), and the server provider credentials in the API host's secret manager.

Before promoting a release, apply and verify the SQL migrations in `server/supabase/migrations/` in staging and production. Keep the remote Supabase migration history in sync: if a migration was already applied manually, reconcile its history with the Supabase CLI before using `supabase db push`, rather than applying it twice. After deploying the API and migrations, run the staging/production smoke checks:

```sh
cd server
SMOKE_API_BASE_URL=https://<api-domain>/api npm run smoke
```

The smoke check verifies API and Redis readiness, live Pexels and Gemini connectivity, Supabase connectivity, and that the moodboards and public-profile migrations are ready. Run it against staging before promotion and against production after deployment; configure the host's normal uptime/error monitoring to alert on failed checks and provider outages.