/**
 * Omnichannel Alert Message Formatter
 * Formats payloads to match markdown and structure rules of Discord, Slack, and Telegram
 */

export function formatForDiscord(alert) {
  const colorMap = {
    CRITICAL: 15158332, // Red
    HIGH: 15105570,     // Orange
    NORMAL: 3447003,    // Blue
    INFO: 3066993,      // Green
  };

  return {
    embeds: [
      {
        title: `[${alert.severity}] ${alert.title}`,
        description: alert.message,
        color: colorMap[alert.severity] || 3447003,
        fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
          name: key,
          value: String(value),
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function formatForSlack(alert) {
  return {
    text: `*${alert.title}*`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `[${alert.severity}] ${alert.title}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.message,
        },
      },
      {
        type: 'section',
        fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${value}`,
        })),
      },
    ],
  };
}

export function formatForTelegram(alert) {
  const emojiMap = {
    CRITICAL: '🚨',
    HIGH: '⚠️',
    NORMAL: 'ℹ️',
    INFO: '✅',
  };

  const emoji = emojiMap[alert.severity] || '📢';
  let text = `${emoji} *[${alert.severity}] ${escapeTelegramMarkdown(alert.title)}*\n\n`;
  text += `${escapeTelegramMarkdown(alert.message)}\n`;

  if (alert.metadata && Object.keys(alert.metadata).length > 0) {
    text += `\n*Details:*\n`;
    for (const [key, value] of Object.entries(alert.metadata)) {
      text += `• *${escapeTelegramMarkdown(key)}*: \`${escapeTelegramMarkdown(String(value))}\`\n`;
    }
  }

  return {
    text,
    parse_mode: 'MarkdownV2',
  };
}

function escapeTelegramMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
}
