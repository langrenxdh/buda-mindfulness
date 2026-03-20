# Buda · 禅房 — Implementation Guide

## Overview

Buda is a single-viewport digital zen room for mindfulness practice. It's built as a single HTML file with no dependencies, no build step, and no framework — just HTML + CSS + vanilla JavaScript.

The design philosophy is 虚幻空静 (ethereal void-like stillness) — a misty zen garden meets modern glassmorphism.

---

## Architecture

### Single File: `index.html`

Everything lives in one file (~1100 lines):
- `<style>` block: All CSS (~500 lines)
- HTML body: Buddha SVG, carousel container, controls, settings modal
- `<script>` block: All JavaScript (~300 lines)

### No Build Step

The file loads directly in any browser. External dependencies are limited to Google Fonts (Noto Serif SC, Cormorant Garamond) loaded via CDN.

---

## Visual System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--void` | `#0a0a0c` | Background |
| `--mist` | `#1a1a1f` | UI surfaces |
| `--incense` | `#c9a84c` | Golden accent |
| `--incense-dim` | `rgba(201,168,76,0.3)` | Subtle gold |
| `--smoke-text` | `rgba(255,255,255,0.55)` | Body text |
| `--glass-bg` | `rgba(255,255,255,0.04)` | Card backgrounds |
| `--glass-border` | `rgba(255,255,255,0.08)` | Card borders |

### Typography

- **Chinese**: `Noto Serif SC` (300, 400, 600) — contemplative serif
- **English**: `Cormorant Garamond` (300, 400, 600, italic) — elegant serif
- No sans-serif anywhere

### Animations

| Element | Animation | Duration |
|---|---|---|
| Room fade-in | Opacity 0→1 | 3s, 0.5s delay |
| Buddha breathing | Opacity 0.3↔0.6, scale 1↔1.02 | 6s infinite |
| Title fade | Opacity + letter-spacing | 4s, 2s delay |
| Card entrance | Opacity + translateY, staggered | 1.2s per card |
| Card float | translateY breathing | 5-9s infinite, varied |
| Carousel drift | translateX infinite loop | ~84s (14 cards × 6s) |
| Incense wisps | Opacity + translateY | 8s infinite, staggered |
| Controls fade | Opacity + translateY | 2s, 3.5s delay |
| Mist drift | Background translate | 60s infinite |
| Bokeh particles | Canvas requestAnimationFrame | Continuous |

---

## Components

### Buddha Visual

SVG drawn inline with:
- Radial gradient aura
- Head, ushnisha, ears, closed eyes, slight smile
- Meditation pose body with dhyana mudra hands
- Lotus base with petal details
- `drop-shadow` filter with golden glow
- 6s breathing cycle animation

### Incense Wisps

Three `div` elements with CSS-only smoke effect using:
- `linear-gradient` from gold to transparent
- `blur(2px)` filter
- Staggered 8s animation with translateY and opacity

### Floating Particles

Canvas-based bokeh system:
- 15 particles with random position, size, speed
- Radial gradients in incense gold
- Sine-wave opacity flicker
- requestAnimationFrame loop

### Carousel

- 7 wisdom cards duplicated (14 total) for seamless CSS infinite scroll
- `translateX(-50%)` animation loops because content is exactly 2× the visible set
- Edge-fade masks via CSS `mask-image` gradient
- Hover pauses the drift
- Cards have varied sizes (sm/default/lg) and opacity variants (a/b/c/d)

### Glassmorphism Cards

- `backdrop-filter: blur(12px)` with subtle white border
- `linear-gradient` overlay for light refraction effect
- Individual float animations with random duration (5-9s) and delay
- Chinese text uses Noto Serif SC, English uses Cormorant Garamond italic

### Controls

Fixed bottom bar with gradient fade-from-black background:
- **Toggle switch**: CSS-only switch with incense gold active state
- **Interval buttons**: 15/30/45/60 minute options
- **Settings gear**: Opens modal

### Settings Modal

- Overlay with `backdrop-filter: blur(8px)`
- API key input (password field)
- Save/Clear/Cancel actions
- Connection status indicator (green dot when key saved)
- Notice: "Your API key is stored locally"

---

## Break Reminder System

### Flow

1. User clicks toggle → `Notification.requestPermission()` if needed
2. `setInterval` starts at selected minute interval
3. Each interval: get prompt (LLM or local) → send notification + in-app toast
4. First preview fires 3 seconds after enabling

### Prompt Source Priority

1. If API key exists → call Claude Sonnet API
2. If API fails → fallback to local pool
3. If no API key → use local pool directly

### Local Prompt Pool

32 curated prompts covering:
- 经典引导 (classic guidance)
- 现代正念 (modern mindfulness)
- 禅宗公案 (zen koans)
- 身体觉察 (body awareness)

Shuffled on init, re-shuffled when exhausted.

---

## LLM Integration

### API Call

```
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: [user's key from localStorage]
  anthropic-version: 2023-06-01
  anthropic-dangerous-direct-browser-access: true
Model: claude-sonnet-4-20250514
Max tokens: 200
```

### System Prompt

Tuned for Max's 觉察-转念-布施 practice with:
- Random style selection (classic/modern/koan/body)
- Structured format: 🧘 header → guidance → 💡 tip → _quote_
- 80-character limit, Chinese-first, warm tone

### Security

- API key stored in `localStorage('buda-api-key')` only
- Never sent to any server except `api.anthropic.com`
- `anthropic-dangerous-direct-browser-access` header required for browser CORS

---

## Responsive Design

### Desktop (>600px)

- Cards: 220-380px wide depending on variant
- Full control bar with horizontal layout
- Generous whitespace

### Mobile (≤600px)

- Cards: 160-300px wide
- Controls wrap to two rows
- Smaller interval buttons
- Buddha scales down

---

## Deployment

Works on any static hosting:

```bash
# GitHub Pages: just push index.html
# Vercel/Netlify: deploy root directory
# Local: open index.html directly or python3 -m http.server
```

No environment variables needed. No server required for core features.
