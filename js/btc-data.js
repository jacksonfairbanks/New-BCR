/* ========================================
   BTC Price Data - Single Source of Truth
   ========================================
   
   CURRENT: Uses embedded static data
   FUTURE:  Easy to swap for API call
   
   All pages should use:
   - window.BTC_PRICES (array of {date, price})
   - window.getBTCData() (returns promise)
   ======================================== */

// Data status
let BTC_DATA_READY = false;
let BTC_DATA_SOURCE = 'embedded';

// The data array - will be populated on load
let BTC_PRICES = [];

/* ----------------------------------------
   FUTURE API IMPLEMENTATION
   ----------------------------------------
   To switch to live data, uncomment this and comment out loadEmbeddedData():
   
   async function loadFromAPI() {
       const response = await fetch('/api/btc-prices');
       const result = await response.json();
       if (result.success) {
           BTC_PRICES = result.data;
           BTC_DATA_SOURCE = 'api';
           return true;
       }
       return false;
   }
   ---------------------------------------- */

// Load embedded data (current implementation)
function loadEmbeddedData() {
    // Data is embedded below - generated from data/btc-prices.json
    // Format: [{date: "YYYY-MM-DD", price: number}, ...]
    BTC_PRICES = EMBEDDED_BTC_DATA;
    BTC_DATA_SOURCE = 'embedded';
    BTC_DATA_READY = true;
    console.log(`[BTC Data] Loaded ${BTC_PRICES.length} days (${BTC_PRICES[0].date} to ${BTC_PRICES[BTC_PRICES.length-1].date})`);
    return true;
}

// Main getter - returns promise for future API compatibility
async function getBTCData() {
    if (BTC_DATA_READY) {
        return BTC_PRICES;
    }
    
    /* FUTURE: Try API first
    if (await loadFromAPI()) {
        BTC_DATA_READY = true;
        return BTC_PRICES;
    }
    */
    
    // Use embedded data
    loadEmbeddedData();
    return BTC_PRICES;
}

// Utility: Get data filtered by date range
function getBTCDataInRange(startDate, endDate) {
    return BTC_PRICES.filter(d => d.date >= startDate && d.date <= endDate);
}

// Utility: Get latest price
function getLatestBTCPrice() {
    return BTC_PRICES.length > 0 ? BTC_PRICES[BTC_PRICES.length - 1] : null;
}

// Utility: Get data status
function getBTCDataStatus() {
    return {
        ready: BTC_DATA_READY,
        source: BTC_DATA_SOURCE,
        count: BTC_PRICES.length,
        startDate: BTC_PRICES[0]?.date,
        endDate: BTC_PRICES[BTC_PRICES.length - 1]?.date
    };
}

// Export to window
if (typeof window !== 'undefined') {
    window.BTC_PRICES = BTC_PRICES;
    window.getBTCData = getBTCData;
    window.getBTCDataInRange = getBTCDataInRange;
    window.getLatestBTCPrice = getLatestBTCPrice;
    window.getBTCDataStatus = getBTCDataStatus;
    
    // Auto-load on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            getBTCData().then(() => {
                window.BTC_PRICES = BTC_PRICES;
            });
        });
    } else {
        getBTCData().then(() => {
            window.BTC_PRICES = BTC_PRICES;
        });
    }
}

/* ========================================
   EMBEDDED DATA
   Generated from data/btc-prices.json
   To update: run convert_to_standard.py
   ======================================== */
const EMBEDDED_BTC_DATA = PLACEHOLDER_DATA;
