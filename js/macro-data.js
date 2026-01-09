/* ========================================
   Macro Data - S&P 500, Gold, DXY, 10Y Yield
   ========================================
   
   CURRENT: Uses embedded static data
   FUTURE:  Easy to swap for API call (Yahoo Finance, FRED, etc.)
   
   All pages should use:
   - window.MACRO_DATA (object with arrays)
   - window.getMacroData() (returns promise)
   ======================================== */

// Data status
let MACRO_DATA_READY = false;
let MACRO_DATA_SOURCE = 'embedded';

// The data object - will be populated on load
let MACRO_DATA = null;

/* ----------------------------------------
   FUTURE API IMPLEMENTATION
   ----------------------------------------
   To switch to live data, implement:
   
   async function loadFromAPI() {
       // Yahoo Finance or FRED API calls
       const sp500 = await fetch('/api/macro/sp500');
       const gold = await fetch('/api/macro/gold');
       // etc.
   }
   ---------------------------------------- */

// Embedded historical data (monthly samples for size efficiency)
// Full daily data would be ~4000 rows x 4 assets = 16000 data points
// Using monthly for embedded, can switch to daily via API

const EMBEDDED_MACRO_DATA = {
    // Dates aligned with first of each month (YYYY-MM-DD format)
    dates: [
        "2014-01-01", "2014-02-01", "2014-03-01", "2014-04-01", "2014-05-01", "2014-06-01",
        "2014-07-01", "2014-08-01", "2014-09-01", "2014-10-01", "2014-11-01", "2014-12-01",
        "2015-01-01", "2015-02-01", "2015-03-01", "2015-04-01", "2015-05-01", "2015-06-01",
        "2015-07-01", "2015-08-01", "2015-09-01", "2015-10-01", "2015-11-01", "2015-12-01",
        "2016-01-01", "2016-02-01", "2016-03-01", "2016-04-01", "2016-05-01", "2016-06-01",
        "2016-07-01", "2016-08-01", "2016-09-01", "2016-10-01", "2016-11-01", "2016-12-01",
        "2017-01-01", "2017-02-01", "2017-03-01", "2017-04-01", "2017-05-01", "2017-06-01",
        "2017-07-01", "2017-08-01", "2017-09-01", "2017-10-01", "2017-11-01", "2017-12-01",
        "2018-01-01", "2018-02-01", "2018-03-01", "2018-04-01", "2018-05-01", "2018-06-01",
        "2018-07-01", "2018-08-01", "2018-09-01", "2018-10-01", "2018-11-01", "2018-12-01",
        "2019-01-01", "2019-02-01", "2019-03-01", "2019-04-01", "2019-05-01", "2019-06-01",
        "2019-07-01", "2019-08-01", "2019-09-01", "2019-10-01", "2019-11-01", "2019-12-01",
        "2020-01-01", "2020-02-01", "2020-03-01", "2020-04-01", "2020-05-01", "2020-06-01",
        "2020-07-01", "2020-08-01", "2020-09-01", "2020-10-01", "2020-11-01", "2020-12-01",
        "2021-01-01", "2021-02-01", "2021-03-01", "2021-04-01", "2021-05-01", "2021-06-01",
        "2021-07-01", "2021-08-01", "2021-09-01", "2021-10-01", "2021-11-01", "2021-12-01",
        "2022-01-01", "2022-02-01", "2022-03-01", "2022-04-01", "2022-05-01", "2022-06-01",
        "2022-07-01", "2022-08-01", "2022-09-01", "2022-10-01", "2022-11-01", "2022-12-01",
        "2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01", "2023-05-01", "2023-06-01",
        "2023-07-01", "2023-08-01", "2023-09-01", "2023-10-01", "2023-11-01", "2023-12-01",
        "2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01", "2024-06-01",
        "2024-07-01", "2024-08-01", "2024-09-01", "2024-10-01", "2024-11-01", "2024-12-01",
        "2025-01-01"
    ],
    
    // S&P 500 monthly close prices
    sp500: [
        1782, 1859, 1872, 1884, 1924, 1960, 1931, 2003, 1972, 2018, 2068, 2059,
        1995, 2105, 2068, 2086, 2107, 2063, 2103, 1972, 1920, 2079, 2080, 2044,
        1940, 1932, 2060, 2065, 2097, 2099, 2174, 2171, 2168, 2126, 2198, 2239,
        2279, 2364, 2363, 2384, 2412, 2423, 2470, 2472, 2519, 2575, 2648, 2674,
        2824, 2714, 2641, 2648, 2705, 2718, 2816, 2902, 2914, 2712, 2760, 2507,
        2704, 2784, 2834, 2946, 2752, 2942, 2980, 2926, 2977, 3038, 3141, 3231,
        3226, 3225, 2585, 2912, 3044, 3100, 3271, 3500, 3363, 3270, 3622, 3756,
        3714, 3811, 3973, 4181, 4204, 4298, 4395, 4523, 4307, 4605, 4567, 4766,
        4516, 4374, 4530, 4132, 4132, 3785, 4130, 4158, 3586, 3872, 4080, 3840,
        4077, 4119, 4109, 4169, 4179, 4450, 4589, 4508, 4288, 4194, 4568, 4770,
        4845, 5096, 5254, 5035, 5278, 5460, 5522, 5648, 5762, 5705, 6032, 5881,
        6040
    ],
    
    // Gold price (USD per oz)
    gold: [
        1251, 1326, 1295, 1289, 1289, 1322, 1282, 1287, 1217, 1172, 1176, 1184,
        1279, 1213, 1187, 1175, 1191, 1172, 1095, 1134, 1114, 1142, 1065, 1060,
        1118, 1234, 1237, 1289, 1215, 1322, 1351, 1311, 1317, 1277, 1173, 1152,
        1210, 1235, 1249, 1268, 1263, 1242, 1269, 1288, 1282, 1271, 1275, 1303,
        1345, 1318, 1325, 1316, 1298, 1253, 1223, 1201, 1192, 1215, 1222, 1282,
        1321, 1313, 1292, 1284, 1305, 1409, 1428, 1520, 1473, 1513, 1464, 1517,
        1593, 1586, 1577, 1694, 1730, 1771, 1976, 1970, 1887, 1879, 1777, 1898,
        1847, 1742, 1708, 1769, 1796, 1770, 1812, 1814, 1757, 1784, 1867, 1829,
        1797, 1909, 1942, 1897, 1848, 1807, 1739, 1711, 1661, 1633, 1768, 1824,
        1928, 1827, 1969, 1983, 1963, 1929, 1960, 1966, 1849, 1994, 2038, 2063,
        2039, 2044, 2160, 2286, 2327, 2331, 2430, 2503, 2634, 2659, 2745, 2623,
        2798
    ],
    
    // DXY (US Dollar Index)
    dxy: [
        80.6, 80.0, 80.2, 79.5, 80.4, 79.8, 81.0, 82.5, 85.9, 87.3, 88.4, 90.3,
        94.8, 95.3, 97.7, 95.0, 97.1, 95.4, 96.2, 96.2, 95.9, 97.3, 100.1, 98.7,
        99.6, 98.2, 94.6, 93.0, 95.9, 96.1, 95.5, 95.9, 95.4, 98.3, 101.5, 102.2,
        100.5, 101.1, 100.4, 99.0, 97.3, 96.2, 93.4, 92.6, 93.1, 94.6, 93.1, 92.1,
        89.1, 90.6, 89.4, 91.8, 93.9, 94.5, 94.2, 96.2, 95.1, 97.2, 97.0, 96.2,
        95.6, 96.1, 97.3, 97.5, 97.8, 96.8, 98.3, 98.9, 99.4, 97.3, 98.3, 96.4,
        97.4, 98.0, 99.0, 99.8, 98.9, 97.4, 93.5, 92.2, 94.0, 93.9, 91.9, 89.9,
        90.5, 90.9, 93.2, 94.0, 94.1, 95.7, 92.4, 93.0, 98.3, 93.3, 96.2, 95.7,
        96.5, 97.7, 98.4, 103.2, 101.8, 104.7, 105.8, 108.7, 111.6, 111.5, 105.2, 103.5,
        102.0, 103.1, 102.5, 101.8, 104.3, 103.4, 99.9, 103.6, 106.2, 106.7, 103.4, 101.3,
        103.3, 104.2, 104.5, 106.1, 104.6, 105.9, 104.1, 101.7, 100.8, 103.8, 106.2, 108.0,
        109.5
    ],
    
    // 10-Year Treasury Yield (%)
    rates: [
        2.86, 2.71, 2.72, 2.65, 2.48, 2.53, 2.56, 2.34, 2.49, 2.34, 2.33, 2.17,
        1.68, 2.00, 1.93, 1.94, 2.12, 2.35, 2.20, 2.17, 2.17, 2.07, 2.26, 2.27,
        1.92, 1.73, 1.77, 1.83, 1.85, 1.47, 1.45, 1.56, 1.60, 1.83, 2.14, 2.45,
        2.45, 2.39, 2.40, 2.29, 2.21, 2.30, 2.29, 2.12, 2.33, 2.38, 2.42, 2.41,
        2.72, 2.86, 2.74, 2.87, 2.83, 2.85, 2.96, 2.86, 3.06, 3.15, 3.01, 2.68,
        2.63, 2.72, 2.41, 2.50, 2.12, 2.00, 2.02, 1.50, 1.68, 1.69, 1.78, 1.92,
        1.51, 1.13, 0.70, 0.64, 0.65, 0.66, 0.55, 0.72, 0.68, 0.88, 0.84, 0.93,
        1.07, 1.44, 1.74, 1.63, 1.58, 1.45, 1.22, 1.31, 1.52, 1.55, 1.44, 1.51,
        1.79, 1.83, 2.32, 2.93, 2.85, 2.98, 2.89, 3.19, 3.83, 4.05, 3.61, 3.88,
        3.52, 3.92, 3.47, 3.44, 3.64, 3.84, 3.96, 4.09, 4.57, 4.93, 4.33, 3.88,
        3.91, 4.25, 4.20, 4.68, 4.50, 4.40, 4.09, 3.90, 3.81, 4.28, 4.17, 4.58,
        4.65
    ]
};

// Interpolate monthly data to daily (for correlation calculations)
function interpolateToDaily(monthlyData, btcDates) {
    const dailyData = {
        sp500: [],
        gold: [],
        dxy: [],
        rates: []
    };
    
    const monthlyDates = monthlyData.dates.map(d => new Date(d));
    
    for (const btcDate of btcDates) {
        const date = typeof btcDate === 'string' ? new Date(btcDate) : btcDate;
        
        // Find the two surrounding monthly data points
        let beforeIdx = 0;
        for (let i = 0; i < monthlyDates.length - 1; i++) {
            if (monthlyDates[i] <= date && monthlyDates[i + 1] > date) {
                beforeIdx = i;
                break;
            }
            if (i === monthlyDates.length - 2) {
                beforeIdx = i;
            }
        }
        
        const afterIdx = Math.min(beforeIdx + 1, monthlyDates.length - 1);
        
        // Linear interpolation
        const beforeDate = monthlyDates[beforeIdx];
        const afterDate = monthlyDates[afterIdx];
        const totalDays = (afterDate - beforeDate) / (1000 * 60 * 60 * 24);
        const daysSince = (date - beforeDate) / (1000 * 60 * 60 * 24);
        const t = totalDays > 0 ? daysSince / totalDays : 0;
        
        for (const asset of ['sp500', 'gold', 'dxy', 'rates']) {
            const beforeVal = monthlyData[asset][beforeIdx];
            const afterVal = monthlyData[asset][afterIdx];
            const interpolated = beforeVal + t * (afterVal - beforeVal);
            dailyData[asset].push(interpolated);
        }
    }
    
    return dailyData;
}

// Load embedded data
function loadEmbeddedData() {
    // We'll interpolate to daily when BTC data is available
    MACRO_DATA = EMBEDDED_MACRO_DATA;
    MACRO_DATA_SOURCE = 'embedded';
    MACRO_DATA_READY = true;
    console.log(`[Macro Data] Loaded ${EMBEDDED_MACRO_DATA.dates.length} monthly data points`);
    return true;
}

// Main getter - returns interpolated daily data aligned with BTC
async function getMacroData(btcDates) {
    if (!MACRO_DATA_READY) {
        loadEmbeddedData();
    }
    
    if (btcDates && btcDates.length > 0) {
        // Interpolate monthly to daily, aligned with BTC dates
        return interpolateToDaily(EMBEDDED_MACRO_DATA, btcDates);
    }
    
    return MACRO_DATA;
}

// Expose globally
if (typeof window !== 'undefined') {
    window.MACRO_DATA = null; // Will be set when getMacroData is called with dates
    window.getMacroData = getMacroData;
    window.EMBEDDED_MACRO_DATA = EMBEDDED_MACRO_DATA; // Expose raw monthly data too
    
    console.log('[Macro Data] Module loaded. Call getMacroData(btcDates) to get interpolated data.');
}

