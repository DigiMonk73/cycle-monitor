// Vercel Serverless Function: BTC Price Proxy
// Uses multiple sources with fallbacks

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Try multiple sources
  const sources = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      parse: (data) => ({ bitcoin: { usd: data.bitcoin?.usd } })
    },
    {
      name: 'Coinbase',
      url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      parse: (data) => ({ bitcoin: { usd: parseFloat(data.data?.amount) } })
    },
    {
      name: 'Blockchain.info',
      url: 'https://blockchain.info/ticker',
      parse: (data) => ({ bitcoin: { usd: data.USD?.last } })
    }
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const result = source.parse(data);
        if (result.bitcoin?.usd) {
          return res.status(200).json(result);
        }
      }
    } catch (error) {
      console.warn(`${source.name} failed:`, error.message);
    }
  }

  res.status(500).json({ error: 'All BTC price sources failed' });
}
