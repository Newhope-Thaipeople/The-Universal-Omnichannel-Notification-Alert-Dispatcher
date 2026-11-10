# The Universal Omnichannel Notification & Alert Dispatcher

> High-reliability, priority-queued multi-channel alert dispatcher for **Telegram**, **Discord**, and **Slack** with rate limiting and exponential backoff retries built with **Node.js (ESM)**.

---

## Architecture Overview

```text
 Business & System Events (Pipelines / Scrapers / Payments / APIs)
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │   In-Memory Priority Queue                             │
 ├────────────────────────────────────────────────────────┤
 │ - Preemptive ordering (CRITICAL > HIGH > NORMAL > INFO)│
 │ - Configurable Rate Limiting (default 500ms between calls)
 │ - Prevents 429 Too Many Requests from external APIs    │
 └───────────────────────────┬────────────────────────────┘
                             │ Dequeued Alert
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │   Multi-Channel Payload Formatter                      │
 ├────────────────────────────────────────────────────────┤
 │ - Discord Embeds (Severity colors, rich key-values)   │
 │ - Slack Block Kit (Header, mrkdwn sections)            │
 │ - Telegram MarkdownV2 (Emoji severity, escaped syntax) │
 └───────────────────────────┬────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
           Discord         Slack        Telegram
           Webhook        Webhook          Bot
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                  Exponential Backoff Retry
                 (On HTTP 429 / 5xx Failures)
```

---

## Key Features

- **Multi-Channel Out of the Box**: Unified alert interface dispatching to Discord Webhooks, Slack Incoming Webhooks, and Telegram Bots simultaneously.
- **Priority Preemption**: Critical outages or high-value purchase events jump to the front of the queue ahead of normal batch alerts.
- **API Rate-Limit Protection**: Enforces staggered intervals between external HTTP dispatches to avoid throttling.
- **Automatic Retries**: Exponential backoff retry handler when target chat services experience transient network degradation.
- **Zero Heavy Dependencies**: Lightweight pure Node.js implementation with 100% native test coverage.

---

## Directory Structure

```text
omnichannel-alert-dispatcher/
├── .env                      # Live credentials (git-ignored)
├── .env.example              # Configuration template
├── .gitignore                # Git ignore rules
├── package.json              # Project manifest & scripts
├── README.md                 # Complete documentation
│
├── src/
│   ├── index.js              # Service runner & demo simulation
│   ├── config.js             # Environment loader
│   ├── channels/
│   │   └── index.js          # Unified adapters for Discord, Slack, Telegram
│   ├── formatters/
│   │   └── index.js          # Platform-specific markdown formatters
│   └── queue/
│       └── index.js          # Priority queue with rate limiting & retries
│
└── test/
    └── dispatcher.test.js    # Native unit test suite
```

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```bash
cp .env.example .env
```
*(By default, runs in safe `DRY_RUN=true` mode if actual webhook URLs are not supplied).*

### 3. Run the Dispatcher Demo
```bash
npm start
```

### 4. Run Unit Tests
```bash
npm test
```
