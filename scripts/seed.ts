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
  {
    slug: "best-mechanical-keyboards",
    title: "Best Mechanical Keyboards for Coding in 2026",
    excerpt: "We tested 15 mechanical keyboards to find the best switches, layouts, and features for programmers and writers.",
    date: "2026-05-20",
    category: "Equipment",
    content: `
## Why Your Keyboard Matters

If you spend 8+ hours a day typing, your keyboard is the most-used tool on your desk. A good mechanical keyboard can reduce fatigue, improve accuracy, and make typing genuinely enjoyable.

## How We Tested

We evaluated keyboards on: switch feel, build quality, ergonomics, programmability, noise level, and value for money. Each keyboard was used for at least one full work week.

## Top Picks

### Best Overall: Keychron Q6 Max

The Q6 Max combines premium aluminum construction, hot-swappable switches, and wireless connectivity in one stunning package. The Gateron Jupiter switches are smooth and satisfying right out of the box.

**Pros:**
- Full aluminum CNC body
- Hot-swappable switches
- Bluetooth + 2.4GHz + wired
- QMK/VIA programmable
- Outstanding build quality

**Cons:**
- Heavy (not portable)
- Pricey for beginners
- No dedicated media keys

**Rating: 4.7/5** | **Price: $199**

### Best Budget: Royal Kludge RK84

Proof that you don't need to spend hundreds for a great typing experience. The RK84 offers wireless connectivity, hot-swap sockets, and a compact 75% layout at an unbeatable price.

**Pros:**
- Incredible value
- Hot-swappable switches
- Triple-mode connectivity
- USB passthrough hub
- Compact but retains function row

**Cons:**
- Plastic case feels budget
- Stock stabilizers need tuning
- Battery life is average

**Rating: 4.3/5** | **Price: $59**

### Best Ergonomic: ZSA Moonlander

For those struggling with wrist pain, the Moonlander's split design and fully customizable layout are game-changing. The learning curve is steep, but your wrists will thank you.

**Pros:**
- Dramatic wrist pain relief
- Endlessly customizable
- Excellent build quality
- Portable carrying case included
- Active community for layouts

**Cons:**
- Expensive
- 2-4 week adaptation period
- No wireless option

**Rating: 4.5/5** | **Price: $365**

## Switch Types Explained

- **Linear (Red):** Smooth keystroke, no bump. Best for gaming. Quiet when lubed.
- **Tactile (Brown):** Noticeable bump at actuation. Best all-rounder for typing and gaming.
- **Clicky (Blue):** Loud click with tactile bump. Satisfying for typing, annoying for coworkers.

## Our Recommendation

Start with the **Keychron Q6 Max** if you want a premium experience out of the box. Go with the **RK84** if you're on a budget. Switch to the **Moonlander** if ergonomics are your top priority.

*Disclosure: As an Amazon Associate, we earn from qualifying purchases.*
`,
  },
  {
    slug: "best-password-managers",
    title: "Best Password Managers in 2026: Secure Your Digital Life",
    excerpt: "Compare the top password managers for security, ease of use, and features. Find the right one to protect your accounts.",
    date: "2026-05-18",
    category: "Software",
    content: `
## Why You Need a Password Manager

Reusing passwords is the #1 security risk for most people. A password manager generates and stores unique, strong passwords for every account — you only need to remember one master password.

## Evaluation Criteria

Security architecture, cross-platform support, user experience, password sharing, emergency access, and pricing.

## Top Picks

### Best Overall: 1Password

1Password strikes the perfect balance between security and usability. Its Secret Key design means even if someone hacks 1Password's servers, your vault stays encrypted.

**Pros:**
- Best-in-class security design
- Intuitive, polished UI
- Excellent family sharing
- Watchtower breach monitoring
- Travel Mode for border crossings

**Cons:**
- No free tier
- Limited offline access
- Subscription required

**Rating: 4.7/5** | **Price: $2.99/month**

### Best Free: Bitwarden

Bitwarden is open-source, independently audited, and offers a generous free tier with unlimited password storage across all devices.

**Pros:**
- Free tier is genuinely great
- Open source & audited
- Self-hosting option
- Unlimited devices on free plan
- Passkey support

**Cons:**
- UI less polished than competitors
- Auto-fill can be clunky
- No built-in VPN

**Rating: 4.4/5** | **Price: Free / $10/year Premium**

### Best for Beginners: NordPass

From the makers of NordVPN, NordPass offers a clean, simple interface that's perfect for password manager newcomers. Setup takes under 5 minutes.

**Pros:**
- Extremely easy to use
- Strong security (XChaCha20 encryption)
- Built-in data breach scanner
- Password health reports
- Good family plan

**Cons:**
- Free tier limited to one device
- Newer than competitors
- Fewer advanced features

**Rating: 4.2/5** | **Price: Free / $1.49/month**

## Comparison Table

| Feature | 1Password | Bitwarden | NordPass |
|---------|-----------|-----------|----------|
| Free tier | No | Yes (unlimited) | Yes (1 device) |
| Open source | No | Yes | No |
| Passkey support | Yes | Yes | Yes |
| Family sharing | Yes | Yes (Premium) | Yes |
| Travel mode | Yes | No | No |

## Final Verdict

**1Password** is the best overall for those willing to pay. **Bitwarden** is the obvious choice if you want a free, open-source solution. **NordPass** is ideal if you want the simplest experience possible.

*Disclosure: Some links in this article are affiliate links. We may earn a commission from qualifying purchases.*
`,
  },
  {
    slug: "best-budget-monitors",
    title: "Best Budget Monitors for Programming (2026)",
    excerpt: "We tested affordable monitors under $400 to find the best displays for coding, productivity, and eye comfort.",
    date: "2026-04-15",
    category: "Equipment",
    content: `
## Why a Good Monitor Matters for Coders

More screen real estate means less alt-tabbing, better code visibility, and reduced eye strain. You don't need a $1,000 display — modern budget monitors offer impressive quality for the price.

## What We Looked For

Resolution, panel type (IPS vs VA), refresh rate, color accuracy, connectivity, and ergonomic adjustments. All picks are under $400.

## Top Picks

### Best Overall: Dell S2722QC

A 27-inch 4K IPS monitor with USB-C connectivity at this price is remarkable. Text is razor-sharp, colors are accurate, and the USB-C port charges your laptop while carrying video.

**Pros:**
- Crisp 4K resolution at 27"
- USB-C with 65W power delivery
- Good color accuracy out of the box
- Built-in speakers
- VESA mount compatible

**Cons:**
- 60Hz only (no high refresh rate)
- HDR is mediocre
- Stand lacks swivel adjustment

**Rating: 4.6/5** | **Price: $279**

### Best Ultrawide: LG 29WP60G-B

An ultrawide 29" IPS display that lets you comfortably fit two code files side by side. At 2560x1080, it's not the sharpest, but the extra horizontal space is transformative for productivity.

**Pros:**
- Ultrawide aspect ratio for side-by-side coding
- IPS panel with good colors
- FreeSync support
- Affordable entry to ultrawide
- 75Hz refresh rate

**Cons:**
- 1080p vertical resolution
- No USB-C
- Stand has limited adjustability

**Rating: 4.3/5** | **Price: $199**

### Best Dual-Screen Setup: ASUS ProArt PA247CV

If you prefer dual monitors, the ProArt delivers factory-calibrated color accuracy and a built-in USB-C hub. Buy two for the ultimate budget coding station.

**Pros:**
- Factory calibrated (Delta E < 2)
- USB-C with 65W PD
- Excellent color accuracy
- Daisy-chain capable
- 3-year warranty

**Cons:**
- 24" is on the smaller side
- 1080p resolution
- Plastic build

**Rating: 4.4/5** | **Price: $229**

## Productivity Tips

- **4K at 27" with 150% scaling** gives you the sharpest text — ideal for long coding sessions
- **Ultrawide monitors** reduce the need for dual screens and eliminate bezel gaps
- **Dual screens** are a cheaper way to get more total pixels
- Always look for **USB-C with power delivery** to reduce cable clutter

## Final Verdict

The **Dell S2722QC** is the sweet spot — 4K clarity, USB-C convenience, and under $300. For those on a tighter budget, the **LG 29WP60G-B** ultrawide offers fantastic productivity at under $200.

*Disclosure: As an Amazon Associate, we earn from qualifying purchases.*
`,
  },
];

(async () => {
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
})();
