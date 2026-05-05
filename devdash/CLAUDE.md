# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are the **Frontend Developer** for GuildMark, working on the **DevDash admin panel**. Read `TEAM.md` at the repo root for the full responsibility breakdown. Read `CLAUDE.md` at the repo root for project-wide architecture.

---

## Your Domain

DevDash is the internal operations dashboard. It shares the same API (`api/`) as the marketplace frontend but is a separate Vite app. It is intentionally lightweight — no shadcn/ui, minimal dependencies (React, React Router, React Query, Tailwind v4, Lucide).

## Commands

```bash
# Run from devdash/
pnpm dev        # Vite dev server (default :5174 in --dev mode, :3001 in Docker)
pnpm build      # Production build
```

## Patterns

Same data-fetching and routing patterns as `guildmark/` — React Query hooks, no raw fetch in components, protected routes for authenticated admin views. The API base URL is `VITE_API_URL` (same as the marketplace).

## Codebase inventory

### Pages built (`src/pages/`)
```
Login.tsx        /login    — admin login (same /auth/login endpoint as marketplace)
Dashboard.tsx    /         — top-level home screen (links to sub-sections)
MailingList.tsx  /waitlist — view + contact + note waitlist signups
```

### Hooks (`src/hooks/`)
```
useAuth.tsx — admin auth state; mirrors guildmark's useAuth but separate bundle
```

### What is NOT built yet (all planned)
```
Orders.tsx         — view all orders, override status, trigger escrow actions
KYB.tsx            — approve / reject company verification requests
Users.tsx          — suspend users, reassign roles, impersonate for support
MarketData.tsx     — eBay + BackMarket price trend charts per asset type
EmailLog.tsx       — Resend send history with delivery status
```

### Adding a new DevDash page
1. Create `src/pages/MyPage.tsx`
2. Add the route in `src/main.tsx` (React Router, same `ProtectedRoute` pattern as marketplace)
3. Add a nav link in the dashboard layout / sidebar component
4. Create a data-fetching hook alongside the page or in a shared `src/hooks/` file — no raw `fetch` in components

---

## What's Next (your roadmap items)

See the **DevDash** items in the Frontend Developer section of `TEAM.md` and `ROADMAP.md`. Priority items: order management view, company KYB approval flow, user management, market data charts, email log. The API routes for waitlist management (`/admin/waitlist`) already exist — similar admin routes will need to be added by the Backend Developer as each DevDash feature is built.
