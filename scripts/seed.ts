// Run this script to seed the database with existing blog posts.
// Usage: npx tsx scripts/seed.ts

import { readStore, writeStore } from "../src/lib/db";
import type { BlogPost } from "../src/lib/blog-admin";

const posts: Omit<BlogPost, "id" | "created_at" | "updated_at">[] = [
  {
    slug: "best-productivity-apps",
    title: "Best Productivity Apps in 2026: Boost Your Workflow",
    excerpt: "We tested over 20 productivity apps to find the best ones for task management, note-taking, and focus. Here are our top picks.",
    date: "2026-05-15",
    category: "Software",
    content: `
## Why Productivity Apps Matter

In an era of constant distractions, having the right productivity tools can mean the difference between a productive day and a wasted one. We spent 40+ hours testing the most popular productivity apps to bring you this comprehensive guide.

## Our Top Picks

### Best Overall: Notion

Notion combines notes, tasks, databases, and wikis into one flexible workspace. Its AI features, added in 2024, make it even more powerful for content creation and organization.

**Pros:**
- Incredibly flexible — build your own workflows
- Excellent collaboration features
- Strong free tier
- Active template community

**Cons:**
- Can be overwhelming for new users
- Mobile app is slower than competitors
- Offline support could be better

**Rating: 4.5/5**

### Best for Task Management: Todoist

Todoist remains the king of task management with its natural language input, powerful filters, and cross-platform availability.

**Pros:**
- Lightning-fast task entry
- Natural language date parsing
- Excellent keyboard shortcuts
- Integrates with everything

**Cons:**
- Limited free tier (5 projects)
- No built-in calendar view
- Collaboration features behind paywall

**Rating: 4.3/5**

### Best for Note-Taking: Obsidian

For those who think in connections, Obsidian's linked-note system is a game-changer. Your notes are stored as local Markdown files — you own your data forever.

**Pros:**
- Local-first, privacy-focused
- Powerful graph view
- Huge plugin ecosystem
- Free for personal use

**Cons:**
- Steep learning curve
- Syncing costs extra
- No real-time collaboration

**Rating: 4.4/5**

## Comparison Table

| App | Best For | Free Tier | Starting Price | Rating |
|-----|----------|-----------|----------------|--------|
| Notion | All-in-one workspace | Yes | $10/month | 4.5/5 |
| Todoist | Task management | Yes (limited) | $5/month | 4.3/5 |
| Obsidian | Personal knowledge base | Yes | $5/month sync | 4.4/5 |
| Craft | Beautiful documents | Yes | $5/month | 4.0/5 |
| TickTick | Habits + tasks | Yes | $3/month | 4.1/5 |

## Final Verdict

Choose **Notion** if you want one tool to replace many. Pick **Todoist** for pure task management. Go with **Obsidian** if you value privacy and long-term knowledge building.

*Disclosure: Some links in this article are affiliate links. We may earn a commission if you make a purchase, at no additional cost to you.*
`,
  },
  {
    slug: "best-note-taking-apps",
    title: "5 Best Note-Taking Apps Compared (2026 Edition)",
    excerpt: "From simple to sophisticated — find the perfect note-taking app for your workflow with our hands-on comparison.",
    date: "2026-05-10",
    category: "Software",
    content: `
## The Note-Taking Landscape in 2026

Note-taking apps have evolved dramatically. AI features, collaborative editing, and seamless sync are now table stakes. But which app is right for you? Let's find out.

## Methodology

We evaluated each app on: ease of use, organization features, search capabilities, AI integration, cross-platform support, and pricing.

## Top 5 Note-Taking Apps

### 1. Notion — Best All-Rounder

Notion's block-based editor and database features make it suitable for everything from quick notes to full project management.

**Rating: 4.5/5** | **Starting at: Free / $10/month**

### 2. Obsidian — Best for Power Users

With over 1,000 community plugins and local Markdown storage, Obsidian is the ultimate tool for building a second brain.

**Rating: 4.4/5** | **Starting at: Free / $5/month sync**

### 3. Craft — Best for Visual Thinkers

Craft produces stunning documents with minimal effort. Its native apps are a joy to use on Apple devices.

**Rating: 4.2/5** | **Starting at: Free / $5/month**

### 4. Bear — Best for Apple Users

Beautiful, fast, and simple. Bear 2.0 adds backlinks and tables while keeping its signature elegance.

**Rating: 4.3/5** | **Starting at: Free / $3/month**

### 5. Apple Notes — Best Free Option

If you're in the Apple ecosystem, the built-in Notes app has become surprisingly powerful with tags, smart folders, and collaboration.

**Rating: 4.0/5** | **Starting at: Free**

## Which One Should You Choose?

- **Students:** Notion for organization, Craft for beautiful notes
- **Researchers:** Obsidian for linked thinking
- **Creative writers:** Bear for distraction-free writing
- **Budget-conscious:** Apple Notes (if on Apple) or Notion free tier

*Disclosure: Some links in this article are affiliate links. We may earn a commission from qualifying purchases.*
`,
  },
  {
    slug: "best-standing-desks",
    title: "Best Standing Desks for Home Offices in 2026",
    excerpt: "We researched and tested the top standing desks to find the best options for every budget and workspace.",
    date: "2026-04-28",
    category: "Equipment",
    content: `
## Why Invest in a Standing Desk?

Studies show that alternating between sitting and standing throughout the day can reduce back pain, improve energy levels, and even boost productivity. A quality standing desk is one of the best investments you can make for your home office.

## Our Picks

### Best Overall: Uplift V2

The Uplift V2 offers exceptional stability at standing height, a huge range of desktop options, and a 15-year warranty.

**Pros:**
- Extremely stable even at max height
- 355 lbs lifting capacity
- Hundreds of desktop options
- 15-year warranty

**Cons:**
- Assembly takes 1-2 hours
- Premium pricing

**Rating: 4.8/5** | **Price: Starting at $599**

### Best Budget: FlexiSpot EC1

The EC1 delivers reliable height adjustment at a fraction of the premium brands' prices.

**Pros:**
- Affordable entry point
- Simple assembly
- Decent stability
- Good warranty

**Cons:**
- Fewer desktop options
- Slower motor
- Less stable at max height

**Rating: 4.2/5** | **Price: Starting at $249**

### Best Premium: Herman Miller Nevi

If budget is no concern, the Nevi offers the smoothest height adjustment we've ever tested, wrapped in Herman Miller's legendary design.

**Pros:**
- Silent, ultra-smooth motor
- Beautiful design
- 30-year warranty
- Excellent stability

**Cons:**
- Very expensive
- Limited size options

**Rating: 4.6/5** | **Price: Starting at $1,495**

## Key Features to Consider

- **Height range:** Make sure it goes low enough for sitting and high enough for standing
- **Stability:** Wobble at standing height is the #1 complaint
- **Lifting capacity:** Consider your monitor arms + monitors + accessories
- **Warranty:** A good desk should last 10+ years

## Final Verdict

The **Uplift V2** hits the sweet spot of quality, stability, and price for most people. If you're on a tight budget, the **FlexiSpot EC1** gets the job done.

*Disclosure: As an Amazon Associate, we earn from qualifying purchases.*
`,
  },
];

const existing = readStore("posts");
if (existing.length > 0) {
  console.log(`Database already has ${existing.length} posts. Skipping seed.`);
  process.exit(0);
}

const now = new Date().toISOString();
const seeded = posts.map((post, i) => ({
  ...post,
  id: i + 1,
  created_at: now,
  updated_at: now,
}));

await writeStore("posts", seeded);
console.log(`Seeded ${seeded.length} blog posts.`);
