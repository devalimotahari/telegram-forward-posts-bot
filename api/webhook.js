require('dotenv').config();
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const SOURCE_CHANNEL_ID = parseInt(process.env.SOURCE_CHANNEL_ID, 10);
const TARGET_CHANNEL_ID = parseInt(process.env.TARGET_CHANNEL_ID, 10);

// Forward channel posts
bot.on("channel_post", async (ctx) => {
    const msg = ctx.update.channel_post;

    if (ctx.chat.id !== SOURCE_CHANNEL_ID) return;

    // Skip media groups (albums)
    if (msg.media_group_id) return;

    try {
        await ctx.telegram.forwardMessage(
            TARGET_CHANNEL_ID,
            SOURCE_CHANNEL_ID,
            msg.message_id
        );
        console.log(`Forwarded message ${msg.message_id}`);
    } catch (e) {
        console.error(`Failed to forward message ${msg.message_id}: ${e}`);
    }
});

// Export webhook handler for Vercel
export default async function handler(req, res) {
    try {
        await bot.handleUpdate(req.body);
    } catch (err) {
        console.error("Webhook error:", err);
    }
    res.status(200).send("ok");
}
