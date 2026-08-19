const TELEGRAM_API = "https://api.telegram.org";

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("Telegram forwarding bot is running.");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    }

    if (!env.BOT_TOKEN || !env.SOURCE_CHANNEL_ID || !env.TARGET_CHANNEL_ID) {
      console.error("Missing BOT_TOKEN, SOURCE_CHANNEL_ID, or TARGET_CHANNEL_ID");
      return new Response("Worker is not configured", { status: 500 });
    }

    if (
      env.WEBHOOK_SECRET &&
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const message = update.channel_post;
    if (
      !message ||
      String(message.chat?.id) !== String(env.SOURCE_CHANNEL_ID) ||
      message.media_group_id ||
      isForwarded(message)
    ) {
      return new Response("ok");
    }

    try {
      await forwardMessage(env, message.message_id);
      console.log(`Forwarded message ${message.message_id}`);
    } catch (error) {
      console.error(`Failed to forward message ${message.message_id}:`, error);
      return new Response("Telegram API error", { status: 502 });
    }

    return new Response("ok");
  },
};

function isForwarded(message) {
  // forward_origin is used by the current Bot API; forward_date supports older
  // updates and preserves the behavior of the original bot.
  return Boolean(message.forward_origin || message.forward_date);
}

async function forwardMessage(env, messageId) {
  const response = await fetch(`${TELEGRAM_API}/bot${env.BOT_TOKEN}/forwardMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TARGET_CHANNEL_ID,
      from_chat_id: env.SOURCE_CHANNEL_ID,
      message_id: messageId,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.description || `HTTP ${response.status}`);
  }
}
