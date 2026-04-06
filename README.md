# USC Trojan Technology Solutions

The official website for Trojan Technology Solutions (TTS) — USC's AI-native consulting and product club.

Live: [usctts.com](https://usctts.com) *(connect to Vercel)*

---

## What is TTS?

Trojan Technology Solutions is USC's premier AI-first club for students who want to build, consult, and grow. Three tracks:

| Track | Focus |
|---|---|
| **Building** | Ship real products and tools with AI. Deploy live. |
| **Consulting** | Real client engagements. Actual deliverables, not slide decks. |
| **Research** | Publish. Partner with labs. Go deep on what's next. |

No CS degree required. Any major, any year.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Project Structure

```
usctts/
├── app/
│   ├── page.tsx              # Home (TTSSite component)
│   ├── apply/                # Application page
│   ├── partner/              # Partner/sponsor page
│   ├── api/
│   │   ├── apply/            # Application submission endpoint
│   │   ├── notify/           # Notification endpoint
│   │   └── partner/          # Partner inquiry endpoint
│   └── layout.tsx
├── components/
│   ├── TTSSite.tsx           # Main site component
│   └── ui/                   # shadcn/ui primitives
└── hooks/
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# .env.local
RESEND_API_KEY=           # Email delivery
NEXT_PUBLIC_SITE_URL=     # Production URL
```

---

## Deployment

Push to `main` — Vercel auto-deploys. All environment variables set in Vercel dashboard.

---

## Contact

Questions about TTS: reach out through [usctts.com/apply](https://usctts.com/apply)

---

All glory to God! ✝️❤️
