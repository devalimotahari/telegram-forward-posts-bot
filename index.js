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

bot.on('channel_post', async (ctx) => {
    const msg = ctx.channelPost;

    console.log('receive message ...', {
        msg
    });

    // Ensure the message is from the source channel
    if (ctx.chat.id !== SOURCE_CHANNEL_ID) return;

    // Skip if it's part of an album (has media_group_id)
    if (msg.hasOwnProperty('media_group_id')) return;

    try {
        await ctx.telegram.forwardMessage(
            TARGET_CHANNEL_ID,
            SOURCE_CHANNEL_ID,
            msg.message_id
        );
        console.log(`Forwarded message ${msg.message_id}`);
    } catch (err) {
        console.error(`Failed to forward message ID: ${msg.message_id}`, err);
    }
});

bot.launch();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
