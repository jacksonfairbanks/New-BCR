import json

# Read the JSON data
with open('data/btc-prices.json', 'r') as f:
    data = json.load(f)

# JS file - DATA FIRST, then code that uses it
js_content = """/* BTC Price Data - Single Source of Truth */

// EMBEDDED DATA (must be first!)
const EMBEDDED_DATA = """ + json.dumps(data, separators=(',', ':')) + """;

// Data arrays
let BTC_PRICES = [];
let BTC_RAW_DATA = [];
let BTC_DATA_READY = false;

// Convert standard date to compact format (DD-Mon-YY)
function toCompactDate(isoDate) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(isoDate + 'T00:00:00');
    return d.getDate() + '-' + months[d.getMonth()] + '-' + String(d.getFullYear()).slice(2);
}

// Load the embedded data
function loadData() {
    BTC_PRICES = EMBEDDED_DATA;
    // Create legacy format for backward compatibility
    BTC_RAW_DATA = BTC_PRICES.map(p => ({d: toCompactDate(p.date), c: p.price}));
    BTC_DATA_READY = true;
    console.log('[BTC Data] Loaded ' + BTC_PRICES.length + ' days (' + BTC_PRICES[0].date + ' to ' + BTC_PRICES[BTC_PRICES.length-1].date + ')');
}

// Initialize immediately
loadData();

// Export to window
if (typeof window !== 'undefined') {
    window.BTC_PRICES = BTC_PRICES;
    window.BTC_RAW_DATA = BTC_RAW_DATA;
    window.BTC_DATA_READY = BTC_DATA_READY;
}
"""

with open('js/btc-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Created js/btc-data.js')
print(f'- {len(data)} price records')
print(f'- Date range: {data[0]["date"]} to {data[-1]["date"]}')
print(f'- File size: {len(js_content):,} bytes')
