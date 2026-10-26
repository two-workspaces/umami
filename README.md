# Deploy and Host Umami on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/umami-web-analytics?referralCode=sLjDXb&utm_medium=integration&utm_source=button&utm_campaign=umami-web-analytics)

[Umami](https://umami.is/) is a simple, privacy-friendly alternative to Google Analytics. It counts page views, visitors, referrers, countries, devices and custom events without cookies and without collecting personal data, so you don't need a consent banner for it. This template runs Umami 3.4.1 from the official image on its own Postgres 17. The default `admin`/`umami` password is replaced on first boot, so a fresh deploy is never left open with a well-known login.

## About Hosting Umami

The stack is two services: Umami and Postgres.

- **Upstream's image, pinned.** Umami runs the official `ghcr.io/umami-software/umami` image at a fixed release (3.4.1), not `latest`. A thin wrapper ([source](https://github.com/two-workspaces/umami)) adds one small script and changes nothing else. Upgrading means bumping the tag.
- **No default password.** Every new Umami database starts with the user `admin` and the password `umami`. Here a small script waits for Umami to start and changes that password to the generated `UMAMI_ADMIN_PASSWORD`. On later boots it does nothing.
- **Postgres 17 on a volume.** Websites, events, sessions and users live in Postgres. Umami waits for Postgres to accept connections before it starts and runs its migrations on every start.
- **Small.** Umami is one Node.js process with no queue or cache to run alongside it. Both services fit in Railway's smaller plans.
- **Healthchecked.** Railway's healthcheck calls `/api/heartbeat`, which answers once migrations are done and the server is up.

## Common Use Cases

- Website analytics without cookie banners, for sites that care about GDPR and visitor privacy
- One dashboard for many sites: blogs, landing pages, docs and web apps under one account
- Product events, funnels, retention and UTM campaign tracking without sending data to a third party
- Sharing a public, read-only stats page with clients or your community

## Dependencies for Umami Hosting

- Postgres 17 (included, private network only)

### Deployment Dependencies

- [Umami documentation](https://umami.is/docs)
- [Umami environment variables](https://umami.is/docs/environment-variables)
- [Umami on GitHub](https://github.com/umami-software/umami)
- [Template source on GitHub](https://github.com/two-workspaces/umami)

### Implementation Details

**Sign in.** When the deploy is green, open your Umami domain and sign in as `admin` with the password in the Umami service's `UMAMI_ADMIN_PASSWORD` variable. Change it in Umami afterwards (Settings, Profile); the variable isn't used again. The deploy logs show `[railway-setup] admin password set from UMAMI_ADMIN_PASSWORD` once it's done.

**Track a site.** In Umami go to Settings, Websites, Add website, then copy the tracking code into your site's `<head>`:

```html
<script defer src="https://<your umami domain>/script.js" data-website-id="<website id>"></script>
```

**Ad blockers.** Some blockers stop requests to `script.js`. Set `TRACKER_SCRIPT_NAME` (for example `stats.js`) on the Umami service to serve the tracker under another name, and `COLLECT_API_ENDPOINT` to rename the collect endpoint.

**Two-factor sign-in.** Users can turn on 2FA in their profile. Its secrets are encrypted with `TWO_FACTOR_ENCRYPTION_KEY`, generated at deploy time; keep it, or users with 2FA can't sign in.

**Custom domains.** Add the domain to the Umami service in Railway and use it in the tracking code. Nothing else needs to change.

**Upgrading.** Bump the image tag in the Dockerfile of your fork and redeploy. Umami migrates the database on start, so back up Postgres first.

**Back up.** Everything is in Postgres. Use Railway's volume backups or `pg_dump`.

**Resources.** A fresh deploy uses about 150 MB of RAM for Umami and about 50 MB for Postgres. Postgres grows with traffic: each page view is a row.

## Why Deploy Umami on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Umami on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
