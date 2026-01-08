/* ========================================
   BTC Underwriting Dashboard - Shared Utilities
   ======================================== */

// ========== SEEDED RANDOM ==========
function createSeededRandom(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

// ========== STATISTICAL FUNCTIONS ==========
function percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function mean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
    if (!arr || arr.length < 2) return 0;
    const m = mean(arr);
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

// ========== FORMATTING FUNCTIONS ==========
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function formatPercent(num, decimals = 2) {
    return num.toFixed(decimals) + '%';
}

function formatDollar(num) {
    return '$' + formatNumber(num);
}

function formatTableValue(val, metric) {
    if (metric === 'terminal-nav') {
        return '$' + formatNumber(val);
    }
    return val.toFixed(2) + 'x';
}

// ========== RANDOM DISTRIBUTIONS ==========
function normalRandom(rng = Math.random) {
    let u1, u2;
    do { u1 = rng(); } while (u1 === 0);
    u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

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

// ========== BTC DATA UTILITIES ==========
function calculateLogReturns(data) {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i].price > 0 && data[i-1].price > 0) {
            returns.push(Math.log(data[i].price / data[i-1].price));
        }
    }
    return returns;
}

function filterDataByDateRange(data, startYear, endYear) {
    return data.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });
}

// ========== CHART UTILITIES ==========
const CHART_COLORS = {
    lognormal: '#4a9eff',
    jump: '#a855f7',
    bootstrap: '#00d4aa',
    failure: '#ff4757',
    orange: '#f7931a'
};

const CHART_LAYOUT_BASE = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Space Grotesk', color: '#a0a0b0' },
    margin: { t: 20, r: 30, b: 50, l: 80 },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)' },
    hovermode: 'x unified'
};

function getGridConfig() {
    return { gridcolor: '#2a2a3a' };
}

// ========== UI UTILITIES ==========
function toggleCollapsible(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('active');
}

function showLoading(show = true) {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function updateProgress(percent) {
    const fill = document.querySelector('.progress-fill');
    if (fill) {
        fill.style.width = percent + '%';
    }
}

// ========== EXPORT FOR USE ==========
// These are available globally when this script is included
window.DashboardUtils = {
    createSeededRandom,
    percentile,
    mean,
    std,
    formatNumber,
    formatPercent,
    formatDollar,
    formatTableValue,
    normalRandom,
    boxMullerPair,
    calculateLogReturns,
    filterDataByDateRange,
    CHART_COLORS,
    CHART_LAYOUT_BASE,
    getGridConfig,
    toggleCollapsible,
    showLoading,
    updateProgress
};

