# MissCall Assistant (React Web Edition)

An enterprise-ready, local-first web application ported from the Android `MissCallAssistant` codebase. It delivers real-time missed call detection workflows, customer CRM directory, automated WhatsApp and SMS follow-ups, dynamic rule routing with anti-spam duplicate protection, and an interactive telephony pipeline simulator.

## Core Features Ported

1. **Dashboard & Action Hub**: Real-time business metrics (Missed calls today, pending follow-ups, messages sent, VIP customers), Recent Missed Calls Hub with 1-tap WhatsApp message triggers.
2. **Missed Call Screening Log**: Search and filter calls by status (`PENDING`, `SENT`, `IGNORED`, `SKIPPED`), view raw duration, SIM slot, and idempotency keys.
3. **Customer CRM Directory**: Complete customer profiles, VIP priority tags, spam blacklist toggles, call counts, and unified chronological activity timelines (calls, WhatsApp messages, SMS, notes).
4. **Follow-Up Suggestions Queue**: Auto-generated message queue with inline template editing, channel selection (WhatsApp / SMS / Email), and one-click dispatch.
5. **WhatsApp Web Workbench**: Interactive WhatsApp interface with QR code pairing modal, session status indicator, conversation thread with delivery receipts (`QUEUED` -> `SENDING` -> `SENT` -> `DELIVERED`), AI prompt generator with tone (Friendly, Professional, Urgent, Concise) and language (English, Hindi, Spanish, Marathi) selectors, and click-to-insert dynamic variable tokens.
6. **Native SMS & Multi-SIM Manager**: Dual-slot carrier management (SIM 1 Airtel vs SIM 2 Jio), SMS character calculator (GSM-7 vs Unicode, segment count, remaining chars), and sent SMS carrier log.
7. **Automation Rules Engine**: Priority-based condition evaluation (`ALL_MISSED`, `FIRST_TIME`, `VIP_ONLY`, `AFTER_HOURS`), multi-channel routing, configurable anti-spam cooldown intervals, and dispatch delay controls.
8. **Message Templates**: Dynamic variable replacement (`{{name}}`, `{{business_name}}`, `{{owner_name}}`, `{{phone}}`, `{{time}}`, `{{date}}`) with live render preview and default template selection.
9. **Telephony & Call Pipeline Simulator**: Interactive Android mobile phone mockup with incoming call screen (Ringing, Answered, Missed, Rejected, and 3x Rapid Consecutive Calls test), quick presets (Unknown, VIP, Blacklisted Spam, International E.164), step-by-step pipeline execution tracer (`CallScreeningService` -> Normalization -> Rule Evaluation -> Dispatch -> Room DB / Webhook Sync), and real-time streaming logs terminal.
10. **Developer Webhooks & CRM Sync**: Configurable endpoint URL, HMAC-SHA256 signature verification, `X-Event-ID` idempotency tracking, test ping trigger, and live JSON payload inspector.
11. **Business Settings**: Business profile, WhatsApp sending modes (Manual Deep Link, WhatsApp Web, Meta Cloud API), working hours schedule, and auto-reply delay controls.
12. **SaaS Paywall & Subscription System**: Razorpay subscription workflow simulation and account profile manager.

## Getting Started

```bash
npm install
npm run dev
```

Built with React 18, Vite, TypeScript, and Tailwind CSS. Runs on port 3000.
