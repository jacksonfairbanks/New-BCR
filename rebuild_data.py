import json

# Read the JSON data
with open('data/btc-prices.json', 'r') as f:
    data = json.load(f)

# JS file header
js_header = """/* BTC Price Data - Single Source of Truth */

let BTC_PRICES = [];
let BTC_RAW_DATA = [];
let BTC_DATA_READY = false;

function toCompactDate(isoDate) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(isoDate);
    return d.getDate() + '-' + months[d.getMonth()] + '-' + String(d.getFullYear()).slice(2);
}

function loadEmbeddedData() {
    BTC_PRICES = EMBEDDED_DATA;
    BTC_RAW_DATA = BTC_PRICES.map(p => ({d: toCompactDate(p.date), c: p.price}));
    BTC_DATA_READY = true;
    console.log('[BTC Data] Loaded ' + BTC_PRICES.length + ' days');
}

if (typeof window !== 'undefined') {
    loadEmbeddedData();
    window.BTC_PRICES = BTC_PRICES;
    window.BTC_RAW_DATA = BTC_RAW_DATA;
}

const EMBEDDED_DATA = """

# Create the JS file
js_content = js_header + json.dumps(data, separators=(',', ':')) + ';'

with open('js/btc-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Created js/btc-data.js')
print(f'- {len(data)} price records')
print(f'- Date range: {data[0]["date"]} to {data[-1]["date"]}')
print(f'- File size: {len(js_content):,} bytes')

