// Vercel Serverless Function - Fetches BTC historical prices
// Uses MASSIVE API (primary) with CoinGecko as fallback

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400'); // Cache 1 hour
    
    const MASSIVE_API_KEY = process.env.MASSIVE_API_KEY;
    
    // Calculate date range (from 2014 to today)
    const startDate = '2014-01-01';
    const today = new Date().toISOString().split('T')[0];
    
    try {
        let prices = [];
        let source = '';
        
        // Try MASSIVE API first (if key is available)
        if (MASSIVE_API_KEY) {
            try {
                console.log('[BTC Prices] Trying MASSIVE API...');
                
                // MASSIVE crypto aggregates endpoint for daily BTC data
                const massiveUrl = `https://api.massive.com/crypto/aggregates/BTC/1/day/${startDate}/${today}?apiKey=${MASSIVE_API_KEY}`;
                
                const massiveResponse = await fetch(massiveUrl, {
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!massiveResponse.ok) {
                    throw new Error(`MASSIVE API returned ${massiveResponse.status}`);
                }
                
                const massiveData = await massiveResponse.json();
                
                if (massiveData.status === 'OK' && massiveData.results && massiveData.results.length > 100) {
                    prices = massiveData.results.map(item => ({
                        date: new Date(item.t).toISOString().split('T')[0],
                        price: Math.round(item.c * 100) / 100 // closing price
                    }));
                    source = 'MASSIVE';
                    console.log(`[BTC Prices] MASSIVE API returned ${prices.length} days`);
                } else {
                    throw new Error('Insufficient data from MASSIVE API');
                }
                
            } catch (massiveError) {
                console.warn('[BTC Prices] MASSIVE API failed:', massiveError.message);
                // Continue to fallback
            }
        }
        
        // Fallback to CoinGecko if MASSIVE failed
        if (prices.length === 0) {
            console.log('[BTC Prices] Using CoinGecko fallback...');
            
            const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily';
            
            const coingeckoResponse = await fetch(coingeckoUrl, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!coingeckoResponse.ok) {
                throw new Error(`CoinGecko API returned ${coingeckoResponse.status}`);
            }
            
            const coingeckoData = await coingeckoResponse.json();
            
            prices = coingeckoData.prices.map(([timestamp, price]) => ({
                date: new Date(timestamp).toISOString().split('T')[0],
                price: Math.round(price * 100) / 100
            })).filter(p => p.date >= '2014-01-01');
            
            source = 'CoinGecko';
            console.log(`[BTC Prices] CoinGecko returned ${prices.length} days`);
        }
        
        if (prices.length < 100) {
            throw new Error('Insufficient BTC price data from all sources');
        }
        
        // Sort by date
        prices.sort((a, b) => a.date.localeCompare(b.date));
        
        res.status(200).json({
            success: true,
            count: prices.length,
            lastUpdated: new Date().toISOString(),
            source: source,
            dateRange: {
                start: prices[0].date,
                end: prices[prices.length - 1].date
            },
            data: prices
        });
        
    } catch (error) {
        console.error('[BTC Prices] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
