// Local development server with Yahoo Finance proxy
// Run with: node server.js

import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 5173;

  // Yahoo Finance proxy endpoint - MUST be defined before Vite middleware
  app.get('/api/yahoo', async (req, res) => {
    const { symbol, range = '2y', interval = '1d' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Missing symbol parameter' });
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
      res.json(data);
    } catch (error) {
      console.error('Yahoo Finance proxy error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Use Vite's connect instance as middleware AFTER API routes
  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`\n  Dev server running at http://localhost:${PORT}`);
    console.log(`  Yahoo Finance proxy at http://localhost:${PORT}/api/yahoo?symbol=XHB\n`);
  });
}

startServer();
