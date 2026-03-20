# Buda · 禅房

A digital zen room for mindfulness practice — 觉察·转念·布施

Single-viewport, no-scroll, pure HTML/CSS/JS. Opens directly in any browser.

---

## What It Is

A contemplative single-page app that serves as a digital 禅房 (zen room):

- **Buddha silhouette** — CSS/SVG with slow breathing animation, emerging from void
- **Drifting wisdom cards** — glassmorphism carousel of mindfulness quotes
- **Break reminders** — Web Notifications at configurable intervals (15/30/45/60 min)
- **Optional LLM** — bring your own Anthropic API key for dynamic 觉察 prompts via Claude Sonnet
- **30+ curated prompts** — local fallback pool, no API needed

---

## Quick Start

```bash
# Just open it
open index.html
# or
python3 -m http.server 8000
# then visit http://localhost:8000
```

No build step. No npm install. No framework.

---

## Features

**Visual Design**
- Color palette: void blacks, misty darks, golden incense glow
- Typography: Noto Serif SC (Chinese) + Cormorant Garamond (English) — contemplative serif
- Glassmorphism cards with varied opacity/size/float speed
- Subtle bokeh particle system, incense smoke wisps
- Staggered fade-in animations on load

**Carousel**
- 7 cards with seamless infinite horizontal drift
- Hover to pause
- Edge-fade masks for ethereal appearance
- Each card has unique float animation timing

**Break Reminders**
- Toggle on/off with minimal switch control
- Interval options: 15, 30, 45, or 60 minutes
- Uses Web Notifications API (requests permission on enable)
- In-app toast fallback for when notifications aren't available
- First preview notification 3 seconds after enabling

**LLM Integration**
- Settings modal (gear icon) to enter Anthropic API key
- Key stored ONLY in localStorage — never sent anywhere except api.anthropic.com
- Calls Claude Sonnet for dynamic mindfulness reminders
- Graceful fallback to local prompt pool when no key or API error
- Agent prompt tuned for 觉察-转念-布施 practice

---

## Card Content

Default drifting cards:
- 色即是空，空即是色 — 心经
- 应无所住而生其心 — 金刚经
- Observe your thoughts like clouds passing
- 呼吸，觉察，放下
- What you resist, persists. What you observe, dissolves.
- 此刻，你在想什么？
- 一切有为法，如梦幻泡影 — 金刚经

---

## Technical Details

| | |
|---|---|
| **Stack** | Pure HTML + CSS + Vanilla JS |
| **File** | Single `index.html` (≈1100 lines) |
| **Fonts** | Google Fonts (Noto Serif SC, Cormorant Garamond) |
| **APIs** | Web Notifications, Anthropic Messages API |
| **Storage** | localStorage only |
| **Deploy** | Any static host (GitHub Pages, Vercel, Netlify, S3) |

---

## Responsive

- **Desktop**: Centered, generous whitespace, wide cards
- **Mobile**: Smaller cards, compact controls, touch-friendly

---

## License

MIT
