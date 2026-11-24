# Gilly’s on Cloudflare Pages

The deployable site lives in `public/`. The admin authentication endpoint lives in `functions/`. Customer accounts, orders, and tax settings still use browser-local storage.

## Local development

Copy `.env.example` to `.env` beside this README. Fill in the three settings.

- `ADMIN_USERNAME` is the admin sign-in name. Use 3–24 lowercase letters, digits, periods, underscores, or hyphens.
- `ADMIN_PASSWORD` is a new, unique password of at least 16 characters.
- `ADMIN_SESSION_SECRET` is a separate random string of at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Run `npx wrangler pages dev public` from the project root. Open the localhost URL printed by Wrangler and go to `/admin/`. Keep `.env` outside `public/` and out of version control.

## Deploy

1. In Cloudflare Pages, add the three variables as **encrypted secrets** under **Settings → Variables and Secrets**. Configure the environment you are deploying to.
2. From the project root, run `npx wrangler pages deploy public --project-name YOUR_PROJECT_NAME`. For a Git-connected Pages project, set the build output directory to `public`; Pages picks up the root-level `functions/` folder. The dashboard ZIP upload does not deploy Pages Functions.
3. Open `/admin/` on the deployed site and sign in with the username and password you configured.

The project uses one Cloudflare-managed administrator. Rotate `ADMIN_PASSWORD` in Pages to recover access. Password, username, or signing secret changes invalidate existing sessions when the updated configuration takes effect. Configure a Cloudflare rate-limit rule for POST requests to `/api/admin/login` on the production hostname.

Use a new password if the previous static build was shared or published. Its embedded credential hashes are removed from this build.
