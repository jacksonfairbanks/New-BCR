// Vercel Serverless Function - Fetches BTC historical prices
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600');
  
  const MASSIVE_API_KEY = process.env.MASSIVE_API_KEY;
  const startDate = '2014-01-01';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    let prices = [];
    let source = 'none';
    
    // Try MASSIVE API first
    if (MASSIVE_API_KEY) {
      try {
        const url = `https://api.massive.com/crypto/aggregates/BTC/1/day/${startDate}/${today}?apiKey=${MASSIVE_API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK' && data.results?.length > 100) {
            prices = data.results.map(item => ({
              date: new Date(item.t).toISOString().split('T')[0],
              price: Math.round(item.c * 100) / 100
            }));
            source = 'MASSIVE';
          }
        }
      } catch (e) {
        console.log('MASSIVE failed:', e.message);
      }
    }
    
    // Fallback to CoinGecko
    if (prices.length === 0) {
      const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily';
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        prices = data.prices.map(([t, p]) => ({
          date: new Date(t).toISOString().split('T')[0],
          price: Math.round(p * 100) / 100
        })).filter(p => p.date >= '2014-01-01');
        source = 'CoinGecko';
      }
    }
    
    res.status(200).json({
      success: true,
      count: prices.length,
      source: source,
      data: prices
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
