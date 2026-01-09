/**
 * Data Fetcher Service
 * Fetches live market data from FRED, Yahoo Finance, and CoinGecko APIs
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

// Multiple CORS proxies to try (in order of preference)
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

// Historical reference values
const KRE_MARCH_2023_LOW = 35.42;

// Fallback values based on recent market data (January 2026)
// Used when all API fetches fail
const FALLBACK_DATA = {
  xhbPrice: 113.20,
  xhb200dMA: 103.50,
  xhb200wMA: 95.00,
  krePrice: 68.50,
  kre200dMA: 58.00,
  vix: 16.20,
  tslaPrice: 410.00,
  btcPrice: 94000,
  hySpread: 280,
  yieldSpread: 0.64,
  initialClaims: 208000,
  sahmRule: 0.35
};

// LocalStorage keys for caching
const CACHE_KEY = 'cycleMonitor_cachedData';
const CACHE_TIMESTAMP_KEY = 'cycleMonitor_cacheTimestamp';

/**
 * Get cached data from localStorage
 */
function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to cache data:', e);
  }
}

/**
 * Calculate simple moving average from price array
 * @param {number[]} prices - Array of prices (newest first or oldest first)
 * @param {number} period - Number of periods for MA
 * @returns {number} Moving average value
 */
export function calculateMovingAverage(prices, period) {
  if (!prices || prices.length < period) {
    return null;
  }
  // Take the most recent 'period' prices
  const relevantPrices = prices.slice(-period);
  const sum = relevantPrices.reduce((acc, price) => acc + price, 0);
  return sum / period;
}

/**
 * Fetch data from FRED API
 * Uses local proxy to avoid CORS issues
 * @param {string} series - FRED series ID
 * @returns {Promise<{value: number, date: string}>}
 */
export async function fetchFREDData(series) {
  // Try local proxy first (handles API key server-side)
  const localProxyUrl = `/api/fred?series=${series}`;

  try {
    const response = await fetch(localProxyUrl);
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }
    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      const obs = data.observations[0];
      return {
        value: parseFloat(obs.value),
        date: obs.date
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching FRED series ${series}:`, error);
    return null;
  }
}

/**
 * Fetch with CORS proxy fallback
 * Tries direct fetch first, then multiple proxies
 */
async function fetchWithProxy(targetUrl) {
  // First try direct fetch (works in some browsers/contexts)
  try {
    const response = await fetch(targetUrl, { mode: 'cors' });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn(`Direct fetch failed for ${targetUrl}, trying proxies...`);
  }

  // Try proxies
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(targetUrl);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const text = await response.text();
        // Check if response is valid JSON
        if (text.startsWith('{') || text.startsWith('[')) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.warn(`Proxy failed for ${targetUrl}:`, e.message);
    }
  }
  throw new Error('All fetch methods failed');
}

/**
 * Fetch stock/ETF data from Yahoo Finance
 * Uses local API proxy when deployed to Vercel, falls back to CORS proxies
 * @param {string} symbol - Stock symbol
 * @param {string} range - Data range (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max)
 * @param {string} interval - Data interval (1d, 1wk, 1mo)
 * @returns {Promise<{currentPrice: number, prices: number[], timestamps: number[]}>}
 */
export async function fetchYahooData(symbol, range = '2y', interval = '1d') {
  // Try local API proxy first (works when deployed to Vercel)
  const localProxyUrl = `/api/yahoo?symbol=${symbol}&range=${range}&interval=${interval}`;
  const directUrl = `${YAHOO_BASE_URL}/${symbol}?interval=${interval}&range=${range}`;

  let data = null;

  // Try local proxy first
  try {
    const response = await fetch(localProxyUrl);
    if (response.ok) {
      data = await response.json();
    }
  } catch (e) {
    console.warn('Local proxy not available, trying other methods...');
  }

  // Fall back to direct/CORS proxy methods
  if (!data) {
    try {
      data = await fetchWithProxy(directUrl);
    } catch (e) {
      console.error(`All fetch methods failed for ${symbol}`);
      return null;
    }
  }

  try {
    const result = data.chart?.result?.[0];
    if (!result) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];
    const closePrices = quotes?.close || [];

    // Filter out null values and get valid prices
    const validPrices = closePrices.filter(p => p !== null && !isNaN(p));

    // Current price is the last valid close or regular market price
    const currentPrice = result.meta?.regularMarketPrice || validPrices[validPrices.length - 1];

    return {
      currentPrice,
      prices: validPrices,
      timestamps,
      symbol: result.meta?.symbol
    };
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch BTC price from CoinGecko
 * Uses local proxy to avoid CORS/rate limit issues
 * @returns {Promise<number>}
 */
export async function fetchBTCPrice() {
  // Try local proxy first
  try {
    const response = await fetch('/api/btc');
    if (response.ok) {
      const data = await response.json();
      return data.bitcoin?.usd || null;
    }
  } catch (e) {
    console.warn('Local BTC proxy not available, trying direct...');
  }

  // Fallback to direct CoinGecko
  const url = `${COINGECKO_URL}?ids=bitcoin&vs_currencies=usd`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }
    const data = await response.json();
    return data.bitcoin?.usd || null;
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return null;
  }
}

/**
 * Determine status based on value comparison
 */
function getComparisonStatus(current, threshold, aboveIsGood = true) {
  if (aboveIsGood) {
    return current > threshold ? 'green' : 'yellow';
  }
  return current < threshold ? 'green' : 'yellow';
}

/**
 * Calculate 18-Year Cycle Risk Score (0-100)
 */
function calculateCycleScore(data) {
  let score = 0;

  // XHB below 200d MA: +10 points
  if (data.xhbPrice < data.xhb200dMA) score += 10;

  // XHB below 200w MA: +15 points
  if (data.xhbPrice < data.xhb200wMA) score += 15;

  // KRE below 200d MA: +10 points
  if (data.krePrice < data.kre200dMA) score += 10;

  // HY Spread > 400bp: +5, >500bp: +10, >600bp: +20
  const hySpread = data.hySpread;
  if (hySpread > 600) score += 20;
  else if (hySpread > 500) score += 10;
  else if (hySpread > 400) score += 5;

  // VIX > 25: +5, >35: +15, >50: +25
  const vix = data.vix;
  if (vix > 50) score += 25;
  else if (vix > 35) score += 15;
  else if (vix > 25) score += 5;

  // Office REITs stressed: +5 (hardcoded for now)
  score += 5;

  return Math.min(100, score);
}

/**
 * Calculate Recession Risk Score (0-100)
 */
function calculateRecessionScore(data) {
  let score = 0;

  // Sahm Rule > 0.3: +10, > 0.5: +30 (triggered)
  const sahmRule = data.sahmRule;
  if (sahmRule >= 0.5) score += 30;
  else if (sahmRule >= 0.3) score += 10;

  // Initial Claims > 250K: +5, >300K: +15, >350K: +25
  const claims = data.initialClaims;
  if (claims > 350000) score += 25;
  else if (claims > 300000) score += 15;
  else if (claims > 250000) score += 5;

  // ISM < 50: +5, < 47: +10, < 45: +20
  const ism = data.ismPMI;
  if (ism < 45) score += 20;
  else if (ism < 47) score += 10;
  else if (ism < 50) score += 5;

  // HY Spread scoring (same as cycle)
  const hySpread = data.hySpread;
  if (hySpread > 600) score += 20;
  else if (hySpread > 500) score += 10;
  else if (hySpread > 400) score += 5;

  // 2Y-10Y spread considerations
  // If recently un-inverted (positive), that's actually a warning sign historically
  // But for now, we treat positive spread as green
  const yieldSpread = data.yieldSpread;
  if (yieldSpread < 0) score += 15; // Still inverted

  return Math.min(100, score);
}

/**
 * Fetch all market indicators and calculate scores
 * @returns {Promise<Object>} Complete market data object
 */
export async function fetchAllIndicators() {
  const cached = getCachedData();
  // Use cached data if available, otherwise use hardcoded fallback
  const fallback = cached || FALLBACK_DATA;
  const errors = [];

  // Fetch all data in parallel
  const [
    xhbData,
    kreData,
    vixData,
    tslaData,
    btcPrice,
    hySpreadData,
    yieldSpreadData,
    claimsData,
    sahmData
  ] = await Promise.all([
    fetchYahooData('XHB', '5y', '1d'),
    fetchYahooData('KRE', '2y', '1d'),
    fetchYahooData('^VIX', '1mo', '1d'),
    fetchYahooData('TSLA', '1mo', '1d'),
    fetchBTCPrice(),
    fetchFREDData('BAMLH0A0HYM2'),
    fetchFREDData('T10Y2Y'),
    fetchFREDData('ICSA'),
    fetchFREDData('SAHMCURRENT')
  ]);

  // Process XHB data
  let xhbPrice = fallback.xhbPrice;
  let xhb200dMA = fallback.xhb200dMA;
  let xhb200wMA = fallback.xhb200wMA;

  if (xhbData) {
    xhbPrice = xhbData.currentPrice;
    xhb200dMA = calculateMovingAverage(xhbData.prices, 200) || xhb200dMA;
    // 200 week MA ≈ 1000 trading days
    xhb200wMA = calculateMovingAverage(xhbData.prices, 1000) || xhb200wMA;
  } else {
    errors.push('XHB');
  }

  // Process KRE data
  let krePrice = fallback.krePrice;
  let kre200dMA = fallback.kre200dMA;

  if (kreData) {
    krePrice = kreData.currentPrice;
    kre200dMA = calculateMovingAverage(kreData.prices, 200) || kre200dMA;
  } else {
    errors.push('KRE');
  }

  // Process VIX data
  let vix = fallback.vix;
  if (vixData) {
    vix = vixData.currentPrice;
  } else {
    errors.push('VIX');
  }

  // Process TSLA data
  let tslaPrice = fallback.tslaPrice;
  if (tslaData) {
    tslaPrice = tslaData.currentPrice;
  } else {
    errors.push('TSLA');
  }

  // Process BTC data
  let btc = fallback.btcPrice;
  if (btcPrice) {
    btc = btcPrice;
  } else {
    errors.push('BTC');
  }

  // Process FRED data
  let hySpread = fallback.hySpread;
  if (hySpreadData?.value) {
    hySpread = hySpreadData.value * 100; // Convert to basis points
  } else {
    errors.push('HY Spread');
  }

  let yieldSpread = fallback.yieldSpread;
  if (yieldSpreadData?.value) {
    yieldSpread = yieldSpreadData.value;
  } else {
    errors.push('Yield Spread');
  }

  let initialClaims = fallback.initialClaims;
  if (claimsData?.value) {
    initialClaims = claimsData.value; // ICSA is already the raw number (e.g., 208000)
  } else {
    errors.push('Initial Claims');
  }

  let sahmRule = fallback.sahmRule;
  if (sahmData?.value) {
    sahmRule = sahmData.value;
  } else {
    errors.push('Sahm Rule');
  }

  // Calculate derived values
  const xhbVs200d = xhbPrice > xhb200dMA ? 'Above' : 'Below';
  const xhbVs200dStatus = xhbPrice > xhb200dMA ? 'green' : 'yellow';

  const xhbVs200wPct = ((xhbPrice - xhb200wMA) / xhb200wMA * 100);
  const xhbVs200w = (xhbVs200wPct >= 0 ? '+' : '') + xhbVs200wPct.toFixed(1) + '%';
  const xhbVs200wStatus = xhbVs200wPct > 0 ? 'green' : 'yellow';

  const kreVs200d = krePrice > kre200dMA ? 'Above' : 'Below';
  const kreVs200dStatus = krePrice > kre200dMA ? 'green' : 'yellow';

  const kreVsLowPct = ((krePrice - KRE_MARCH_2023_LOW) / KRE_MARCH_2023_LOW * 100);
  const kreVsLow = '+' + kreVsLowPct.toFixed(0) + '%';
  const kreVsLowStatus = kreVsLowPct > 50 ? 'green' : 'yellow';

  const hySpreadFormatted = Math.round(hySpread) + 'bp';
  const hySpreadStatus = hySpread < 400 ? 'green' : hySpread < 500 ? 'yellow' : 'orange';

  const vixFormatted = vix.toFixed(1);
  const vixStatus = vix < 20 ? 'green' : vix < 30 ? 'yellow' : 'orange';

  // Yield spread (2Y-10Y)
  const yieldSpreadFormatted = (yieldSpread >= 0 ? '+' : '') + yieldSpread.toFixed(2) + '%';
  const yieldSpreadStatus = yieldSpread > 0 ? 'green' : 'yellow';

  // Initial claims
  const claimsFormatted = Math.round(initialClaims / 1000) + 'K';
  const claimsStatus = initialClaims < 250000 ? 'green' : initialClaims < 300000 ? 'yellow' : 'orange';

  // Sahm Rule
  const sahmFormatted = sahmRule.toFixed(2);
  const sahmStatus = sahmRule < 0.3 ? 'green' : sahmRule < 0.5 ? 'yellow' : 'red';

  // Triggers
  const btcTrigger = 60000;
  const btcDistance = ((btc - btcTrigger) / btc * 100);

  const tslaTrigger = 250;
  const tslaDistance = ((tslaPrice - tslaTrigger) / tslaPrice * 100);

  // Build the raw data object for score calculation
  const rawData = {
    xhbPrice,
    xhb200dMA,
    xhb200wMA,
    krePrice,
    kre200dMA,
    hySpread,
    vix,
    yieldSpread,
    initialClaims,
    sahmRule,
    ismPMI: 47.9 // Hardcoded for now - ISM doesn't have a free API
  };

  // Calculate scores
  const cycleScore = calculateCycleScore(rawData);
  const recessionScore = calculateRecessionScore(rawData);

  // Build final data structure
  const result = {
    cycleIndicators: [
      { name: 'XHB vs 200-day MA', value: xhbVs200d, status: xhbVs200dStatus, trend: xhbVs200dStatus === 'green' ? 'up' : 'down', hasError: errors.includes('XHB') },
      { name: 'XHB vs 200-week MA', value: xhbVs200w, status: xhbVs200wStatus, trend: xhbVs200wStatus === 'green' ? 'up' : 'down', hasError: errors.includes('XHB') },
      { name: 'KRE vs 200-day MA', value: kreVs200d, status: kreVs200dStatus, trend: kreVs200dStatus === 'green' ? 'up' : 'down', hasError: errors.includes('KRE') },
      { name: "KRE vs Mar '23 lows", value: kreVsLow, status: kreVsLowStatus, trend: 'up', hasError: errors.includes('KRE') },
      { name: 'HY Credit Spread', value: hySpreadFormatted, status: hySpreadStatus, trend: 'flat', hasError: errors.includes('HY Spread') },
      { name: 'Office REITs', value: 'Stressed', status: 'yellow', trend: 'down', hasError: false }, // Hardcoded
      { name: '% Stocks > 200d MA', value: '55%', status: 'green', trend: 'flat', hasError: false }, // Hardcoded - requires paid data
      { name: 'VIX', value: vixFormatted, status: vixStatus, trend: 'flat', hasError: errors.includes('VIX') },
    ],
    recessionIndicators: [
      { name: '2Y-10Y Spread', value: yieldSpreadFormatted, status: yieldSpreadStatus, trend: yieldSpread > 0 ? 'up' : 'down', hasError: errors.includes('Yield Spread') },
      { name: 'Initial Claims', value: claimsFormatted, status: claimsStatus, trend: 'flat', hasError: errors.includes('Initial Claims') },
      { name: 'Sahm Rule', value: sahmFormatted, status: sahmStatus, trend: 'flat', hasError: errors.includes('Sahm Rule') },
      { name: 'ISM Manufacturing', value: '47.9', status: 'yellow', trend: 'down', hasError: false }, // Hardcoded
      { name: 'LEI 6-mo Change', value: '-2.1%', status: 'yellow', trend: 'down', hasError: false }, // Hardcoded
      { name: 'HY Credit Spread', value: hySpreadFormatted, status: hySpreadStatus, trend: 'flat', hasError: errors.includes('HY Spread') },
      { name: 'Building Permits YoY', value: '-5%', status: 'yellow', trend: 'down', hasError: false }, // Hardcoded
      { name: 'Corp Profits YoY', value: '+4.2%', status: 'green', trend: 'up', hasError: false }, // Hardcoded
    ],
    triggers: [
      { asset: 'BTC', currentPrice: btc, triggerPrice: btcTrigger, direction: 'below', hasError: errors.includes('BTC') },
      { asset: 'TSLA', currentPrice: tslaPrice, triggerPrice: tslaTrigger, direction: 'below', hasError: errors.includes('TSLA') },
    ],
    cycleScore,
    recessionScore,
    rawData,
    errors,
    timestamp: new Date().toISOString()
  };

  // Cache the successful data
  setCachedData({
    xhbPrice,
    xhb200dMA,
    xhb200wMA,
    krePrice,
    kre200dMA,
    vix,
    tslaPrice,
    btcPrice: btc,
    hySpread,
    yieldSpread,
    initialClaims,
    sahmRule
  });

  return result;
}
