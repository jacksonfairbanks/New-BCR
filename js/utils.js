/* ========================================
   BTC Underwriting Dashboard - Shared Utilities
   ========================================
   
   Include this in all pages:
   <script src="js/utils.js"></script>
   
   Access via: window.Utils.functionName() or destructure
   ======================================== */

// ==================== DATE PARSING ====================

/**
 * Parse date from various formats
 * Supports: "17-Sep-14", "2014-09-17", "Sep 17, 2014", Date objects
 */
function parseDate(input) {
    if (input instanceof Date) return input;
    if (typeof input !== 'string') return new Date(NaN);
    
    // ISO format: "2014-09-17"
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return new Date(input + 'T00:00:00');
    }
    
    // Compact format: "17-Sep-14" or "1-Oct-14"
    const compactMatch = input.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
    if (compactMatch) {
        const months = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };
        const day = parseInt(compactMatch[1]);
        const month = months[compactMatch[2].toLowerCase()];
        let year = parseInt(compactMatch[3]);
        year = year < 50 ? 2000 + year : 1900 + year; // Handle 2-digit years
        return new Date(year, month, day);
    }
    
    // Fallback to Date constructor
    return new Date(input);
}

/**
 * Format date to ISO string "YYYY-MM-DD"
 */
function formatDateISO(date) {
    if (!(date instanceof Date)) date = parseDate(date);
    return date.toISOString().split('T')[0];
}

/**
 * Format date to compact string "17-Sep-14"
 */
function formatDateCompact(date) {
    if (!(date instanceof Date)) date = parseDate(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

/**
 * Format date for display "Sep 17, 2014"
 */
function formatDateDisplay(date) {
    if (!(date instanceof Date)) date = parseDate(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ==================== NUMBER FORMATTING ====================

/**
 * Format large numbers with K/M/B/T suffix
 */
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    
    if (absNum >= 1e12) return sign + (absNum / 1e12).toFixed(decimals) + 'T';
    if (absNum >= 1e9) return sign + (absNum / 1e9).toFixed(decimals) + 'B';
    if (absNum >= 1e6) return sign + (absNum / 1e6).toFixed(decimals) + 'M';
    if (absNum >= 1e3) return sign + (absNum / 1e3).toFixed(decimals) + 'K';
    return sign + absNum.toFixed(decimals);
}

/**
 * Format as percentage
 */
function formatPercent(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return num.toFixed(decimals) + '%';
}

/**
 * Format as dollar amount
 */
function formatDollar(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return '$' + formatNumber(num, decimals);
}

/**
 * Format as full currency with commas
 */
function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return '$' + num.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    });
}

/**
 * Format multiplier (e.g., "2.5x")
 */
function formatMultiplier(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return num.toFixed(decimals) + 'x';
}

// ==================== SEEDED RANDOM ====================

/**
 * Create a seeded random number generator
 */
function createSeededRandom(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

// ==================== STATISTICAL FUNCTIONS ====================

/**
 * Calculate percentile of an array
 */
function percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/**
 * Calculate mean of an array
 */
function mean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculate standard deviation of an array
 */
function std(arr) {
    if (!arr || arr.length < 2) return 0;
    const m = mean(arr);
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

/**
 * Calculate median of an array
 */
function median(arr) {
    return percentile(arr, 50);
}

/**
 * Calculate min of an array
 */
function min(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.min(...arr);
}

/**
 * Calculate max of an array
 */
function max(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr);
}

// ==================== RANDOM DISTRIBUTIONS ====================

/**
 * Generate normal random number using Box-Muller
 */
function normalRandom(rng = Math.random) {
    let u1, u2;
    do { u1 = rng(); } while (u1 === 0);
    u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generate pair of normal random numbers using Box-Muller
 */
function boxMullerPair(rng = Math.random) {
    let u1, u2;
    do { u1 = rng(); } while (u1 === 0);
    u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    return [
        mag * Math.cos(2 * Math.PI * u2),
        mag * Math.sin(2 * Math.PI * u2)
    ];
}

// ==================== BTC DATA UTILITIES ====================

/**
 * Calculate log returns from price data
 * @param {Array} data - Array of {date, price} or {d, c} objects
 */
function calculateLogReturns(data) {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
        const price = data[i].price ?? data[i].c;
        const prevPrice = data[i-1].price ?? data[i-1].c;
        if (price > 0 && prevPrice > 0) {
            returns.push(Math.log(price / prevPrice));
        }
    }
    return returns;
}

/**
 * Filter data by year range
 * @param {Array} data - Array of {date, price} or {d, c} objects
 */
function filterDataByDateRange(data, startYear, endYear) {
    return data.filter(d => {
        const date = d.date ? new Date(d.date) : parseDate(d.d);
        const year = date.getFullYear();
        return year >= startYear && year <= endYear;
    });
}

/**
 * Get date range from data array
 */
function getDataDateRange(data) {
    if (!data || data.length === 0) return { start: null, end: null };
    const dates = data.map(d => d.date ? new Date(d.date) : parseDate(d.d));
    return {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
    };
}

// ==================== CHART UTILITIES ====================

const CHART_COLORS = {
    orange: '#f7931a',
    red: '#ff4757',
    green: '#00d4aa',
    blue: '#4a9eff',
    purple: '#a855f7',
    yellow: '#ffd700',
    cyan: '#00d4aa',
    // Model-specific
    lognormal: '#4a9eff',
    jump: '#a855f7',
    bootstrap: '#00d4aa',
    failure: '#ff4757'
};

const CHART_LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Space Grotesk, sans-serif', color: '#a0a0b0', size: 12 },
    margin: { t: 30, r: 30, b: 50, l: 70 },
    showlegend: true,
    legend: { 
        x: 0.02, 
        y: 0.98, 
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: '#2a2a3a',
        borderwidth: 1
    },
    hovermode: 'x unified',
    xaxis: {
        gridcolor: '#2a2a3a',
        zerolinecolor: '#2a2a3a',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11 }
    },
    yaxis: {
        gridcolor: '#2a2a3a',
        zerolinecolor: '#2a2a3a',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11 }
    }
};

/**
 * Get grid configuration for charts
 */
function getGridConfig() {
    return { gridcolor: '#2a2a3a', zerolinecolor: '#2a2a3a' };
}

/**
 * Create a deep copy of base chart layout
 */
function getChartLayout(overrides = {}) {
    return { ...JSON.parse(JSON.stringify(CHART_LAYOUT_BASE)), ...overrides };
}

// ==================== UI UTILITIES ====================

/**
 * Toggle collapsible section
 */
function toggleCollapsible(element) {
    const header = element.classList.contains('collapsible__header') 
        ? element 
        : element.closest('.collapsible__header');
    if (!header) return;
    
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    if (content) content.classList.toggle('active');
}

/**
 * Show/hide loading overlay
 */
function showLoading(show = true) {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

/**
 * Update progress bar
 */
function updateProgress(percent) {
    const fill = document.querySelector('.progress-fill');
    if (fill) {
        fill.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }
}

/**
 * Debounce function execution
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Throttle function execution
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== EXPORT ====================

const Utils = {
    // Date
    parseDate,
    formatDateISO,
    formatDateCompact,
    formatDateDisplay,
    
    // Numbers
    formatNumber,
    formatPercent,
    formatDollar,
    formatCurrency,
    formatMultiplier,
    
    // Random
    createSeededRandom,
    normalRandom,
    boxMullerPair,
    
    // Statistics
    percentile,
    mean,
    std,
    median,
    min,
    max,
    
    // BTC Data
    calculateLogReturns,
    filterDataByDateRange,
    getDataDateRange,
    
    // Charts
    CHART_COLORS,
    CHART_LAYOUT_BASE,
    getGridConfig,
    getChartLayout,
    
    // UI
    toggleCollapsible,
    showLoading,
    updateProgress,
    debounce,
    throttle
};

// Export to window for browser use
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    
    // Also expose individual functions for convenience
    window.parseDate = parseDate;
    window.formatNumber = formatNumber;
    window.formatPercent = formatPercent;
    window.formatDollar = formatDollar;
    window.formatCurrency = formatCurrency;
    window.percentile = percentile;
    window.mean = mean;
    window.std = std;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
