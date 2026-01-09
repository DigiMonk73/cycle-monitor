// Sample data for the Cycle Monitor dashboard
// Updated: January 9, 2026

export const cycleIndicators = [
  { name: 'XHB vs 200-day MA', value: 'Below', status: 'yellow', trend: 'down' },
  { name: 'XHB vs 200-week MA', value: '-3%', status: 'yellow', trend: 'down' },
  { name: 'KRE vs 200-day MA', value: 'Above', status: 'green', trend: 'up' },
  { name: "KRE vs Mar '23 lows", value: '+94%', status: 'green', trend: 'up' },
  { name: 'HY Credit Spread', value: '281bp', status: 'green', trend: 'flat' },
  { name: 'Office REITs', value: 'Stressed', status: 'yellow', trend: 'down' },
  { name: '% Stocks > 200d MA', value: '55%', status: 'green', trend: 'flat' },
  { name: 'VIX', value: '15.1', status: 'green', trend: 'flat' },
]

export const recessionIndicators = [
  { name: '2Y-10Y Spread', value: '+0.68%', status: 'green', trend: 'up' },
  { name: 'Initial Claims', value: '208K', status: 'green', trend: 'flat' },
  { name: 'Sahm Rule', value: '0.13', status: 'green', trend: 'flat' },
  { name: 'ISM Manufacturing', value: '47.9', status: 'yellow', trend: 'down' },
  { name: 'LEI 6-mo Change', value: '-2.1%', status: 'yellow', trend: 'down' },
  { name: 'HY Credit Spread', value: '281bp', status: 'green', trend: 'flat' },
  { name: 'Building Permits YoY', value: '-5%', status: 'yellow', trend: 'down' },
  { name: 'Corp Profits YoY', value: '+4.2%', status: 'green', trend: 'up' },
]

export const triggers = [
  { asset: 'BTC', currentPrice: 91500, triggerPrice: 60000, direction: 'below' },
  { asset: 'TSLA', currentPrice: 437, triggerPrice: 250, direction: 'below' },
]

// Calculate composite scores based on indicator statuses
// Weights: green=0, yellow=25, orange=50, red=100
// This gives a risk score from 0-100
export const calculateScore = (indicators) => {
  const weights = { green: 0, yellow: 25, orange: 50, red: 100 }
  const total = indicators.reduce((sum, ind) => sum + (weights[ind.status] || 0), 0)
  return Math.round(total / indicators.length)
}

// 18-Year Cycle: 3 yellow (XHB below 200d, XHB below 200w, Office REITs) out of 8
// Score = (3 * 25 + 5 * 0) / 8 = 75 / 8 = ~9
export const cycleScore = calculateScore(cycleIndicators)

// Recession: 3 yellow (ISM, LEI, Building Permits) out of 8
// Score = (3 * 25 + 5 * 0) / 8 = 75 / 8 = ~9
export const recessionScore = calculateScore(recessionIndicators)
