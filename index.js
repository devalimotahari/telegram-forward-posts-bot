require('dotenv').config();
const { Telegraf } = require('telegraf');

// Load from environment
const BOT_TOKEN = process.env.BOT_TOKEN;
const SOURCE_CHANNEL_ID = Number(process.env.SOURCE_CHANNEL_ID);
const TARGET_CHANNEL_ID = Number(process.env.TARGET_CHANNEL_ID);

if (!BOT_TOKEN || !SOURCE_CHANNEL_ID || !TARGET_CHANNEL_ID) {
    throw new Error('Missing BOT_TOKEN, SOURCE_CHANNEL_ID, or TARGET_CHANNEL_ID in .env file');
}

const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async (ctx) => {
    const message = ctx.message;

    // Ensure the message is from the source channel
    if (message.chat.id !== SOURCE_CHANNEL_ID) return;

    // Skip if it's part of an album (has media_group_id)
    if (message.media_group_id) return;

    try {
        await ctx.telegram.forwardMessage(
            TARGET_CHANNEL_ID,
            SOURCE_CHANNEL_ID,
            message.message_id
        );
        console.log(`Forwarded message ID: ${message.message_id}`);
    } catch (err) {
        console.error(`Failed to forward message ID: ${message.message_id}`, err);
    }
});

bot.launch().then(() => {
    console.log('Bot is running...');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
