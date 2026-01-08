// Vercel Serverless Function - Fetches BTC historical prices
// Uses MASSIVE API (if available) or CoinGecko as fallback

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    const MASSIVE_API_KEY = process.env.MASSIVE_API_KEY;
    
    try {
        // Try CoinGecko first (free, reliable for BTC data)
        const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily';
        
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform to our format
        const prices = data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp).toISOString().split('T')[0],
            price: Math.round(price * 100) / 100
        })).filter(p => p.date >= '2014-01-01');
        
        res.status(200).json({
            success: true,
            count: prices.length,
            lastUpdated: new Date().toISOString(),
            source: 'CoinGecko',
            data: prices
        });
        
    } catch (error) {
        console.error('BTC price fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
