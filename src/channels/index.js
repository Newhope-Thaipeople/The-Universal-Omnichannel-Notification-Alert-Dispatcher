import { CONFIG } from '../config.js';
import { formatForDiscord, formatForSlack, formatForTelegram } from '../formatters/index.js';

/**
 * Channel Adapters: Abstract external API transport
 */

export const channels = {
  discord: {
    name: 'Discord',
    async send(alert) {
      if (CONFIG.queue.dryRun || !CONFIG.discord.webhookUrl || CONFIG.discord.webhookUrl.includes('mock/test')) {
        return { success: true, dryRun: true, channel: 'discord' };
      }

      const payload = formatForDiscord(alert);
      const res = await fetch(CONFIG.discord.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Discord Webhook HTTP ${res.status}: ${await res.text()}`);
      }
      return { success: true, dryRun: false, channel: 'discord' };
    },
  },

  slack: {
    name: 'Slack',
    async send(alert) {
      if (CONFIG.queue.dryRun || !CONFIG.slack.webhookUrl || CONFIG.slack.webhookUrl.includes('mock/test')) {
        return { success: true, dryRun: true, channel: 'slack' };
      }

      const payload = formatForSlack(alert);
      const res = await fetch(CONFIG.slack.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Slack Webhook HTTP ${res.status}: ${await res.text()}`);
      }
      return { success: true, dryRun: false, channel: 'slack' };
    },
  },

  telegram: {
    name: 'Telegram',
    async send(alert) {
      if (CONFIG.queue.dryRun || !CONFIG.telegram.botToken || CONFIG.telegram.botToken.includes('mock_bot')) {
        return { success: true, dryRun: true, channel: 'telegram' };
      }

      const formatted = formatForTelegram(alert);
      const url = `https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CONFIG.telegram.chatId,
          text: formatted.text,
          parse_mode: formatted.parse_mode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Telegram API HTTP ${res.status}: ${await res.text()}`);
      }
      return { success: true, dryRun: false, channel: 'telegram' };
    },
  },
};
