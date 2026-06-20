# Learn It Anyway — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the "Learn It Anyway" personal blog — a dark-themed Astro site with Articles, Side Quests, Roadmap, About, and RSS pages.

**Architecture:** Static site built with Astro 5, styled with Tailwind CSS v3, content managed via Markdown files in Astro Content Collections (glob loader), auto-deployed to Vercel on git push.

**Tech Stack:** Astro 5 · Tailwind CSS v3 · @tailwindcss/typography · @astrojs/rss · Vercel

---

## File Map

| File | Role |
|---|---|
| `astro.config.mjs` | Astro config — site URL, integrations |
| `tailwind.config.mjs` | Tailwind config — custom colors, typography plugin |
| `src/content/config.ts` | Content Collections schema for articles + side-quests |
| `src/content/articles/*.md` | Engineering posts |
| `src/content/side-quests/*.md` | Books, life, ideas posts |
| `src/layouts/Layout.astro` | Shared shell — nav, footer, `<head>` meta |
| `src/components/PostList.astro` | Reusable post list (homepage + list pages) |
| `src/components/NoteBlock.astro` | Philosophy note block with amber left border |
| `src/pages/index.astro` | Homepage — hero, note block, latest articles |
| `src/pages/articles/index.astro` | All articles list |
| `src/pages/articles/[slug].astro` | Individual article page |
| `src/pages/side-quests/index.astro` | All side quests list |
| `src/pages/side-quests/[slug].astro` | Individual side quest page |
| `src/pages/roadmap.astro` | Static learning roadmap |
| `src/pages/about.astro` | Manifesto / about page |
| `src/pages/rss.xml.js` | RSS 2.0 feed (articles + side quests) |

---

## Task 1: Scaffold Astro project & install dependencies

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `.gitignore`
- Create: `src/styles/global.css`

- [ ] **Step 1: Scaffold the project**

Run in `C:\Users\UDAAN\Documents\blogs`:
```powershell
npm create astro@latest . -- --template minimal --typescript strict --no-git --no-install --yes
```
Expected: Astro project files created (astro.config.mjs, package.json, tsconfig.json, src/env.d.ts, src/pages/index.astro).

- [ ] **Step 2: Install dependencies**

```powershell
npm install
npm install @astrojs/tailwind tailwindcss @tailwindcss/typography @astrojs/rss
```
Expected: node_modules created, no errors.

- [ ] **Step 3: Add Tailwind integration to `astro.config.mjs`**

Replace the entire file with:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://learn-it-anyway.vercel.app',
  integrations: [tailwind()],
});
```

- [ ] **Step 4: Configure `tailwind.config.mjs`**

Create the file:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

- [ ] **Step 5: Create `src/styles/global.css`**

`@astrojs/tailwind` injects the `@tailwind` directives automatically — do NOT add them here. This file is only for custom base overrides:

```css
html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.vercel/
.superpowers/
```

- [ ] **Step 7: Verify build passes**

```powershell
npx astro build
```
Expected: `dist/` created, output ends with "✓ Completed".

- [ ] **Step 8: Initialize git and commit**

```powershell
git init
git add astro.config.mjs tailwind.config.mjs package.json package-lock.json tsconfig.json src/ .gitignore
git commit -m "chore: scaffold Astro project with Tailwind"
```

---

## Task 2: Content Collections schema + sample posts

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/articles/2026-06-20-what-a-database-actually-is.md`
- Create: `src/content/side-quests/2026-06-20-notes-on-atomic-habits.md`

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

const sideQuests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/side-quests' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  articles,
  'side-quests': sideQuests,
};
```

- [ ] **Step 2: Create sample article**

Create `src/content/articles/2026-06-20-what-a-database-actually-is.md`:
```markdown
---
title: "What a database actually is"
date: 2026-06-20
description: "Past the SQL prompt, a database is a story about durability, ordering, and trust. A first pass at the mental model I wish I'd had earlier."
tags: ["databases", "systems"]
---

Most people's mental model of a database looks like this: you send it data, it stores the data, you ask for the data back.

That's not wrong. But it's incomplete in ways that matter.

## The three jobs of a database

A database does three things that are easy to take for granted:

1. **Durability** — when it says "committed", it means it. Power failure, crash, kernel panic — the data survives.
2. **Ordering** — concurrent writes don't corrupt each other. Transactions happen in some consistent sequence even when they arrive simultaneously.
3. **Queryability** — you can retrieve data efficiently, not just by scanning every row.

Everything else — replication, partitioning, indexing, MVCC — is a solution to one of these three problems at scale.

## Why this matters

When you understand that a database is fundamentally solving durability + ordering + queryability, you stop treating it as a black box and start asking better questions.

"Why is this query slow?" becomes: which of the three jobs is bottlenecking?

"Should I use Postgres or MongoDB?" becomes: what trade-offs am I making on ordering and queryability?

"What does 'eventually consistent' mean?" becomes: which of the three jobs are you relaxing, and why?

The SQL prompt is just the interface. Understanding is underneath it.
```

- [ ] **Step 3: Create sample side quest**

Create `src/content/side-quests/2026-06-20-notes-on-atomic-habits.md`:
```markdown
---
title: "Notes on Atomic Habits"
date: 2026-06-20
description: "James Clear's core argument is that systems beat goals. A few ideas worth carrying."
tags: ["books", "mental-models"]
---

James Clear's central argument: you don't rise to the level of your goals, you fall to the level of your systems.

## What stuck

**Identity before outcomes.** Don't aim to write a blog post — aim to be someone who writes. The habit becomes an expression of identity, not a chore.

**The 1% rule compounds.** 1% better every day is 37x better by year end. 1% worse is nearly zero. Small inputs, asymmetric outputs.

**Make it obvious, attractive, easy, satisfying.** The four laws of behaviour change. When a habit fails, it usually fails on one of these. Diagnose which one.

## A note on the meta

There's irony in reading a book about building habits and not building any. The book is most useful as a diagnostic tool — not read-once-and-done, but returned to when a habit is stalling.

The question to ask isn't "is this a good habit?". It's: "which of the four laws is broken for me, specifically, right now?"
```

- [ ] **Step 4: Verify schema validation**

```powershell
npx astro build
```
Expected: Build succeeds, collections validated. No "Missing required field" errors.

- [ ] **Step 5: Commit**

```powershell
git add src/content/
git commit -m "feat: add content collections schema and sample posts"
```

---

## Task 3: Layout component (nav + footer)

**Files:**
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (temporary wrapper to test Layout)

- [ ] **Step 1: Create `src/layouts/Layout.astro`**

```astro
---
interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = "A curious engineer's notebook on the internet.",
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />
    <link rel="alternate" type="application/rss+xml" title="Learn It Anyway" href="/rss.xml" />
    <title>{title === 'Home' ? 'Learn It Anyway' : `${title} | Learn It Anyway`}</title>
    <style>html { scroll-behavior: smooth; }</style>
  </head>
  <body class="bg-[#0f0f0f] text-slate-400 font-sans">
    <nav class="border-b border-white/[0.06] px-6 py-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <a
          href="/"
          class="flex items-center gap-2 text-white text-[11px] tracking-[0.15em] uppercase font-semibold hover:text-amber-500 transition-colors"
        >
          <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
          Learn It Anyway
        </a>
        <div class="flex items-center gap-5">
          <a href="/articles" class="text-[11px] text-slate-500 hover:text-white transition-colors tracking-wide">Articles</a>
          <a href="/side-quests" class="text-[11px] text-slate-500 hover:text-white transition-colors tracking-wide">Side Quests</a>
          <a href="/roadmap" class="text-[11px] text-slate-500 hover:text-white transition-colors tracking-wide">Roadmap</a>
          <a href="/about" class="text-[11px] text-slate-500 hover:text-white transition-colors tracking-wide">About</a>
          <a href="/rss.xml" class="text-[11px] text-slate-500 hover:text-white transition-colors tracking-wide">RSS</a>
        </div>
      </div>
    </nav>

    <main class="max-w-3xl mx-auto px-6 py-16">
      <slot />
    </main>

    <footer class="border-t border-white/[0.06] px-6 py-8 mt-8">
      <div class="max-w-3xl mx-auto flex items-center justify-between text-[11px] text-slate-600">
        <span>© {new Date().getFullYear()} Navneet Mahajan</span>
        <a href="/rss.xml" class="hover:text-slate-400 transition-colors">RSS Feed</a>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Replace `src/pages/index.astro` with a minimal test page**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Home">
  <p class="text-white">Layout test — nav and footer should appear.</p>
</Layout>
```

- [ ] **Step 3: Start dev server and verify nav renders**

```powershell
npx astro dev
```
Open `http://localhost:4321`. Verify:
- Nav shows amber dot + "LEARN IT ANYWAY" on left
- Nav links on right: Articles, Side Quests, Roadmap, About, RSS
- Footer shows copyright + RSS link
- Background is near-black (`#0f0f0f`)

Stop server with Ctrl+C.

- [ ] **Step 4: Commit**

```powershell
git add src/layouts/ src/pages/index.astro
git commit -m "feat: add Layout component with nav and footer"
```

---

## Task 4: Reusable components (PostList + NoteBlock)

**Files:**
- Create: `src/components/PostList.astro`
- Create: `src/components/NoteBlock.astro`

- [ ] **Step 1: Create `src/components/PostList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'articles'>[] | CollectionEntry<'side-quests'>[];
}

const { posts } = Astro.props;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function postUrl(post: CollectionEntry<'articles'> | CollectionEntry<'side-quests'>): string {
  return `/${post.collection}/${post.id}`;
}
---

<ul class="divide-y divide-white/[0.06]">
  {
    posts.map((post) => (
      <li class="py-6">
        <div class="flex items-baseline justify-between gap-4 mb-1.5">
          <a
            href={postUrl(post)}
            class="text-white font-semibold text-[15px] leading-snug hover:text-amber-500 transition-colors"
          >
            {post.data.title}
          </a>
          <span class="text-xs text-slate-600 whitespace-nowrap shrink-0">
            {formatDate(post.data.date)}
          </span>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">{post.data.description}</p>
        {post.data.tags.length > 0 && (
          <div class="flex flex-wrap gap-3 mt-2">
            {post.data.tags.map((tag: string) => (
              <span class="text-[11px] text-amber-600 tracking-wide">{tag}</span>
            ))}
          </div>
        )}
      </li>
    ))
  }
</ul>
```

- [ ] **Step 2: Create `src/components/NoteBlock.astro`**

```astro
---
interface Props {
  label?: string;
}

const { label = 'A NOTE · LEARNING IN PUBLIC' } = Astro.props;
---

<div class="border-l-2 border-amber-500 bg-white/[0.02] px-6 py-5 my-12">
  <p class="text-[10px] tracking-[0.2em] uppercase text-slate-600 mb-4">{label}</p>
  <slot />
</div>
```

- [ ] **Step 3: Verify no build errors**

```powershell
npx astro build
```
Expected: Build succeeds. Components are not used in pages yet, but no syntax errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/
git commit -m "feat: add PostList and NoteBlock components"
```

---

## Task 5: Homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `src/pages/index.astro` with the full homepage**

```astro
---
import Layout from '../layouts/Layout.astro';
import PostList from '../components/PostList.astro';
import NoteBlock from '../components/NoteBlock.astro';
import { getCollection } from 'astro:content';

const allArticles = await getCollection('articles');
const latest = allArticles
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 5);
---

<Layout title="Home" description="A curious engineer's notebook on the internet. Systems, architecture, databases, AI — and the ideas worth understanding before you need them.">

  <!-- Hero -->
  <section class="py-12 border-b border-white/[0.06]">
    <div class="inline-flex items-center gap-2 text-[10px] text-amber-500 border border-amber-500/30 px-3 py-1.5 mb-8 tracking-[0.2em] uppercase">
      <span>●</span>
      Curiosity Compounds
    </div>

    <h1 class="text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
      Learn before you <span class="text-amber-500">need</span> it.
    </h1>

    <p class="text-slate-400 text-lg leading-relaxed mb-6 max-w-lg">
      Understanding compounds over time. Most people learn when circumstances force them to.
      This is a different approach.
    </p>

    <p class="text-slate-500 text-sm leading-loose mb-10 max-w-lg">
      I'm <strong class="text-slate-300 font-medium">Navneet</strong> — a curious engineer documenting
      what I'm learning in public. Systems, architecture, databases, AI — and occasionally books and life.
      No guru. No authority. Just curiosity, honest notes, and the internet.
    </p>

    <div class="flex items-center gap-6">
      <a
        href="/articles"
        class="text-[11px] tracking-[0.15em] uppercase border border-white text-white px-5 py-2.5 hover:bg-white hover:text-black transition-colors"
      >
        Read Articles →
      </a>
      <a
        href="/about"
        class="text-[11px] tracking-[0.15em] uppercase text-slate-500 hover:text-white transition-colors"
      >
        About
      </a>
    </div>
  </section>

  <!-- Philosophy Note -->
  <NoteBlock>
    <div class="text-slate-400 text-sm leading-loose">
      <p class="font-medium text-slate-200 mb-2">I'm not an authority.</p>
      <p>If you know something I don't — challenge my thinking.</p>
      <p>If I'm wrong — correct me.</p>
      <p>And if you're curious too — learn with me.</p>
    </div>
  </NoteBlock>

  <!-- Latest Articles -->
  <section>
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-white font-bold text-xl">Latest articles</h2>
      <a
        href="/articles"
        class="text-[11px] tracking-[0.15em] uppercase text-slate-500 hover:text-white transition-colors"
      >
        All Articles →
      </a>
    </div>
    <PostList posts={latest} />
  </section>

</Layout>
```

- [ ] **Step 2: Start dev server and verify homepage**

```powershell
npx astro dev
```
Open `http://localhost:4321`. Verify:
- Amber badge "● CURIOSITY COMPOUNDS" appears
- Headline "Learn before you need it." with "need" in amber
- Bio text visible
- Two CTAs: bordered "READ ARTICLES →" button + text "ABOUT"
- Note block with amber left border below hero
- "Latest articles" section shows the sample article
- Dates render correctly (e.g., "Jun 20, 2026")

Stop server with Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/index.astro
git commit -m "feat: build homepage with hero, note block, and latest articles"
```

---

## Task 6: Articles pages (list + detail)

**Files:**
- Create: `src/pages/articles/index.astro`
- Create: `src/pages/articles/[slug].astro`

- [ ] **Step 1: Create `src/pages/articles/index.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';

const articles = await getCollection('articles');
const sorted = articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<Layout
  title="Articles"
  description="Engineering deep dives on systems, architecture, databases, DevOps, and AI."
>
  <header class="mb-12 pb-8 border-b border-white/[0.06]">
    <h1 class="text-3xl font-extrabold text-white mb-3">Articles</h1>
    <p class="text-slate-500 text-sm">
      Engineering deep dives — systems, architecture, databases, DevOps, AI.
    </p>
  </header>
  <PostList posts={sorted} />
</Layout>
```

- [ ] **Step 2: Create `src/pages/articles/[slug].astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map((article) => ({
    params: { slug: article.id },
    props: { article },
  }));
}

interface Props {
  article: CollectionEntry<'articles'>;
}

const { article } = Astro.props;
const { Content } = await render(article);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
---

<Layout title={article.data.title} description={article.data.description}>
  <article>
    <header class="mb-12 pb-8 border-b border-white/[0.06]">
      {
        article.data.tags.length > 0 && (
          <div class="flex flex-wrap gap-3 mb-4">
            {article.data.tags.map((tag: string) => (
              <span class="text-[11px] text-amber-600 tracking-wide uppercase">{tag}</span>
            ))}
          </div>
        )
      }
      <h1 class="text-4xl font-extrabold text-white leading-tight mb-4">
        {article.data.title}
      </h1>
      <p class="text-slate-600 text-sm">{formatDate(article.data.date)}</p>
      <div class="h-0.5 w-10 bg-amber-500 mt-6"></div>
    </header>

    <div
      class="prose prose-invert prose-slate max-w-none
        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
        prose-p:text-slate-400 prose-p:leading-loose
        prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
        prose-code:text-amber-400 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-white/[0.05] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-none
        prose-strong:text-slate-200
        prose-blockquote:border-l-amber-500 prose-blockquote:text-slate-400 prose-blockquote:not-italic
        prose-hr:border-white/10
        prose-li:text-slate-400"
    >
      <Content />
    </div>

    <footer class="mt-16 pt-8 border-t border-white/[0.06]">
      <a href="/articles" class="text-[11px] tracking-[0.15em] uppercase text-slate-500 hover:text-white transition-colors">
        ← All Articles
      </a>
    </footer>
  </article>
</Layout>
```

- [ ] **Step 3: Start dev server and verify articles**

```powershell
npx astro dev
```
Verify:
- `http://localhost:4321/articles` — list page shows the sample article with title, date, description, tags
- Click the article title → navigates to detail page
- Detail page shows: tags, large title, amber accent line, markdown content rendered with correct typography
- "← All Articles" link in footer

Stop server with Ctrl+C.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/articles/
git commit -m "feat: add articles list and detail pages"
```

---

## Task 7: Side Quests pages (list + detail)

**Files:**
- Create: `src/pages/side-quests/index.astro`
- Create: `src/pages/side-quests/[slug].astro`

- [ ] **Step 1: Create `src/pages/side-quests/index.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('side-quests');
const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<Layout
  title="Side Quests"
  description="Books, life lessons, mental models, and ideas worth thinking about."
>
  <header class="mb-4 pb-8 border-b border-white/[0.06]">
    <h1 class="text-3xl font-extrabold text-white mb-3">Side Quests</h1>
    <p class="text-slate-500 text-sm italic">
      "Books and life are side quests, not separate identities."
    </p>
  </header>
  <div class="mt-8">
    <PostList posts={sorted} />
  </div>
</Layout>
```

- [ ] **Step 2: Create `src/pages/side-quests/[slug].astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('side-quests');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

interface Props {
  post: CollectionEntry<'side-quests'>;
}

const { post } = Astro.props;
const { Content } = await render(post);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
---

<Layout title={post.data.title} description={post.data.description}>
  <article>
    <header class="mb-12 pb-8 border-b border-white/[0.06]">
      {
        post.data.tags.length > 0 && (
          <div class="flex flex-wrap gap-3 mb-4">
            {post.data.tags.map((tag: string) => (
              <span class="text-[11px] text-amber-600 tracking-wide uppercase">{tag}</span>
            ))}
          </div>
        )
      }
      <h1 class="text-4xl font-extrabold text-white leading-tight mb-4">
        {post.data.title}
      </h1>
      <p class="text-slate-600 text-sm">{formatDate(post.data.date)}</p>
      <div class="h-0.5 w-10 bg-amber-500 mt-6"></div>
    </header>

    <div
      class="prose prose-invert prose-slate max-w-none
        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
        prose-p:text-slate-400 prose-p:leading-loose
        prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
        prose-code:text-amber-400 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-white/[0.05] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-none
        prose-strong:text-slate-200
        prose-blockquote:border-l-amber-500 prose-blockquote:text-slate-400 prose-blockquote:not-italic
        prose-hr:border-white/10
        prose-li:text-slate-400"
    >
      <Content />
    </div>

    <footer class="mt-16 pt-8 border-t border-white/[0.06]">
      <a href="/side-quests" class="text-[11px] tracking-[0.15em] uppercase text-slate-500 hover:text-white transition-colors">
        ← Side Quests
      </a>
    </footer>
  </article>
</Layout>
```

- [ ] **Step 3: Verify side quests pages**

```powershell
npx astro dev
```
Verify:
- `http://localhost:4321/side-quests` — shows the Atomic Habits sample post
- Click it → detail page renders with correct typography
- "← Side Quests" back link works

Stop server with Ctrl+C.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/side-quests/
git commit -m "feat: add side quests list and detail pages"
```

---

## Task 8: Roadmap page

**Files:**
- Create: `src/pages/roadmap.astro`

- [ ] **Step 1: Create `src/pages/roadmap.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';

const topics = [
  {
    theme: 'Systems & Architecture',
    items: [
      { title: 'B-trees and storage engines', status: 'writing' },
      { title: 'How consensus algorithms work (Raft, Paxos)', status: 'planned' },
      { title: 'Event sourcing in practice', status: 'planned' },
      { title: 'The anatomy of a distributed system', status: 'planned' },
    ],
  },
  {
    theme: 'Databases',
    items: [
      { title: 'LSM trees vs B-trees — when each wins', status: 'exploring' },
      { title: 'PostgreSQL internals', status: 'planned' },
      { title: 'When to use which database', status: 'planned' },
    ],
  },
  {
    theme: 'DevOps & Infrastructure',
    items: [
      { title: 'Container networking explained', status: 'planned' },
      { title: 'Kubernetes control plane internals', status: 'planned' },
      { title: 'How DNS actually works', status: 'exploring' },
    ],
  },
  {
    theme: 'AI Engineering',
    items: [
      { title: 'Vector databases and embeddings', status: 'exploring' },
      { title: 'Building RAG systems', status: 'planned' },
      { title: 'LLM inference and KV cache', status: 'planned' },
    ],
  },
];

const statusColor: Record<string, string> = {
  exploring: 'text-sky-500',
  writing: 'text-amber-500',
  planned: 'text-slate-600',
};
---

<Layout title="Roadmap" description="Topics I'm learning, exploring, or planning to write about.">
  <header class="mb-12 pb-8 border-b border-white/[0.06]">
    <h1 class="text-3xl font-extrabold text-white mb-3">Roadmap</h1>
    <p class="text-slate-500 text-sm">
      Topics I'm learning, exploring, or planning to write about. Updated as I go.
    </p>
    <div class="flex gap-5 mt-5 text-[11px] tracking-wide">
      <span class="text-amber-500">● writing</span>
      <span class="text-sky-500">● exploring</span>
      <span class="text-slate-600">● planned</span>
    </div>
  </header>

  <div class="space-y-12">
    {
      topics.map((group) => (
        <section>
          <h2 class="text-white font-bold text-sm tracking-widest uppercase mb-5 flex items-center gap-3">
            <span>{group.theme}</span>
            <span class="h-px flex-1 bg-white/[0.06]"></span>
          </h2>
          <ul class="space-y-3">
            {group.items.map((item) => (
              <li class="flex items-baseline justify-between gap-4">
                <span class="text-slate-400 text-sm">{item.title}</span>
                <span class={`text-[11px] tracking-wide whitespace-nowrap shrink-0 ${statusColor[item.status]}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))
    }
  </div>
</Layout>
```

- [ ] **Step 2: Verify roadmap page**

```powershell
npx astro dev
```
Open `http://localhost:4321/roadmap`. Verify:
- Header with title + status legend (amber = writing, sky = exploring, slate = planned)
- 4 theme groups each separated by a rule
- Each item shows topic title + colored status label

Stop server with Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/roadmap.astro
git commit -m "feat: add roadmap page with learning topics"
```

---

## Task 9: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout
  title="About"
  description="What Learn It Anyway is, why it exists, and what it believes."
>
  <header class="mb-12 pb-8 border-b border-white/[0.06]">
    <h1 class="text-3xl font-extrabold text-white mb-3">About</h1>
    <p class="text-slate-500 text-sm">What this is, why it exists, and what it believes.</p>
  </header>

  <div class="prose prose-invert prose-slate max-w-none
    prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
    prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4
    prose-p:text-slate-400 prose-p:leading-loose
    prose-strong:text-slate-200
    prose-hr:border-white/10
    prose-li:text-slate-400">

    <p>
      <strong>Learn It Anyway</strong> is a personal learning journal and digital garden by Navneet Mahajan.
      It's a place to document curiosity in public — primarily around software architecture, systems,
      AI, databases, and DevOps, with occasional notes on books, ideas, and life.
    </p>

    <p>
      It is not a course, a portfolio, a newsletter funnel, or an authority platform.
      It is simply a curious person trying to understand how things work.
    </p>

    <hr />

    <h2>Core Motto</h2>
    <p class="text-xl text-white font-semibold not-prose mb-4">Learn before you need it.</p>
    <p>
      Most people learn things only when circumstances force them to.
      Learn It Anyway is built on the belief that understanding compounds over time.
      Learning something before you urgently need it creates better decisions, deeper intuition,
      and adaptability.
    </p>

    <h2>Curiosity Compounds</h2>
    <p>
      Technology changes. Frameworks come and go. But understanding how things work keeps paying dividends.
      Learning is not an expense. It is compound interest.
    </p>

    <h2>Survival of the Curious</h2>
    <p>
      Inspired by Darwin's idea of "Survival of the Fittest" — the fittest are not necessarily
      the strongest or the smartest. They are the most adaptable. In technology, adaptability
      comes from curiosity. Curious people continue learning. Curious people adapt. Curious people
      survive change.
    </p>

    <h2>From Consumer to Creator</h2>
    <p>
      For years, information was mostly consumed. Books. Courses. Videos. Articles. Posts.
      Eventually, consuming stopped being enough. Learn It Anyway is an attempt to contribute —
      to share, to write, to think in public. Less scrolling. More making.
    </p>

    <h2>Learning In Public</h2>
    <p>
      This website does not claim authority. It does not assume expertise. Mistakes are expected.
      Opinions can change. Knowledge evolves. If someone knows more, corrections are welcome.
      If someone is learning too, they are welcome to learn together. The goal is not to teach
      from a pedestal. The goal is to think in public.
    </p>

    <hr />

    <h2>Topics</h2>
    <p><strong>Primary:</strong> Software Architecture · System Design · Backend Engineering · Databases · DevOps · AI · Frontend · Engineering Decisions</p>
    <p><strong>Side Quests:</strong> Books · Mental Models · Interesting Ideas · Life Lessons · Notes Worth Remembering</p>

    <hr />

    <h2>Values</h2>
    <ul>
      <li>Curiosity over credentials</li>
      <li>Understanding over memorization</li>
      <li>Adaptability over certainty</li>
      <li>Progress over perfection</li>
      <li>Creation over consumption</li>
      <li>Learning before necessity</li>
      <li>Intellectual honesty over authority</li>
    </ul>

    <hr />

    <p class="text-slate-300 font-medium not-prose text-sm leading-relaxed border-l-2 border-amber-500 pl-4 py-1">
      Learn It Anyway is a curious engineer's notebook on the internet — a place to understand
      how things work, document the journey, and learn before it becomes necessary.
    </p>
  </div>
</Layout>
```

- [ ] **Step 2: Verify about page**

```powershell
npx astro dev
```
Open `http://localhost:4321/about`. Verify:
- All sections render: Core Motto, Curiosity Compounds, Survival of the Curious, From Consumer to Creator, Learning In Public, Topics, Values
- Final tagline in amber-bordered block at the bottom
- Typography is readable (slate-400 body text on dark background)

Stop server with Ctrl+C.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/about.astro
git commit -m "feat: add about/manifesto page"
```

---

## Task 10: RSS feed

**Files:**
- Modify: `src/pages/rss.xml.js`

- [ ] **Step 1: Create `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('articles');
  const sideQuests = await getCollection('side-quests');

  const allPosts = [
    ...articles.map((post) => ({ ...post, urlPrefix: 'articles' })),
    ...sideQuests.map((post) => ({ ...post, urlPrefix: 'side-quests' })),
  ].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Learn It Anyway',
    description: "A curious engineer's notebook on the internet.",
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.urlPrefix}/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 2: Verify RSS feed builds**

```powershell
npx astro build
```
Expected: Build succeeds. Verify `dist/rss.xml` exists:
```powershell
Test-Path "dist\rss.xml"
```
Expected: `True`

- [ ] **Step 3: Check RSS content**

```powershell
Get-Content "dist\rss.xml" | Select-Object -First 30
```
Expected: Valid RSS XML with `<channel>` containing `<title>Learn It Anyway</title>` and `<item>` entries for both sample posts.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/rss.xml.js
git commit -m "feat: add RSS feed for articles and side quests"
```

---

## Task 11: Final build verification & Vercel setup

**Files:**
- No new files — verification only

- [ ] **Step 1: Run full production build**

```powershell
npx astro build
```
Expected: All routes built successfully:
- `/` (homepage)
- `/articles/`
- `/articles/2026-06-20-what-a-database-actually-is/`
- `/side-quests/`
- `/side-quests/2026-06-20-notes-on-atomic-habits/`
- `/roadmap/`
- `/about/`
- `/rss.xml`

- [ ] **Step 2: Smoke test with preview server**

```powershell
npx astro preview
```
Open `http://localhost:4321`. Navigate through every page manually:
1. Homepage → hero visible, note block visible, article listed
2. Click "READ ARTICLES →" → articles list page
3. Click article title → article detail with markdown rendered
4. Nav → Side Quests → sample post listed
5. Click post → side quest detail page
6. Nav → Roadmap → all 4 topic groups visible with status colors
7. Nav → About → full manifesto visible
8. Nav → RSS → browser shows raw XML

Stop server with Ctrl+C.

- [ ] **Step 3: Connect to Vercel**

> Note: This step requires a GitHub remote. If not set up yet:
```powershell
# On GitHub, create a new repo named "learn-it-anyway"
# Then:
git remote add origin https://github.com/YOUR_USERNAME/learn-it-anyway.git
git push -u origin main
```

Then go to [vercel.com](https://vercel.com):
1. Click "Add New → Project"
2. Import the `learn-it-anyway` GitHub repo
3. Vercel auto-detects Astro — no config changes needed
4. Click "Deploy"
5. Wait ~60 seconds — site is live

- [ ] **Step 4: Update site URL in `astro.config.mjs`**

After Vercel assigns a URL (e.g., `https://learn-it-anyway.vercel.app`), update:
```js
export default defineConfig({
  site: 'https://learn-it-anyway.vercel.app', // replace with your actual Vercel URL
  integrations: [tailwind()],
});
```

- [ ] **Step 5: Final commit and push**

```powershell
git add astro.config.mjs
git commit -m "chore: set production site URL for RSS feed"
git push
```
Expected: Vercel auto-deploys the updated build. RSS feed links now use the correct production URLs.

---

## Daily Publishing Workflow (after setup)

To publish a new engineering post:
```powershell
# 1. Create the file
New-Item "src\content\articles\2026-06-21-your-post-title.md" -ItemType File

# 2. Add frontmatter + write content (open in editor)
# 3. Push
git add src/content/articles/2026-06-21-your-post-title.md
git commit -m "post: your post title"
git push
```
Live in ~30 seconds.
