# Telegram Forward Posts Bot on Cloudflare Workers

Forwards new, non-forwarded, non-album posts from one Telegram channel to
another. The bot must be an administrator in both channels, with permission to
read source posts and post in the target channel.

## Deploy

1. Install dependencies and authenticate with Cloudflare:

   ```sh
   npm install
   npx wrangler login
   ```

2. Store the bot token and a random webhook secret as encrypted Worker secrets:

   ```sh
   npx wrangler secret put BOT_TOKEN
   npx wrangler secret put WEBHOOK_SECRET
   ```

3. Set `SOURCE_CHANNEL_ID` and `TARGET_CHANNEL_ID` in `wrangler.jsonc` using a
   `vars` object, or store them as secrets with `wrangler secret put` as well.

4. Deploy:

   ```sh
   npm run deploy
   ```

5. Register the deployed URL with Telegram (replace all placeholders):

   ```sh
   curl --request POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     --header "Content-Type: application/json" \
     --data '{"url":"https://telegram-forward-posts-bot.<SUBDOMAIN>.workers.dev","secret_token":"<WEBHOOK_SECRET>","allowed_updates":["channel_post"]}'
   ```

Telegram sends the secret in a request header, so it is not exposed in the
Worker URL. `WEBHOOK_SECRET` is optional in code, but strongly recommended.

## Local development

Copy `.dev.vars.example` to `.dev.vars`, fill in the values, then run:

```sh
npm run dev
```

The old Vercel handler remains in `api/webhook.js`; Cloudflare deploys only
`src/index.js`.
