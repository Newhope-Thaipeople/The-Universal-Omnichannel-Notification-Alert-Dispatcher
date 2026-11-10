import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  queue: {
    dispatchRateLimitMs: Number(process.env.DISPATCH_RATE_LIMIT_MS) || 500,
    maxRetries: Number(process.env.MAX_RETRIES) || 3,
    retryBackoffFactor: Number(process.env.RETRY_BACKOFF_FACTOR) || 2,
    dryRun: process.env.DRY_RUN === 'true' || !process.env.DISCORD_WEBHOOK_URL?.includes('discord.com/api/webhooks/'),
  },
};
