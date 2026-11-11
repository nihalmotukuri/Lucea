# Lucea

Lucea is a visual-discovery space for creatives. Explore photos and videos, follow daily inspiration topics, and collect ideas in moodboards—all in a focused, content-first interface.

## What you can do

- Discover and search photos and videos from Pexels.
- Explore related media and Gemini-powered search recommendations.
- Save media to private moodboards.
- Create a public profile and publish selected moodboards.
- Browse daily discovery topics, refreshed once a day with Gemini.

## Project layout

- `client/` — React, TypeScript, and Vite application.
- `server/` — Express API and server-side integrations with Pexels, Gemini, and Supabase.
- `server/supabase/` — Database migrations and the `refresh-daily-topics` Edge Function.

## Local development

The API requires Node.js 22 or newer. Install dependencies and configure the server in one terminal:

```sh
cd server
npm install
cp .env.example .env
```

Set the provider credentials in `server/.env` (see [Server configuration](#server-configuration)), then start the API:

```sh
npm run dev
```

In a second terminal, install and configure the client:

```sh
cd client
npm install
cp .env.example .env
```

Set the Supabase browser settings in `client/.env` if you want sign-in and cloud moodboards (see [Client configuration](#client-configuration)), then start Vite:

```sh
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. During development, Vite proxies `/api` requests to the Express API on port `3001`.

### Server configuration

Set these values in `server/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `3001`. |
| `CLIENT_ORIGIN` | Client origin allowed to access the API; defaults to `http://localhost:5173`. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used by the server. |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key. Never expose it to the browser. |
| `PEXELS_API_KEY` | Pexels API credential. |
| `GEMINI_API_KEY` | Gemini API credential. |
| `GEMINI_MODEL` | Gemini model; defaults to `gemini-3-flash-preview`. |

`TRUST_PROXY_HOPS` defaults to `0`. Set it to the exact number of trusted reverse proxies in front of the API when deploying behind a proxy. Production rate limiting uses Redis; configure `RATE_LIMIT_REDIS_URL` with a private Redis URL (`rediss://` is recommended for managed services).

### Client configuration

Set these values in `client/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | The URL for the same Supabase project used by the server. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The matching Supabase publishable key. This key is intended for browser use. |
| `VITE_API_BASE_URL` | Optional API base URL. Leave empty for the local Vite proxy; in production, set it to the API URL including `/api`. |

Never put Supabase secret keys or other provider credentials in `VITE_` variables.

## Supabase setup

### Moodboards and public profiles

Apply the migrations in order using the Supabase SQL editor:

1. `server/supabase/migrations/202611040001_moodboards.sql`
2. `server/supabase/migrations/202611060001_public_moodboards.sql`
3. `server/supabase/migrations/202611070001_public_moodboard_search.sql`

The first migration enables cloud moodboards. The next two add public profiles, per-board visibility, and relevance-ranked public-board search. Moodboards are private by default. Signed-in users can choose a unique 3–30 character handle at `/profile` and publish individual boards from their moodboard page. Public profile URLs use `/profiles/<handle>`; board URLs use `/profiles/<handle>/boards/<id>`. Only published boards appear in profiles and search recommendations. Public API responses include a profile handle and user ID, not account email addresses.

### Daily discovery topics

The topic strip starts with a seeded list stored in a replaceable `daily_topics` row. Supabase Cron calls an Edge Function at 00:00 UTC each day. The function asks Gemini for 10 topics and replaces the row only after validating the complete response, so a failed generation leaves the previous topics in place. The client periodically refreshes the list and keeps its last loaded topics if Supabase is unavailable.

To enable scheduled updates:

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), run `supabase login`, and link the `server/` project:

   ```sh
   cd server
   supabase link --project-ref <your-project-ref>
   ```

2. Generate a strong random secret locally (for example, `openssl rand -hex 32`). Set the Gemini key and secret for Edge Functions, then deploy:

   ```sh
   supabase secrets set GEMINI_API_KEY=<your-gemini-api-key> DAILY_TOPICS_CRON_SECRET=<your-random-secret>
   supabase functions deploy refresh-daily-topics
   ```

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Keep these server-side secrets out of the client and source control.

3. In the Supabase dashboard, open **Database → Vault** and add:
   - `project_url` with the value `https://<your-project-ref>.supabase.co`
   - `daily_topics_cron_secret` with the same random secret used above

   Add the values through the Vault UI; do not put secret values in SQL or source control.

4. Apply `server/supabase/migrations/202611040002_daily_topics.sql` in the SQL editor. It enables `pg_cron` and `pg_net`, creates the public read-only topic row, and schedules the daily request. Create both Vault entries before applying this migration.

5. To publish a generated topic set immediately instead of waiting for the next scheduled run, invoke the deployed function from a trusted terminal:

   ```sh
   curl --fail-with-body -X POST \
     "https://<your-project-ref>.supabase.co/functions/v1/refresh-daily-topics" \
     -H "x-cron-secret: <the-same-random-secret>" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

   The function reports success only after saving the new set. If a scheduled run does not occur, check the function logs and verify the schedule with:

   ```sql
   select jobname, schedule
   from cron.job
   where jobname = 'refresh-daily-topics';
   ```

### Google sign-in

1. Create a Google OAuth client in Google Cloud Console. Add local and production app origins as authorized JavaScript origins.
2. Add the callback URL shown in the Supabase dashboard under **Authentication → Providers → Google** to Google's authorized redirect URIs. It is usually `https://<project-ref>.supabase.co/auth/v1/callback`; this is the Supabase provider callback, not the app callback.
3. Enable Google under **Supabase → Authentication → Providers → Google** and enter the Google OAuth client ID and client secret.
4. Under **Supabase → Authentication → URL Configuration**, set the Site URL to the deployed app origin and add `http://localhost:5173/auth/callback` and `https://<app-domain>/auth/callback` to the redirect URL allow list.

The client uses Supabase's PKCE flow and completes the code exchange at `/auth/callback`. Google OAuth credentials belong in the Supabase dashboard, not in client or server environment files. Enable email/password in Supabase Auth if you also want password sign-in, and add local and deployed client URLs to the allowed redirect URLs.

## API health checks

- `GET /api/health` reports whether provider configuration is present.
- `GET /api/health/ready` reports API and rate-limit-store readiness.
- `GET /api/health/supabase`, `GET /api/health/pexels`, and `GET /api/health/gemini` check live provider connectivity.

Pexels and Gemini API endpoints are rate-limited. Managing moodboards and profiles requires a signed-in account; public profiles and explicitly published boards are available without signing in.

## CI and production

GitHub Actions runs client tests, lint, and a production build, along with server API tests, on pull requests and pushes to `main`. Run the same checks locally:

```sh
cd client
npm test
npm run lint
npm run build

cd ../server
npm test
```

For production, deploy the Express API and set `VITE_API_BASE_URL` in the client build to the API base URL including `/api`. Configure `CLIENT_ORIGIN` on the server for the deployed client origin(s), set `NODE_ENV=production`, and provide server credentials through the API host's secret manager.

Production rate limiting requires Redis unless `RATE_LIMIT_STORE=memory` is explicitly set. All API replicas must use the same Redis service. The memory-store option is intended only for a deliberate single-instance deployment and logs a warning. Set `TRUST_PROXY_HOPS` to the exact number of trusted proxies (usually `1` behind one ingress/load balancer, or `0` when the API is directly exposed). Do not enable broad proxy trust or pass untrusted client-provided `X-Forwarded-For` values through a proxy; this setting determines the client IP used for rate limiting.

Before release, apply and verify the SQL migrations in staging and production. Keep the remote Supabase migration history in sync: if a migration was already applied manually, reconcile its history with the Supabase CLI before running `supabase db push` to avoid applying it twice.

Run the API smoke check against staging before promotion and production after deployment:

```sh
cd server
SMOKE_API_BASE_URL=https://<api-domain>/api npm run smoke
```

The smoke check verifies API and Redis readiness, live Pexels and Gemini connectivity, Supabase connectivity, and readiness of the moodboard and public-profile migrations. Configure your hosting platform's uptime and error monitoring to alert on failed checks and provider outages.
