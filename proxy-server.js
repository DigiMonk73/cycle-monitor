// Standalone proxy server for Yahoo Finance and FRED API
// Run with: node proxy-server.js

import http from 'http';

const PORT = 3001;
const FRED_API_KEY = process.env.VITE_FRED_API_KEY || 'c0a62966664018a971003321d86da42f';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Yahoo Finance proxy
  if (url.pathname === '/api/yahoo') {
    const symbol = url.searchParams.get('symbol');
    const range = url.searchParams.get('range') || '2y';
    const interval = url.searchParams.get('interval') || '1d';

    if (!symbol) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing symbol parameter' }));
      return;
    }

    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

    try {
      const response = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance returned ${response.status}`);
      }

      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Yahoo Finance proxy error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // FRED API proxy
  if (url.pathname === '/api/fred') {
    const series = url.searchParams.get('series');

    if (!series) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing series parameter' }));
      return;
    }

    const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;

    try {
      const response = await fetch(fredUrl);

      if (!response.ok) {
        throw new Error(`FRED API returned ${response.status}`);
      }

      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('FRED API proxy error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // CoinGecko BTC price proxy
  if (url.pathname === '/api/btc') {
    const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

    try {
      const response = await fetch(coingeckoUrl);
      if (!response.ok) {
        throw new Error(`CoinGecko returned ${response.status}`);
      }
      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('CoinGecko proxy error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`  - Yahoo: /api/yahoo?symbol=XHB`);
  console.log(`  - FRED:  /api/fred?series=T10Y2Y`);
  console.log(`  - BTC:   /api/btc`);
});
