# n8n Automated Query Routing Workflows

This directory contains exported n8n workflow definitions matching Section 10 of `Smart Query Routing — Developer Document.md`.

## Workflows:
1. **WF-1: Email In (`wf-1-email-in.json`)**:
   - Polls Gmail inbox every 1 minute.
   - Strips HTML & signatures.
   - Normalizes payload to `NormalizedQuery`.
   - Calls `POST /api/v1/internal/channels/email` with header `X-Service-Key`.
2. **WF-2: WhatsApp In (`wf-2-whatsapp-in.json`)**:
   - Webhook trigger receiving inbound messages from the Baileys gateway.
   - Normalizes to `NormalizedQuery`.
   - Calls `POST /api/v1/internal/channels/whatsapp` with header `X-Service-Key`.
3. **WF-3: SLA 24-Hour Escalation Job (`wf-3-escalation-cron.json`)**:
   - Cron trigger every 10 minutes.
   - Calls `POST /api/v1/internal/jobs/escalate` with header `X-Service-Key`.
   - Keeps free-tier backend warm via `/health`.
4. **WF-4: Notification Retry Job (`wf-4-notification-retry.json`)**:
   - Cron trigger every 5 minutes.
   - Calls `POST /api/v1/internal/jobs/retry-notifications` with header `X-Service-Key`.
