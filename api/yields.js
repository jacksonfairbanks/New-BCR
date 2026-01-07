module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');
  
  const API_KEY = process.env.MASSIVE_API_KEY;
  
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
    const url = 'https://api.massive.com/stocks/financials/v1/ratios?limit=500&apiKey=' + API_KEY;
    const response = await fetch(url);
    const data = await response.json();
    
    const yields = {};
    const targetTickers = ['SATA', 'STRC', 'STRD', 'STRF'];
    
    for (var i = 0; i < targetTickers.length; i++) {
      var ticker = targetTickers[i];
      var found = null;
      if (data.results) {
        for (var j = 0; j < data.results.length; j++) {
          if (data.results[j].ticker === ticker) {
            found = data.results[j];
            break;
          }
        }
      }
      yields[ticker] = found && found.dividend_yield ? found.dividend_yield : fallbackRates[ticker];
    }

    yields.lastUpdated = new Date().toISOString();
    yields.source = 'MASSIVE API';
    
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
