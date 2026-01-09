// Vercel Serverless Function: FRED API Proxy
// This keeps the API key secure on the server-side

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { series } = req.query;

  if (!series) {
    return res.status(400).json({ error: 'Series parameter is required' });
  }

  const apiKey = process.env.VITE_FRED_API_KEY || process.env.FRED_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'FRED API key not configured' });
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FRED API returned ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('FRED proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
