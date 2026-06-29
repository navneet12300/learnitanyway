---
title: "Choosing Your System's Structure: Monolith vs. Microservices vs. Modular Monolith vs. Serverless"
date: 2026-06-29
description: "The architecture that got you to 100 users will kill you at 100,000. But the one built for 100,000 will slow you down at 100. Here's how to actually decide — with a real example across 3 years of growth."
tags: ["architects-mindset", "software-architecture", "system-design", "learning-in-public"]
---

You need to know about a tree before you learn software architecture.

There's one in Southeast Asia called the Strangler Fig. A bird drops its seed on an existing tree. It grows around it slowly. Takes over. And one day — the old tree is gone. The new one is standing on its own. Nobody cut it down. It just became unnecessary.

That's exactly how companies migrate their software systems. And by the end of this article, you'll see exactly where that pattern lives.

But first — the decision that comes before any of that.

---

## What Is Architecture, Actually?

Not the textbook answer.

Architecture is the decision you make about how your system is shaped — before you write the first line of code. It determines how your code is deployed, how different parts talk to each other, how your team works, and what breaks when things go wrong.

It's not a framework choice. It's not a language choice.

It's the answer to: *how do I structure this thing so it can grow without collapsing?*

Get it wrong early and you spend the next 18 months undoing it instead of building. Get it right and the system almost seems to grow on its own.

The frustrating part — there is no universally correct answer. There is only the right answer for your situation, your team, and your stage.

That's what this article is about.

---

## Four Approaches. One Decision.

When you're deciding how to structure a system, four main approaches exist:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Monolith         →  Everything in one place       │
│   Microservices    →  Everything in separate pieces │
│   Modular Monolith →  One place, but with hard walls│
│   Serverless       →  No "place" at all             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Each one is a valid answer to a specific set of circumstances.
None of them is always right.
All of them have been used to build products you use every day.

Let's go through each one — what it is, when it makes sense, when it doesn't, and the real question you should ask yourself before choosing it.

---

## The Monolith

### What it is

One codebase. One deployable. One running process.

Everything your app does — auth, orders, payments, notifications, analytics — lives together and ships together. When you deploy, all of it goes out at once.

This is how almost every product starts. And that's not a bad thing.

Throughout this article, we'll follow one example to make all of this concrete — **HungerDose**, a food ordering SaaS for independent restaurants. Restaurants sign up, customers order online, the kitchen gets tickets, the owner sees analytics. Two founders. One developer. Every architectural decision we discuss, we'll see it play out here first.

Here's what HungerDose looked like on Day 1:

```
[ HungerDose — app.js ]
  ├── auth
  ├── restaurants
  ├── menu
  ├── orders
  ├── payments
  ├── notifications
  └── analytics
        │
        ▼
  [ PostgreSQL — one database ]
        │
        ▼
  [ 1 server — $25/mo ]
```

Two founders. One developer. 50 restaurants onboarded in 3 months. Shipping fast, debugging easily, spending nothing on infrastructure.

**This is correct. Don't let anyone make you feel guilty about it.**

### When to use it

- You're pre-product-market fit
- Your team is under 5–6 people
- You don't fully know your domain yet
- You need to move fast and learn

### When NOT to use it

- Different parts of your system have wildly different scaling needs *right now*
- Your team is large enough that people are constantly breaking each other's work
- A single bug in one area takes down everything and that's genuinely costing you

> **Decision Point:** *Do I actually know where my domain boundaries are?*
>
> Domain boundaries means — where does one part of your system end and another begin?
>
> In HungerDose it sounds obvious on paper: Orders, Payments, Restaurants, Notifications. But when you're actually building, questions blur fast. Who owns the order total — Orders or Payments? When an order is placed, who sends the confirmation email? When a restaurant updates their menu, does that affect active orders?
>
> These don't have obvious answers until you've built the thing and felt the pain. If you jump to microservices before knowing the answers, you carve the system at the wrong seams. Wrong boundaries baked into separate deployments, separate databases, separate teams — undoing that takes months.
>
> **The monolith gives you time to discover the right boundaries by actually building.**

### The real consequence of getting this wrong

You skip the monolith, jump straight to microservices on Day 1, spend 3 months building infrastructure, and ship zero features. I've seen this happen. The product dies before the architecture gets to prove itself.

---

## Microservices

### What it is

Each domain — orders, payments, restaurants, notifications — becomes its own separate codebase, its own deployment, its own running process. They talk to each other over the network.

```
                    [ API Gateway ]
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   [ Orders API ]  [ Payments API ]  [ Restaurant API ]
        │                │                 │
        ▼                ▼                 ▼
  [ Postgres ]    [ Postgres ]       [ Postgres ]
  (orders only)  (payments only)   (restaurants only)
```

Each service is independent. The payments team can deploy without waiting for the orders team. If the notifications service crashes, orders still work.

This sounds like the obvious goal. It's not.

### When to use it

- Your team is 10+ engineers and deployments are genuinely blocking each other
- Different services have *provably* different scaling needs right now, not theoretically
- You need compliance isolation — payments in a PCI-scoped service, for example
- You've already built the monolith and you know where the real seams are

### When NOT to use it

- You're under 10 engineers
- You haven't built this product before and don't know where the boundaries are
- Your team doesn't have strong DevOps capability yet

> **Decision Point:** *Did we just lose real money because one service took everything down? And do we have the team to manage distributed systems?*
>
> Both need to be true. One isn't enough.
>
> For HungerDose, this moment came at 800 restaurants and 15 engineers. The payments module crashed. The entire app went down. They lost ₹40 lakhs in orders in 22 minutes. That's when microservices became a real conversation — not before.

### The real consequence of getting this wrong

You've traded one hard problem for six harder ones: network latency, distributed transactions, service discovery, cascading failures, observability across services, and on-call rotations that need to know which of 12 services caused the issue at 2am.

Teams that jump here too early spend 40–60% of engineering time on infrastructure, not features.

---

## The Strangler Fig Pattern

Remember the tree?

This is where it lives.

When HungerDose decided to move toward microservices, they didn't shut everything down and rewrite. That would have taken 12 months and broken everything for users in the process.

Instead, they put an API Gateway in front of the monolith.

```
STEP 1 — Everything still goes to the monolith

[ All traffic ]
      │
      ▼
[ API Gateway ]   ← new layer added
      │
      ▼
[ Monolith ]      ← still handling everything
```

Then they extracted one piece — payments, because that was the isolated compliance requirement.

```
STEP 2 — Payments moves out

[ API Gateway ]
  ├── /api/payments     → [ Payments Service ]  ← extracted
  └── everything else  → [ Monolith ]
```

Then orders. Then restaurants. One piece at a time.

```
STEP 3 — More pieces move

[ API Gateway ]
  ├── /api/payments     → [ Payments Service ]
  ├── /api/orders       → [ Orders Service ]
  └── everything else  → [ Monolith, shrinking ]
```

The monolith kept running through all of this. Users noticed nothing. Engineers worked on one extraction at a time without freezing feature development.

Eventually the monolith handled nothing. The new system was already standing.

**The old tree rotted away. The fig was already there.**

This is why you learn about the tree before you learn about architecture.

The Strangler Fig Pattern is not a system structure — it's a migration strategy. It's how you get from one structure to another without blowing everything up.

The rules are simple:

```
1. Put a proxy/gateway in front of everything first
2. Extract one domain at a time
3. Redirect traffic for that domain to the new service
4. Keep the old system running until it handles nothing
5. Delete it
```

You can stop at any step. If extraction gets too painful, the old system still runs. Risk is spread across many small steps instead of one enormous launch.

---

## Modular Monolith

Here's the one most teams skip — and shouldn't.

### What it is

One codebase. One deployment. But the code is organized into strict, enforced modules with defined boundaries.

Modules can only talk to each other through their public interface. No reaching into another module's internals. Same server. No network calls.

Here's what HungerDose should have built before jumping to microservices:

```
[ HungerDose App — one deployment ]
┌─────────────────────────────────────────┐
│  /modules                               │
│   ├── auth/         ← Team A owns      │
│   │    └── index.js (public API only)  │
│   ├── orders/       ← Team B owns      │
│   │    └── index.js (public API only)  │
│   ├── payments/     ← Team B owns      │
│   │    └── index.js (public API only)  │
│   └── notifications/← Team A owns      │
│        └── index.js (public API only)  │
└─────────────────────────────────────────┘
              │
              ▼
      [ PostgreSQL — schema per module ]
```

Modules talk through function calls, not HTTP. No network. No latency. No distributed systems complexity. But real ownership, real boundaries, real team separation.

When payments wants order data, it calls `getOrder()` from `orders/index.js`. It never touches `orders/order-repo.js` directly. That's the wall.

### Why this matters more than you think

The modular monolith is what bridges the monolith and microservices.

When you eventually need to extract a module into its own service, you already know exactly what the public API is. The `index.js` becomes your HTTP API surface. The migration takes days, not months.

You've been doing the hard architectural thinking all along — just without the operational cost.

### When to use it

- Your team is growing (5–15 engineers) and you need code ownership without distributed systems pain
- You suspect you'll need microservices someday but don't need them today
- You want to enforce boundaries but aren't ready to pay the infrastructure cost

### When NOT to use it

- You genuinely need independent deployability right now
- You're 3 engineers and nobody is stepping on each other

> **Decision Point:** *Do we have a team collision problem or a scaling problem?*
>
> Team collision — people breaking each other's code, unclear ownership, deployment coordination pain — that's a modular monolith problem. Solve it with module walls.
>
> Scaling — one service needs 10x the resources of another, failure in one area is taking everything down — that's a microservices problem. Solve it by extracting.
>
> **Most teams think they have a scaling problem. They actually have a team collision problem.**

---

## Serverless

### What it is

You write functions, not servers. The platform — AWS Lambda, Vercel Functions, Cloudflare Workers — handles everything else. Provisioning, scaling, availability.

You pay per invocation. When nothing runs, you pay nothing.

```
Something happens (file uploaded, payment received, 2am arrives)
      │
      ▼
[ Lambda Function spins up ]
  → does one specific thing
  → finishes
  → dies
  → you pay for exactly that duration
```

### The mental model

Serverless is not a replacement for your app server. It's for work that happens *because something occurred* — not for work that's always waiting for something to occur.

```
Always running, waiting for requests  →  App server
Runs because something happened       →  Lambda / serverless
```

For HungerDose, these moved to Lambda:

```
✓ Send order confirmation email     → triggered by order placed
✓ Resize restaurant banner image    → triggered by image upload
✓ Generate monthly PDF reports      → triggered at 2am nightly
✓ Sync orders to accounting tool    → triggered on schedule

✗ Handle incoming API requests      → stays on server
✗ WebSocket for live kitchen display→ stays on server
```

### When to use it

- Scheduled heavy scripts that run occasionally (nightly reports, weekly digests)
- Event-triggered background work (file processing, webhook handlers)
- Anything that runs *because something happened* and then stops

### When NOT to use it

- Always-on REST APIs — cold starts hurt latency
- WebSockets or real-time connections — serverless is stateless
- Jobs longer than 15 minutes — Lambda has a hard limit
- High-throughput sustained traffic — gets expensive fast vs a server

> **Decision Point:** *Does this run because something happened, or does it need to always be ready?*
>
> If the answer is "because something happened" — Lambda.
>
> If the answer is "always ready" — server.

---

## The Full Picture

Here's how HungerDose's architecture evolved across 3 years:

```
DAY 1
  Monolith
  → ship fast, learn the domain, validate the product

  Pain: team of 8 stepping on each other's code
  ↓
MONTH 18
  Modular Monolith
  → hard module walls, team ownership, same deployment
  + Lambda for background jobs (reports, emails, cleanup)

  Pain: payments crash took everything down, ₹40L lost in one night
  ↓
YEAR 2
  Selective Microservices (Strangler Fig migration)
  → extract payments first (compliance), then orders, then kitchen display
  → monolith shrinks piece by piece, users notice nothing
  + Fargate for long-running batch jobs (>15 min, Lambda can't handle)

  Pain: 12 services, no way to orchestrate or rebalance across servers
  ↓
YEAR 3
  ECS / Kubernetes
  → container orchestration across the fleet
  → each service scales independently
```

Every transition was pulled by **real pain**. Not by ambition. Not by what looked impressive on a resume.

---

## The One Question That Matters

Before you decide on any structure, ask yourself this:

> *Am I solving a problem I actually have, or one I'm imagining?*

The monolith works until it doesn't.
The modular monolith is cheaper than microservices and more disciplined than a monolith.
Microservices solve real problems at real scale — but introduce six new ones.
Serverless handles the right jobs brilliantly and the wrong jobs terribly.

There is no trophy for using the most advanced architecture.
There is only: does this help me ship, scale, and survive?

Start simple. Add complexity only when the pain of staying simple exceeds the pain of changing.

That's it. That's the whole decision.

---

*This is part of [The Architect's Mindset](/roadmap) series — working through the decisions behind modern software systems, one topic at a time.*

*Next up: Organising Your Codebase — Monorepo vs. Polyrepo.*

*[← Back to all articles](/articles)*
