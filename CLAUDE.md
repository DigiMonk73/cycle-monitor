# Cycle Monitor - Project Instructions

## Project Overview
A financial dashboard showing two speedometer-style gauges for 18-Year Real Estate Cycle risk and Recession risk, with detailed indicator breakdowns below.

## Deployment
- **Hosted on**: Vercel (auto-deploys from GitHub)
- **GitHub Repo**: https://github.com/PlebRick/cycle-monitor
- **Production URL**: Deployed on Vercel (check Vercel dashboard for current URL)
- **Workflow**: Push to `main` branch → Vercel auto-builds and deploys
- **Environment Variables**: Set `VITE_FRED_API_KEY` in Vercel dashboard (Settings → Environment Variables)

## Tech Stack
- React 18+ with Vite
- Tailwind CSS (dark theme)
- SVG or Canvas for gauges
- FRED API for live economic data

## Design Requirements
- Dark theme background: #0a0a0f
- Accent colors: green (#00ff88), yellow (#ffcc00), orange (#ff8800), red (#ff3344)
- Glowing/neon trading terminal aesthetic
- Mobile responsive

## Code Standards
- Functional components with hooks
- Components in /src/components folder
- Keep components small and focused
- Use Tailwind for all styling (no separate CSS files)
- Comment complex logic

## Testing
- Test that the app compiles without errors
- Test that gauges render correctly
- Test responsive layout at mobile and desktop widths

## When Done
- Run dev server and confirm everything works
- List any issues or improvements for next iteration