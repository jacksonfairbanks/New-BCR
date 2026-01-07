module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');
  
  const API_KEY = process.env.MASSIVE_API_KEY;
  
  const targetTickers = ['SATA', 'STRC', 'STRD', 'STRF'];
  
  // Fallback rates
  const fallbackRates = {
    SATA: 0.12,
    STRC: 0.10,
    STRD: 0.13,
    STRF: 0.0958
  };

  if (!API_KEY) {
    return res.status(200).json({
      ...fallbackRates,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: 'API key not configured'
    });
  }

  try {
    const yields = {};
    const debug = {};
    
    // Query each ticker individually
    for (const ticker of targetTickers) {
      try {
        const url = `https://api.massive.com/stocks/financials/v1/ratios?ticker=${ticker}&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const stock = data.results[0];
          debug[ticker] = {
            found: true,
            dividend_yield: stock.dividend_yield,
            price: stock.price
          };
          
          // Use dividend_yield if available, otherwise fallback
          if (stock.dividend_yield && stock.dividend_yield > 0) {
            yields[ticker] = stock.dividend_yield;
          } else {
            yields[ticker] = fallbackRates[ticker];
          }
        } else {
          debug[ticker] = { found: false, response: data.status };
          yields[ticker] = fallbackRates[ticker];
        }
      } catch (tickerError) {
        debug[ticker] = { found: false, error: tickerError.message };
        yields[ticker] = fallbackRates[ticker];
      }
    }

    yields.lastUpdated = new Date().toISOString();
    yields.source = 'MASSIVE API';
    yields.debug = debug;
    
    res.status(200).json(yields);
  } catch (error) {
    res.status(200).json({
      ...fallbackRates,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: error.message
    });
  }
};
