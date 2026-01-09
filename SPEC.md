# Cycle Monitor - Full Specification

## Phase 1: Project Setup
- [ ] Initialize Vite + React project
- [ ] Install and configure Tailwind CSS
- [ ] Set up dark theme defaults
- [ ] Create basic folder structure
- [ ] Verify dev server runs

## Phase 2: Speedometer Component
- [ ] Create reusable SpeedometerGauge component
- [ ] Semi-circular arc (180 degrees)
- [ ] Gradient from green (0) → yellow (50) → red (100)
- [ ] Animated needle with glow effect
- [ ] Digital score readout below gauge
- [ ] Status label (NORMAL/ELEVATED/WARNING/CRISIS)
- [ ] Props: score, title, subtitle

## Phase 3: Indicator Cards
- [ ] Create IndicatorCard component
- [ ] Shows: name, value, status dot, trend arrow
- [ ] Status dot colors based on thresholds
- [ ] Hover effect with subtle glow
- [ ] Collapsible section wrapper

## Phase 4: Main Dashboard Layout
- [ ] Header with title and timestamp
- [ ] Two gauges side by side (stack on mobile)
- [ ] "18-Year Cycle Indicators" collapsible section
- [ ] "Recession Indicators" collapsible section
- [ ] "Your Triggers" section at bottom

## Phase 5: Sample Data Integration
- [ ] Create data/sampleData.js with hardcoded values
- [ ] 18-Year Cycle indicators (8 items)
- [ ] Recession indicators (8 items)
- [ ] Trigger data (BTC, TSLA distances)

## Phase 6: Polish & Test
- [ ] Verify all components render
- [ ] Test mobile responsiveness
- [ ] Add subtle animations
- [ ] Final visual polish

---

## Component Specifications

### SpeedometerGauge
```jsx
<SpeedometerGauge
  score={35}
  maxScore={100}
  title="18-Year Cycle"
  size="large"
/>
```

### IndicatorCard
```jsx
<IndicatorCard
  name="XHB vs 200-day MA"
  value="Above"
  status="green" // green | yellow | orange | red
  trend="up" // up | down | flat
/>
```

### TriggerBar
```jsx
<TriggerBar
  asset="BTC"
  currentPrice={94230}
  triggerPrice={60000}
  direction="below" // trigger when price goes below
/>
```

---

## Sample Data

### 18-Year Cycle Indicators
| Indicator | Value | Status |
|-----------|-------|--------|
| XHB vs 200-day MA | Above | green |
| XHB vs 200-week MA | +2.3% | yellow |
| KRE vs 200-day MA | Below | yellow |
| KRE vs Mar '23 lows | +18% | green |
| HY Credit Spread | 425bp | yellow |
| Office REITs | Stressed | yellow |
| % Stocks > 200d MA | 48% | yellow |
| VIX | 18.5 | green |

### Recession Indicators
| Indicator | Value | Status |
|-----------|-------|--------|
| 2Y-10Y Spread | +0.55% | green |
| Initial Claims | 218K | green |
| Sahm Rule | 0.13 | green |
| ISM Manufacturing | 48.2 | yellow |
| LEI 6-mo Change | -2.8% | yellow |
| HY Credit Spread | 425bp | yellow |
| Building Permits YoY | -8% | yellow |
| Corp Profits YoY | +3.2% | green |

### Triggers
| Asset | Current | Trigger | Distance |
|-------|---------|---------|----------|
| BTC | $94,230 | $60,000 | 36% |
| TSLA | $411 | $250 | 39% |
```

---

**Step 3: The Agentic Prompt**

Now in Claude Code, paste this single prompt and let it run:
```
Read CLAUDE.md and SPEC.md in this project folder.

Execute all phases autonomously from start to finish:
1. Set up the project (Vite + React + Tailwind)
2. Build each component according to spec
3. Assemble the full dashboard
4. Add sample data
5. Test and verify everything works
6. Start the dev server when complete

Work through each phase systematically. Use sub-agents if helpful for parallel tasks. After each phase, verify it works before moving to the next.

Do not stop to ask me questions - make reasonable decisions and document any assumptions in a NOTES.md file.

When fully complete, summarize what was built and list any issues or suggested improvements.

Begin now.