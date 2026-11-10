/**
 * ==============================================================================
 * The Universal Omnichannel Notification & Alert Dispatcher
 * CLI Entrypoint & Demonstration Service
 * ==============================================================================
 */

import { AlertQueue } from './queue/index.js';

async function main() {
  console.log(`\n======================================================`);
  console.log(`[SERVICE START] Omnichannel Notification Dispatcher`);
  console.log(`======================================================`);

  const alertQueue = new AlertQueue({ rateLimitMs: 200 });

  console.log(`[ENQUEUE] Enqueueing sample business & system events...`);

  // 1. Normal business notification
  alertQueue.enqueue({
    severity: 'NORMAL',
    title: 'Daily Data Pipeline Sync Complete',
    message: 'All 8 CSV supplier files processed successfully with zero errors.',
    metadata: {
      Files: 8,
      RowsUpserted: '42,500',
      Duration: '3.4s',
    },
    targetChannels: ['discord', 'slack'],
  });

  // 2. Info tier notification
  alertQueue.enqueue({
    severity: 'INFO',
    title: 'New Lead Generated',
    message: 'Scraper acquired new enterprise prospect from directory.',
    metadata: {
      Company: 'Vanguard Systems Inc.',
      VerifiedEmail: 'exec@vanguard.io',
    },
    targetChannels: ['slack'],
  });

  // 3. Critical alert (will preempt to top of queue)
  alertQueue.enqueue({
    severity: 'CRITICAL',
    title: 'High Ingestion Error Spike Detected',
    message: 'Supplier API returned HTTP 503 Service Unavailable for 5 consecutive retries.',
    metadata: {
      Source: 'InventorySync_Job',
      Impact: 'High',
      Region: 'us-east-1',
    },
    targetChannels: ['discord', 'slack', 'telegram'],
  });

  await alertQueue.waitUntilEmpty(6000);

  const metrics = alertQueue.getMetrics();
  console.log(`\n======================================================`);
  console.log(`               DISPATCH RUN SUMMARY                   `);
  console.log(`======================================================`);
  console.table([
    { Metric: 'Total Alerts Enqueued', Value: metrics.enqueued },
    { Metric: 'Dispatched Across Channels', Value: metrics.dispatched },
    { Metric: 'Retried Deliveries', Value: metrics.retried },
    { Metric: 'Failed Deliveries', Value: metrics.failed },
    { Metric: 'Pending in Queue', Value: metrics.pending },
  ]);
  console.log(`======================================================\n`);
}

main().catch(console.error);
