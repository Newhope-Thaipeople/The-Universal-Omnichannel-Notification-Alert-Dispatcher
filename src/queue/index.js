import { channels } from '../channels/index.js';
import { CONFIG } from '../config.js';

export const Priority = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  INFO: 4,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AlertQueue {
  constructor(options = {}) {
    this.queue = [];
    this.isProcessing = false;
    this.rateLimitMs = options.rateLimitMs || CONFIG.queue.dispatchRateLimitMs;
    this.maxRetries = options.maxRetries || CONFIG.queue.maxRetries;
    this.retryBackoffFactor = options.retryBackoffFactor || CONFIG.queue.retryBackoffFactor;
    this.metrics = {
      enqueued: 0,
      dispatched: 0,
      retried: 0,
      failed: 0,
    };
  }

  enqueue(alert) {
    const alertItem = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      severity: alert.severity || 'NORMAL',
      priorityRank: Priority[alert.severity] || 3,
      title: alert.title,
      message: alert.message,
      metadata: alert.metadata || {},
      targetChannels: alert.targetChannels || ['discord', 'slack', 'telegram'],
      attempts: 0,
      enqueuedAt: Date.now(),
    };

    this.queue.push(alertItem);
    this.metrics.enqueued++;

    // Sort queue by priority rank (lower rank number = higher urgency)
    this.queue.sort((a, b) => a.priorityRank - b.priorityRank);

    if (!this.isProcessing) {
      this.processQueue();
    }

    return alertItem.id;
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift();

    for (const channelKey of item.targetChannels) {
      const adapter = channels[channelKey];
      if (!adapter) continue;

      let attempt = 0;
      let sent = false;

      while (attempt <= this.maxRetries && !sent) {
        attempt++;
        item.attempts++;
        try {
          const res = await adapter.send(item);
          sent = true;
          this.metrics.dispatched++;
          if (res.dryRun) {
            console.log(`[DRY-RUN DISPATCH] [${channelKey.toUpperCase()}] [${item.severity}] ${item.title}`);
          } else {
            console.log(`[DISPATCH SUCCESS] [${channelKey.toUpperCase()}] [${item.severity}] ${item.title}`);
          }
        } catch (err) {
          this.metrics.retried++;
          if (attempt > this.maxRetries) {
            this.metrics.failed++;
            console.error(`[DISPATCH FAILED] [${channelKey.toUpperCase()}] ${item.title} after ${this.maxRetries} retries: ${err.message}`);
          } else {
            const backoffWait = this.rateLimitMs * Math.pow(this.retryBackoffFactor, attempt - 1);
            console.warn(`[RETRY] [${channelKey.toUpperCase()}] Attempt ${attempt} failed. Retrying in ${backoffWait}ms...`);
            await sleep(backoffWait);
          }
        }
      }

      await sleep(this.rateLimitMs);
    }

    // Continue draining the queue
    setImmediate(() => this.processQueue());
  }

  async waitUntilEmpty(timeoutMs = 5000) {
    const start = Date.now();
    while (this.queue.length > 0 || this.isProcessing) {
      if (Date.now() - start > timeoutMs) {
        throw new Error('Queue drain timed out');
      }
      await sleep(50);
    }
  }

  getMetrics() {
    return { ...this.metrics, pending: this.queue.length };
  }
}
