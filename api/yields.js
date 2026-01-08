// Vercel Serverless Function - Proxies requests to MASSIVE API
// API key is stored in Vercel Environment Variables (never exposed to client)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
  
  const API_KEY = process.env.MASSIVE_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Tickers we need to fetch
  const targetTickers = ['SATA', 'STRC', 'STRD', 'STRF'];
  
  // Fallback rates if API fails
  const fallbackRates = {
    SATA: 0.12,
    STRC: 0.10,
    STRD: 0.13,
    STRF: 0.0958
  };

  try {
    // Fetch data from MASSIVE API
    const url = `https://api.massive.com/stocks/financials/v1/ratios?limit=500&apiKey=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      throw new Error('Invalid API response');
    }

    // Find our target tickers in the results
    const yields = {};
    
    for (const ticker of targetTickers) {
      const found = data.results.find(r => r.ticker === ticker);
      if (found && found.dividend_yield !== undefined) {
        // dividend_yield from API is already a decimal (e.g., 0.12 for 12%)
        yields[ticker] = found.dividend_yield;
      } else {
        // Use fallback if ticker not found
        yields[ticker] = fallbackRates[ticker];
      }
    }

    // Add metadata
    yields.lastUpdated = new Date().toISOString();
    yields.source = 'MASSIVE API';

    res.status(200).json(yields);
  } catch (error) {
    console.error('API Error:', error.message);
    // Return fallback rates if API fails
    res.status(200).json({
      ...fallbackRates,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: error.message
    });
  }
}

