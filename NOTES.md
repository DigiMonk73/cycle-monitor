# Cycle Monitor - Development Notes

## Build Date
January 9, 2026

## Phase 2 Update: Live Data Integration
Added automatic data fetching from free APIs (FRED, Yahoo Finance, CoinGecko).

### Data Sources

| Source | Data | Status |
|--------|------|--------|
| Yahoo Finance | XHB, KRE, VIX, TSLA prices + 200-day/week MAs | Working (via CORS proxy) |
| CoinGecko | BTC price | Working (no key needed) |
| FRED | HY Spread, 2Y-10Y Spread, Initial Claims, Sahm Rule | Requires API key |

### API Configuration
- FRED API key stored in `.env` as `VITE_FRED_API_KEY`
- Get free key at: https://fred.stlouisfed.org/docs/api/api_key.html
- Yahoo Finance uses `corsproxy.io` for CORS bypass
- CoinGecko is free, no key required

### Hardcoded Values (No Free API Available)
- ISM Manufacturing PMI (47.9)
- LEI 6-month Change (-2.1%)
- Building Permits YoY (-5%)
- Corporate Profits YoY (+4.2%)
- Office REITs status (Stressed)
- % Stocks > 200d MA (55%)

### Score Calculation Logic

**18-Year Cycle Score (0-100):**
- XHB below 200d MA: +10 points
- XHB below 200w MA: +15 points
- KRE below 200d MA: +10 points
- HY Spread > 400bp: +5, >500bp: +10, >600bp: +20
- VIX > 25: +5, >35: +15, >50: +25
- Office REITs stressed: +5 (hardcoded)

**Recession Score (0-100):**
- Sahm Rule >= 0.3: +10, >= 0.5: +30
- Initial Claims > 250K: +5, >300K: +15, >350K: +25
- ISM < 50: +5, < 47: +10, < 45: +20
- HY Spread scoring (same as cycle)
- Yield curve still inverted: +15

### Status Thresholds (Updated)
- 0-30: NORMAL (green)
- 31-60: ELEVATED (yellow)
- 61-85: WARNING (orange)
- 86-100: CRISIS (red)

### Error Handling
- Failed API calls log to console
- Cached data stored in localStorage
- Yellow ⚠ indicator shown on affected metrics
- Dashboard continues working with stale data

## File Structure (Updated)
```
cycle-monitor/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                    # API keys (not committed)
├── .env.example            # Template for .env
├── .gitignore
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── SpeedometerGauge.jsx
│   │   ├── IndicatorCard.jsx
│   │   ├── TriggerBar.jsx
│   │   ├── CollapsibleSection.jsx
│   │   └── LoadingSpinner.jsx
│   ├── hooks/
│   │   └── useMarketData.js
│   ├── services/
│   │   └── dataFetcher.js
│   └── data/
│       └── sampleData.js   # Fallback data
├── CLAUDE.md
├── SPEC.md
└── NOTES.md
```

## Known Issues

1. **CORS Proxy Dependency**: Yahoo Finance requires corsproxy.io which may be rate-limited or unavailable. Consider setting up a serverless proxy for production.

2. **FRED API Key Required**: Without a FRED API key, HY Spread, Yield Spread, Initial Claims, and Sahm Rule will use fallback values.

3. **Historical Data Limit**: Yahoo Finance 5-year history may not always provide full 1000 days needed for accurate 200-week MA calculation.

## Suggested Improvements

### Priority 1 (High)
1. ~~**API Integration**: Replace hardcoded sample data with real API calls~~ ✓ DONE
2. ~~**Data Refresh**: Add manual refresh button and configurable auto-refresh interval~~ ✓ DONE
3. **Serverless Proxy**: Create Vercel/Netlify functions to avoid CORS issues
4. **Price Alerts**: Add notification system when triggers are approached

### Priority 2 (Medium)
5. **Historical Charts**: Add mini sparkline charts showing trend history
6. **Custom Triggers**: UI for users to add/edit their own trigger conditions
7. **ISM/LEI Data**: Find free API source for remaining hardcoded indicators
8. **Export Data**: Allow exporting dashboard state as JSON or CSV

### Priority 3 (Low)
9. **PWA Support**: Service worker for offline access
10. **Sound Alerts**: Audio notifications for critical status changes
11. **Keyboard Shortcuts**: Power user navigation

## Commands
```bash
npm run dev     # Start development server (http://localhost:5173)
npm run build   # Build for production
npm run preview # Preview production build
```

## Environment Setup
```bash
# Copy example env file
cp .env.example .env

# Add your FRED API key to .env
VITE_FRED_API_KEY=your_key_here
```
