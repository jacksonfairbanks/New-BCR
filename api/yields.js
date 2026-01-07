module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60');
  
  const API_KEY = process.env.MASSIVE_API_KEY;
  
  // Par values and stated rates (fixed at issuance)
  const securities = {
    SATA: { par: 100, statedRate: 0.1225 },  // 12.25% at par
    STRC: { par: 100, statedRate: 0.11 },    // 11% at par
    STRD: { par: 100, statedRate: 0.10 },    // 10% at par
    STRF: { par: 100, statedRate: 0.10 }     // 10% at par
  };

  // Fallback prices (at par)
  const fallbackPrices = {
    SATA: 100,
    STRC: 100,
    STRD: 100,
    STRF: 100
  };

  if (!API_KEY) {
    // Return yields at par if no API key
    const yields = {};
    for (const ticker in securities) {
      yields[ticker] = securities[ticker].statedRate;
    }
    yields.lastUpdated = new Date().toISOString();
    yields.source = 'fallback (no API key)';
    return res.status(200).json(yields);
  }

  try {
    const yields = {};
    const prices = {};
    const debug = {};
    
    // Fetch current price for each ticker
    for (const ticker in securities) {
      try {
        const url = `https://api.massive.com/stocks/financials/v1/ratios?ticker=${ticker}&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const stock = data.results[0];
          const currentPrice = stock.price || fallbackPrices[ticker];
          prices[ticker] = currentPrice;
          
          // Calculate effective yield: (Par × Stated Rate) / Current Price
          const annualDividend = securities[ticker].par * securities[ticker].statedRate;
          const effectiveYield = annualDividend / currentPrice;
          
          yields[ticker] = Math.round(effectiveYield * 10000) / 10000; // Round to 4 decimals
          
          debug[ticker] = {
            found: true,
            price: currentPrice,
            annualDividend: annualDividend,
            effectiveYield: (effectiveYield * 100).toFixed(2) + '%'
          };
        } else {
          // Use par price as fallback
          prices[ticker] = fallbackPrices[ticker];
          yields[ticker] = securities[ticker].statedRate;
          debug[ticker] = { found: false, usingPar: true };
        }
      } catch (tickerError) {
        prices[ticker] = fallbackPrices[ticker];
        yields[ticker] = securities[ticker].statedRate;
        debug[ticker] = { found: false, error: tickerError.message };
      }
    }

    res.status(200).json({
      ...yields,
      prices: prices,
      lastUpdated: new Date().toISOString(),
      source: 'MASSIVE API (calculated from price)',
      debug: debug
    });
  } catch (error) {
    // Return yields at par on error
    const yields = {};
    for (const ticker in securities) {
      yields[ticker] = securities[ticker].statedRate;
    }
    yields.lastUpdated = new Date().toISOString();
    yields.source = 'fallback';
    yields.error = error.message;
    res.status(200).json(yields);
  }
};
