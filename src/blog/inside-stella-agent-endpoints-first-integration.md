---
title: "Inside Stella's agent endpoints: a developer's first integration"
description: "A developer-facing tour of how agents talk to Stella — the moving parts, a first call, and the guardrails that keep automated actions safe."
date: 2026-04-15
author: "The Stella Team"
category: "Product & Engineering"
readTime: "9 min read"
cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=750&fit=crop&q=80"
coverAlt: "A circuit board, representing developer infrastructure"
draft: true
permalink: false
---

> **Draft note (delete before publishing):** Endpoint names, fields, and payloads below are illustrative placeholders. Replace them with the real API contract before publishing, and link to the live API docs.

This one's for the engineers. If you're integrating against Stella — or just want to understand how agentic features work under the hood — here's the shape of it.

## The mental model

Stella is a [commerce backend](/blog/what-a-commerce-backend-actually-does/): it owns the source of truth for inventory, orders, and customers. Agents don't have their own private state. They **read from and act on** that backend through a defined set of endpoints, inside rules you configure. That separation is the whole safety story — an agent can't do anything the API and your guardrails don't permit.

There are three kinds of surface to know:

1. **Read endpoints** — query current state (products, stock, orders, a customer's history).
2. **Action endpoints** — perform a change (place an order, adjust stock, issue a refund), each gated by your rules.
3. **Events / webhooks** — Stella tells *you* when something happened, so your agent can react instead of polling.

## A first call

Authentication is a bearer token scoped to what the integration is allowed to touch. A read looks like this *(illustrative)*:

```bash
curl https://api.stella-commerce.com/v1/products/SKU-1234 \
  -H "Authorization: Bearer $STELLA_API_KEY"
```

```json
{
  "sku": "SKU-1234",
  "title": "Example Product",
  "available": 12,
  "channels": ["web", "whatsapp", "marketplace"]
}
```

The important detail: `available` is one number, true across every channel. An agent deciding whether to confirm an order reads *this*, not a per-channel guess.

## Taking an action (with guardrails)

Actions are where agentic commerce gets real — and where you want brakes. An action call carries the intent; Stella checks it against your configured rules before committing:

```bash
curl -X POST https://api.stella-commerce.com/v1/orders \
  -H "Authorization: Bearer $STELLA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "sku": "SKU-1234", "qty": 1, "channel": "whatsapp", "customer_id": "cus_789" }'
```

If the order violates a rule you've set — say it would push stock below a reserved threshold — Stella rejects it with a clear reason rather than silently overselling. The agent's job is to *propose*; the backend's job is to *enforce*. Keep that boundary and automated actions stay safe.

## React to events, don't poll

For anything time-sensitive, subscribe to events instead of hammering read endpoints:

```json
{
  "event": "stock.low",
  "sku": "SKU-1234",
  "available": 3,
  "threshold": 5
}
```

Your agent receives this and decides what to do — reorder, notify a human, pause a campaign — within the limits you've defined.

## Where to go next

Start read-only. Build confidence querying real state before you ever POST an action. Then introduce one narrow action behind a tight rule, watch it in production, and widen from there. That's the same staged philosophy we apply to [platform migrations](/blog/migrating-to-stella-7-day-playbook/) — small, reversible steps beat big-bang switches.

Full API reference and authentication details live in the developer docs. *(Link the real docs URL here before publishing.)*
