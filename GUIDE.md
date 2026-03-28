# BitGuru — Product Guide

## What Is This?

BitGuru is a crypto education website built with Astro, Tailwind CSS, and deployed on Vercel. It's a static site — fast, secure, zero server costs.

**Live pages:** Homepage, Courses, Consultation, Testimonials, Blog (5 articles), About, Contact, Schedule Call, Checkout, Booking Confirmed, Terms, Privacy, Risk Disclosure, 404.

**Total: 19 pages.**

---

## How to Run Locally

```bash
cd ~/my_work/bitguru
bun install        # install dependencies (first time only)
bun run dev        # start dev server at http://localhost:4321
bun run build      # build for production
bun run preview    # preview the production build
```

---

## How to Deploy

The site deploys to Vercel. Two options:

### Option A: Connect GitHub (recommended)
1. Push the repo to GitHub: `git remote add origin <your-repo-url> && git push -u origin main`
2. Go to vercel.com → New Project → Import the GitHub repo
3. Vercel auto-detects Astro — zero config needed
4. Every push to `main` auto-deploys

### Option B: Manual deploy
```bash
cd ~/my_work/bitguru
npx vercel          # preview deploy
npx vercel --prod   # production deploy
```

---

## How to Update Content

All content lives in simple files. No CMS, no database, no login. Edit the file, push to GitHub, site rebuilds automatically.

### Courses

**File:** `src/content/courses/*.json`

Each course is a JSON file. To add a new course, create a new file:

```
src/content/courses/my-new-course.json
```

```json
{
  "title": "My New Course",
  "slug": "my-new-course",
  "description": "Short description for cards",
  "longDescription": "Longer description for detail page",
  "price": 299,
  "originalPrice": 499,
  "currency": "USD",
  "duration": "8 weeks",
  "level": "beginner",
  "modules": 12,
  "lessons": 48,
  "image": "/images/courses/my-new-course.jpg",
  "instructor": "BitGuru Team",
  "tags": ["bitcoin", "trading"],
  "featured": true,
  "comingSoon": false
}
```

### Blog Posts

**File:** `src/content/blog/*.mdx`

Each blog post is a markdown file with frontmatter. To add a new post:

```
src/content/blog/my-new-post.mdx
```

```mdx
---
title: "My Blog Post Title"
description: "Short description for SEO and cards"
pubDate: 2026-04-01
author: "BitGuru Team"
image: "/images/blog/my-post.jpg"
tags: ["bitcoin", "trading"]
draft: false
---

Write your content here using markdown.

## Headings work

**Bold**, *italic*, [links](https://example.com), and everything else.
```

Set `draft: true` to hide a post without deleting it.

### Testimonials

**File:** `src/content/testimonials/*.json`

```json
{
  "name": "Jane Smith",
  "role": "Crypto Investor",
  "quote": "BitGuru changed how I think about risk management.",
  "rating": 5,
  "course": "Advanced Trading Strategies",
  "featured": true
}
```

### Site-Wide Content (Name, Contact, Social Links, Navigation)

**File:** `src/content/site.json`

Edit this one file to change:
- Site name and tagline
- Contact email, phone, address
- Social media URLs
- Navigation menu items
- CTA button text and links
- Feature flags (checkout on/off, booking on/off)

### Images

Put images in `public/images/`. Reference them as `/images/filename.jpg` in your content files.

### Legal Pages (Terms, Privacy, Risk Disclosure)

**Files:** `src/pages/terms.astro`, `src/pages/privacy.astro`, `src/pages/risk-disclosure.astro`

Edit the HTML directly. These are simple text pages.

---

## What's Mock vs Real

Right now, the interactive features show polished UI feedback but don't connect to real services. Here's what each needs:

| Feature | Status | What Happens Now |
|---------|--------|-----------------|
| Contact Form | Mock | Shows success message, no email sent |
| Newsletter | Mock | Shows "Subscribed!", nothing stored |
| Checkout | Mock | Redirects to confirmation, no payment |
| Booking | Mock | Redirects to confirmation, nothing scheduled |
| Copy Link | Real | Actually copies to clipboard |
| Navigation | Real | All links work, all pages exist |
| Blog | Real | Posts render from MDX files |

---

## Wiring Up Real Integrations (Step by Step)

### 1. Contact Form → Email (Resend)

**Effort:** 30 minutes | **Cost:** Free (100 emails/day)

Steps:
1. Sign up at resend.com
2. Verify your domain (add DNS records they give you)
3. Get your API key
4. Install: `bun add resend`
5. Create `src/pages/api/contact.ts`:

```typescript
import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { name, email, message } = data;

  try {
    await resend.emails.send({
      from: "BitGuru <noreply@yourdomain.com>",
      to: "hello@yourdomain.com",
      replyTo: email,
      subject: `Contact Form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};
```

6. Update the contact form script in `src/pages/contact.astro` — replace the `setTimeout` mock with:

```javascript
const res = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});
```

7. Add to Vercel environment variables: `RESEND_API_KEY=re_xxxxx`
8. Change Astro output to `hybrid` in `astro.config.mjs` (needed for API routes):

```javascript
export default defineConfig({
  output: "hybrid",  // was "static"
  // ... rest stays the same
});
```

### 2. Newsletter → Email Service

**Effort:** 15 minutes | **Cost:** Free tier on all options

**Option A: Mailchimp (easiest)**
1. Create a Mailchimp account and audience
2. Get the form action URL from Mailchimp (Audience → Signup Forms → Embedded)
3. Update the newsletter form in `src/pages/blog.astro`:
   - Add `action="https://yourdomain.us1.list-manage.com/subscribe/post?u=xxx&id=xxx"` to the form
   - Add `method="POST"` and `name="EMAIL"` to the input
   - Remove the script mock

**Option B: ConvertKit / Buttondown**
Same pattern — they all give you a form action URL.

### 3. Payments → Stripe Checkout

**Effort:** 1-2 hours | **Cost:** 2.9% + 30¢ per transaction

Steps:
1. Sign up at stripe.com, complete onboarding
2. Install: `bun add stripe`
3. Create `src/pages/api/checkout.ts`:

```typescript
import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async () => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "1:1 Crypto Consultation (60 min)" },
        unit_amount: 29900, // $299.00 in cents
      },
      quantity: 1,
    }],
    success_url: "https://yourdomain.com/booking-confirmed",
    cancel_url: "https://yourdomain.com/checkout",
  });

  return Response.redirect(session.url!, 303);
};
```

4. Update checkout form to POST to `/api/checkout` instead of the mock redirect
5. Add to Vercel env: `STRIPE_SECRET_KEY=sk_live_xxxxx`

### 4. Booking → Calendly or Cal.com

**Effort:** 15 minutes | **Cost:** Free

**Option A: Calendly Embed (simplest)**
1. Create a Calendly account, set up a 60-min event type
2. Replace the calendar UI in `src/pages/schedule-call.astro` with:

```html
<div class="w-full min-h-[600px]">
  <iframe
    src="https://calendly.com/yourname/60min-consultation"
    width="100%"
    height="700"
    frameborder="0"
    class="rounded-2xl"
  ></iframe>
</div>
```

**Option B: Cal.com (open source, more control)**
Same embed approach, free forever.

### 5. Analytics

**Effort:** 5 minutes | **Cost:** Free on Vercel

1. Enable Web Analytics in Vercel dashboard (Project → Analytics → Enable)
2. Install: `bun add @vercel/analytics`
3. Add to `src/layouts/BaseLayout.astro` before `</body>`:

```astro
---
import { Analytics } from "@vercel/analytics/astro";
---
<!-- before </body> -->
<Analytics />
```

---

## Priority Order for Wiring

If your friend wants to go live progressively:

1. **Deploy as-is** — site works, looks professional, all navigation functional
2. **Add analytics** (5 min) — start tracking visitors immediately
3. **Wire contact form** (30 min) — so people can actually reach you
4. **Add Calendly embed** (15 min) — real booking without building anything
5. **Wire newsletter** (15 min) — start building an email list
6. **Add Stripe** (1-2 hours) — when ready to charge for consultations

---

## Project Structure

```
bitguru/
├── public/                  # Static assets (images, favicon)
│   └── favicon.svg
├── src/
│   ├── components/          # Shared UI (Navbar, Footer)
│   ├── content/             # Editable content
│   │   ├── courses/         # JSON files (one per course)
│   │   ├── testimonials/    # JSON files (one per testimonial)
│   │   ├── blog/            # MDX files (one per post)
│   │   └── site.json        # Site-wide config
│   ├── content.config.ts    # Content schemas (validates JSON/MDX)
│   ├── layouts/             # Base HTML layout
│   ├── lib/                 # Utilities
│   ├── pages/               # Routes (file = page)
│   │   ├── index.astro      # Homepage
│   │   ├── courses.astro
│   │   ├── blog.astro
│   │   ├── blog/[...slug].astro  # Individual blog posts
│   │   └── ... (15 more pages)
│   └── styles/
│       └── global.css        # Design tokens + utilities
├── astro.config.mjs          # Astro config
├── package.json
└── GUIDE.md                  # This file
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Astro 6 | Framework (static-first, zero JS by default) |
| Tailwind CSS 4 | Styling (design tokens from Stitch) |
| React 19 | Interactive islands (forms, when needed) |
| MDX | Blog post content |
| Bun | Package manager + runtime |
| Vercel | Hosting + CDN |

---

## Design System

The design follows the "Illuminated Scholar" system from Stitch:

- **Dark mode only** — deep space charcoal base (#0f1418)
- **Primary:** Neon Cyan (#00E5FF) — CTAs, links, accents
- **Secondary:** Liquid Gold (#FFD700) — premium features, rewards
- **Fonts:** Manrope (headlines) + Inter (body)
- **Glass effects:** Semi-transparent panels with backdrop blur
- **No hard borders:** Structure through background shifts and spacing

All 40+ color tokens are in `src/styles/global.css` under `@theme`.

---

## FAQ

**Q: How do I change the site name?**
Edit `src/content/site.json` → `name` field.

**Q: How do I add a new page?**
Create `src/pages/my-page.astro`. Import BaseLayout, wrap your content.

**Q: How do I change prices?**
Edit the relevant page directly (courses.astro, consultation section in index.astro, checkout.astro).

**Q: How do I hide checkout/booking until ready?**
Set `features.checkout` and `features.booking` to `false` in `src/content/site.json`. Then wrap those sections with a conditional check in the page.

**Q: Can I add more blog posts?**
Yes — create a new `.mdx` file in `src/content/blog/`. It automatically shows up on the blog listing and gets its own page.

**Q: Do I need to know coding?**
For content updates (blog posts, courses, testimonials) — no, just edit JSON/MDX files. For layout changes or wiring integrations — basic HTML/CSS knowledge helps.
