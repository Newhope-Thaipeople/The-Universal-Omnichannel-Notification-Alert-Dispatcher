import test from 'node:test';
import assert from 'node:assert/strict';
import { formatForDiscord, formatForSlack, formatForTelegram } from '../src/formatters/index.js';
import { AlertQueue } from '../src/queue/index.js';

test('Formatters: Discord embed contains severity color and fields', () => {
  const alert = {
    severity: 'CRITICAL',
    title: 'DB Connection Timeout',
    message: 'Primary pool exhausted',
    metadata: { Host: 'pg-prod-1' },
  };

  const payload = formatForDiscord(alert);
  assert.equal(payload.embeds[0].title, '[CRITICAL] DB Connection Timeout');
  assert.equal(payload.embeds[0].color, 15158332);
  assert.equal(payload.embeds[0].fields[0].name, 'Host');
});

test('Formatters: Slack blocks format valid markdown header and sections', () => {
  const alert = {
    severity: 'HIGH',
    title: 'Storage Threshold Warning',
    message: 'Disk at 92%',
    metadata: { Mount: '/var/data' },
  };

  const payload = formatForSlack(alert);
  assert.equal(payload.blocks[0].text.text, '[HIGH] Storage Threshold Warning');
  assert.match(payload.blocks[2].fields[0].text, /\/var\/data/);
});

test('Formatters: Telegram formats with correct escaping and emojis', () => {
  const alert = {
    severity: 'CRITICAL',
    title: 'API_DOWN',
    message: 'Target host unreachable.',
  };

  const payload = formatForTelegram(alert);
  assert.match(payload.text, /🚨/);
  assert.match(payload.text, /API\\_DOWN/);
  assert.equal(payload.parse_mode, 'MarkdownV2');
});

test('Queue: prioritizes CRITICAL alerts ahead of NORMAL alerts', async () => {
  const queue = new AlertQueue({ rateLimitMs: 10 });

  queue.enqueue({ severity: 'NORMAL', title: 'Task 1', message: 'test', targetChannels: [] });
  queue.enqueue({ severity: 'INFO', title: 'Task 2', message: 'test', targetChannels: [] });
  queue.enqueue({ severity: 'CRITICAL', title: 'Task 3', message: 'test', targetChannels: [] });

  // First item in queue array must be CRITICAL (Priority Rank 1)
  assert.equal(queue.queue[0].severity, 'CRITICAL');
});
