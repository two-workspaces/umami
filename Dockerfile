# Official Umami image plus a first-boot step that replaces the default
# admin/umami password with UMAMI_ADMIN_PASSWORD, so a fresh deploy is never
# open on a public URL with a well-known login.
FROM ghcr.io/umami-software/umami:3.4.1
COPY railway-setup.cjs /app/scripts/
CMD ["sh", "-c", "node scripts/railway-setup.cjs wait && (node scripts/railway-setup.cjs setup &) && exec sh scripts/start-docker.sh"]
