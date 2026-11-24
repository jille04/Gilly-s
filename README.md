# Gilly’s on Cloudflare Pages

The website in `public/` uses Cloudflare Pages Functions for Supabase Auth, profiles, pickup requests, and the staff dashboard. Orders are saved with their original price breakdown and a pending status. Only staff can confirm a request. Older browser-only summaries stay on the device and are visible to the same customer after signing in. Customers who used the browser-only build need to register a Supabase account.

## Configure secrets

Copy `.env.example` to `.env` for local development. In Cloudflare, add these values under **Pages → Settings → Variables and Secrets** for each environment you deploy. Use encrypted secrets for the password, session-signing secret, and Supabase keys. Keep all filled-in environment files outside `public/` and out of GitHub.

| Name | Value |
| --- | --- |
| `ADMIN_USERNAME` | Admin sign-in name, such as `gillys.admin` |
| `ADMIN_PASSWORD` | A new unique password, at least 16 characters |
| `ADMIN_SESSION_SECRET` | A separate random string, at least 32 characters |
| `SUPABASE_URL` | The Gilly’s project's HTTPS API URL |
| `SUPABASE_PUBLISHABLE_KEY` | The project's `sb_publishable_…` key from Supabase **Settings → API Keys** |
| `SUPABASE_SECRET_KEY` | A dedicated `sb_secret_…` key from the same project, used only by Pages Functions |

Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Rotating any administrator credential invalidates existing admin sessions.

## Deploy and test

1. The migration in `supabase/migrations/` has been applied to the Gilly’s project. Apply it only if deploying to a different project.
2. Create a Git-connected **Cloudflare Pages** project using this repository and production branch `main`. Set the build command to `node tools/sync-order-catalog.mjs --check` and the build output directory to `public`. Add the environment values above before deploying the connected version. For local development, run `npx wrangler pages dev public`. For CLI deployment, use `npx wrangler pages deploy public --project-name YOUR_PROJECT_NAME` from the repository root.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed origin and allow the exact `https://YOUR_HOST/api/customer/confirmed` and `https://YOUR_HOST/api/customer/recovery` callback URLs. Add those paths for localhost only when testing. Keep email confirmation enabled and configure SMTP for customer confirmation and password reset emails.
4. Open `/api/customer/settings` on the deployed origin to verify the Supabase connection. Then create and confirm a test customer account, place a pickup request, and use `/admin/` to confirm it. Check the updated status from the customer’s **My Orders** page.
5. Configure a Cloudflare rate-limit rule for POST requests to `/api/admin/login` on the production hostname.

Run `node tools/sync-order-catalog.mjs` whenever pickup rules, prices, or the product catalog in `public/script.js` change. The generated server catalog ensures checkout recalculates the same estimate before saving an order.
