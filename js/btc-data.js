/* ========================================
   BTC Price Data - Shared across all pages
   Priority: 1) Vercel API (MASSIVE), 2) CoinGecko, 3) Embedded data
   ======================================== */

// Global data variable
let BTC_RAW_DATA = [];
let BTC_DATA_LOADED = false;
let BTC_DATA_SOURCE = 'loading';

// Try our Vercel serverless API first (uses MASSIVE API key)
async function fetchFromVercelAPI() {
    try {
        console.log('[BTC Data] Trying Vercel API (MASSIVE)...');
        
        const response = await fetch('/api/btc-prices');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 100) {
            // Transform to compact format for consistency
            BTC_RAW_DATA = result.data.map(item => ({
                d: formatCompactDate(item.date),
                c: item.price
            }));
            BTC_DATA_SOURCE = `api-${result.source}`;
            console.log(`[BTC Data] Loaded ${result.data.length} days from ${result.source} via API`);
            return true;
        }
        
        throw new Error('Insufficient data from API');
        
    } catch (error) {
        console.warn(`[BTC Data] Vercel API failed: ${error.message}`);
        return false;
    }
}

// Fallback to CoinGecko directly
async function fetchFromCoinGecko() {
    try {
        console.log('[BTC Data] Trying CoinGecko directly...');
        
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        const prices = data.prices
            .map(([timestamp, price]) => ({
                date: new Date(timestamp).toISOString().split('T')[0],
                price: Math.round(price * 100) / 100
            }))
            .filter(p => p.date >= '2014-01-01');
        
        if (prices.length > 100) {
            // Transform to compact format
            BTC_RAW_DATA = prices.map(item => ({
                d: formatCompactDate(item.date),
                c: item.price
            }));
            BTC_DATA_SOURCE = 'coingecko';
            console.log(`[BTC Data] Loaded ${prices.length} days from CoinGecko`);
            return true;
        }
        
        throw new Error('Insufficient data');
        
    } catch (error) {
        console.warn(`[BTC Data] CoinGecko failed: ${error.message}`);
        return false;
    }
}

// Format date to compact format (e.g., "17-Sep-14")
function formatCompactDate(dateStr) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
}

// Load from localStorage cache
function loadFromCache() {
    try {
        const cached = localStorage.getItem('btc_price_cache_v2');
        if (cached) {
            const { data, timestamp, source } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (age < maxAge && data.length > 1000) {
                BTC_RAW_DATA = data;
                BTC_DATA_SOURCE = `cache-${source}`;
                console.log(`[BTC Data] Loaded ${data.length} days from cache (${Math.round(age/3600000)}h old, source: ${source})`);
                return true;
            }
        }
    } catch (e) {
        console.warn('[BTC Data] Cache read error:', e);
    }
    return false;
}

// Save to localStorage cache
function saveToCache() {
    try {
        localStorage.setItem('btc_price_cache_v2', JSON.stringify({
            data: BTC_RAW_DATA,
            timestamp: Date.now(),
            source: BTC_DATA_SOURCE
        }));
        console.log('[BTC Data] Saved to cache');
    } catch (e) {
        console.warn('[BTC Data] Cache write error:', e);
    }
}

// Check for embedded data from btc_data.js file
function loadEmbeddedFallback() {
    // Check for the compact format array
    if (typeof window.BTC_RAW_DATA !== 'undefined' && window.BTC_RAW_DATA.length > 1000) {
        BTC_RAW_DATA = window.BTC_RAW_DATA;
        BTC_DATA_SOURCE = 'embedded';
        console.log(`[BTC Data] Loaded ${BTC_RAW_DATA.length} days from embedded data`);
        return true;
    }
    // Check for converted format
    if (typeof window._EMBEDDED_BTC_DATA !== 'undefined' && window._EMBEDDED_BTC_DATA.length > 1000) {
        BTC_RAW_DATA = window._EMBEDDED_BTC_DATA.map(x => ({
            d: formatCompactDate(x.date),
            c: x.price
        }));
        BTC_DATA_SOURCE = 'embedded-converted';
        console.log(`[BTC Data] Loaded ${BTC_RAW_DATA.length} days from embedded data (converted)`);
        return true;
    }
    return false;
}

// Main initialization function
async function initBTCData() {
    if (BTC_DATA_LOADED && BTC_RAW_DATA.length > 100) return BTC_RAW_DATA;
    
    // Try loading from cache first (fastest)
    if (loadFromCache()) {
        BTC_DATA_LOADED = true;
        // Update global reference
        if (typeof window !== 'undefined') {
            window.BTC_RAW_DATA = BTC_RAW_DATA;
        }
        // Still fetch fresh data in background
        refreshDataInBackground();
        return BTC_RAW_DATA;
    }
    
    // Try Vercel API (MASSIVE)
    if (await fetchFromVercelAPI()) {
        saveToCache();
        BTC_DATA_LOADED = true;
        if (typeof window !== 'undefined') {
            window.BTC_RAW_DATA = BTC_RAW_DATA;
        }
        return BTC_RAW_DATA;
    }
    
    // Try CoinGecko directly
    if (await fetchFromCoinGecko()) {
        saveToCache();
        BTC_DATA_LOADED = true;
        if (typeof window !== 'undefined') {
            window.BTC_RAW_DATA = BTC_RAW_DATA;
        }
        return BTC_RAW_DATA;
    }
    
    // Try embedded fallback
    if (loadEmbeddedFallback()) {
        BTC_DATA_LOADED = true;
        if (typeof window !== 'undefined') {
            window.BTC_RAW_DATA = BTC_RAW_DATA;
        }
        return BTC_RAW_DATA;
    }
    
    // Last resort: return empty (pages should handle this)
    console.error('[BTC Data] Failed to load any BTC data');
    BTC_DATA_LOADED = true;
    BTC_DATA_SOURCE = 'none';
    return BTC_RAW_DATA;
}

// Refresh data in background
async function refreshDataInBackground() {
    // Try to get fresh data without blocking
    const success = await fetchFromVercelAPI() || await fetchFromCoinGecko();
    if (success) {
        saveToCache();
        if (typeof window !== 'undefined') {
            window.BTC_RAW_DATA = BTC_RAW_DATA;
        }
    }
}

// Wait for data to be ready (for pages that need it immediately)
function waitForBTCData(timeout = 15000) {
    return new Promise((resolve, reject) => {
        if (BTC_DATA_LOADED && BTC_RAW_DATA.length > 100) {
            resolve(BTC_RAW_DATA);
            return;
        }
        
        const start = Date.now();
        const check = () => {
            if (BTC_DATA_LOADED && BTC_RAW_DATA.length > 100) {
                resolve(BTC_RAW_DATA);
            } else if (Date.now() - start > timeout) {
                reject(new Error('BTC data load timeout'));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Get data status
function getBTCDataStatus() {
    return {
        loaded: BTC_DATA_LOADED,
        source: BTC_DATA_SOURCE,
        count: BTC_RAW_DATA.length,
        startDate: BTC_RAW_DATA[0]?.d,
        endDate: BTC_RAW_DATA[BTC_RAW_DATA.length - 1]?.d
    };
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.BTC_RAW_DATA = BTC_RAW_DATA;
    window.initBTCData = initBTCData;
    window.waitForBTCData = waitForBTCData;
    window.getBTCDataStatus = getBTCDataStatus;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initBTCData());
    } else {
        initBTCData();
    }
}
