---
title: "What it takes to let software act on a live store"
description: "Reading data is easy. Letting software take real actions — move stock, apply discounts, place orders — is where the hard engineering lives. Here are the principles that keep it safe."
date: 2026-04-15
author: "The Stella Team"
category: "Product & Engineering"
readTime: "7 min read"
cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=750&fit=crop&q=80"
coverAlt: "Abstract infrastructure representing automated systems"
---

There's a wide gap between software that *shows you* information and software that *does something* on your behalf. Reading is forgiving — get it wrong and you've shown a stale number. Acting is not — get it wrong and you've oversold a product, refunded the wrong customer, or discounted away a margin.

That gap is the entire engineering challenge behind agentic commerce. A store is a live system with real money moving through it, so anything allowed to take action has to be built to a higher standard than a dashboard. These are the principles we hold ourselves to.

## 1. The system of record is the only truth

An action is only as safe as the data it's based on. If "available stock" has three different answers depending on which channel you ask, no amount of clever automation will save you — it'll just make the wrong decision faster.

So before software can act, there has to be **one authoritative source of truth** for stock, orders, and customers. Every action reads from it and writes back to it. Nothing acts on a private, possibly-stale copy. (This is exactly why agentic features belong in the backend, not bolted on top — more on that in [what a commerce backend actually does](/blog/what-a-commerce-backend-actually-does/).)

## 2. Propose, then enforce

The safest design splits responsibility in two:

- The agent's job is to **propose** an action: "apply this discount," "place this order."
- The backend's job is to **enforce** the rules: is there stock to reserve? Is this discount within the allowed limit? Does this need human sign-off first?

The agent never gets to be the final authority. Even a perfectly-reasoned action gets checked against your rules before anything is committed. If it violates one, it's rejected with a clear reason — not silently forced through. The merchant sets the boundaries once; the system holds the line every time.

## 3. Every action is logged and reversible

Two questions have to be answerable at any moment: *what did the software do?* and *can we undo it?*

That means every action writes an entry to an audit trail — what happened, when, on whose behalf, and why. Not for compliance theatre, but because trust depends on being able to look. And wherever possible, actions are designed to be reversible or to require confirmation before they become permanent. "Move fast" is fine for reads; for actions, "be able to walk it back" matters more.

## 4. Permissions are narrow and revocable

Software should be able to do exactly what it's been granted — and nothing else. Permissions are scoped tightly ("can apply discounts up to X," "can view orders but not refund them") and, critically, **revocable instantly**. If something looks off, a merchant can switch capabilities off without taking the whole store down. The default posture is least privilege, not "trusted until proven otherwise."

## 5. Fail loud, fail safe

Things will go wrong — a payment provider times out, a request arrives twice, a rule is ambiguous. The wrong response is to guess and push on. The right one is to **fail safe**: don't oversell, don't double-charge, don't take an irreversible step under uncertainty. Surface the problem to a human with enough context to resolve it, and make sure retrying can't accidentally duplicate an action.

## Why this is the unglamorous half

None of this shows up in a flashy demo. Nobody screenshots an audit log or a permission check. But this is the difference between automation you can leave running overnight and a feature you have to babysit. Letting software act on a live business is a privilege it has to earn — and these principles are how it earns it.

It's the same philosophy we apply everywhere at Stella: give the store a solid backend first, then let it do more on its own, safely, one carefully-bounded step at a time.
