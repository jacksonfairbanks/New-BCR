import re

# Read the btc data
with open('btc_data.js', 'r') as f:
    btc_js = f.read()

# Extract just the array
match = re.search(r'\[.*\]', btc_js, re.DOTALL)
data_array = match.group(0) if match else '[]'

# Read the HTML file
with open('btc-treasury-risk-model.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find and replace the fetchBTCData section and add embedded data
new_data_section = '''// ============================================
        // EMBEDDED BTC HISTORICAL DATA (Sep 2014 - Oct 2025)
        // ============================================
        const BTC_RAW_DATA = ''' + data_array + ''';

        let dailyPrices = [];  // { date: Date, price: number }[]
        let dailyLogReturns = [];  // Actual daily log returns
        let dataLoaded = false;
        let dataLoadError = null;

        // Parse embedded BTC data
        function loadEmbeddedBTCData() {
            const statusEl = document.getElementById('data-status');
            statusEl.innerHTML = '⏳ Processing embedded BTC data...';
            statusEl.style.color = '#ff9f43';

            try {
                // Parse date format "DD-MMM-YY" to Date object
                function parseDate(dateStr) {
                    const months = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    const parts = dateStr.split('-');
                    const day = parseInt(parts[0]);
                    const month = months[parts[1]];
                    let year = parseInt(parts[2]);
                    // Handle 2-digit year (14-25 = 2014-2025)
                    year = year < 50 ? 2000 + year : 1900 + year;
                    return new Date(year, month, day);
                }

                // Convert raw data to dailyPrices array
                dailyPrices = BTC_RAW_DATA.map(item => ({
                    date: parseDate(item.d),
                    price: item.c
                })).filter(d => d.price > 0 && !isNaN(d.date.getTime()));

                // Compute daily log returns
                dailyLogReturns = [];
                for (let i = 1; i < dailyPrices.length; i++) {
                    const logReturn = Math.log(dailyPrices[i].price / dailyPrices[i-1].price);
                    dailyLogReturns.push({
                        date: dailyPrices[i].date,
                        return: logReturn
                    });
                }

                dataLoaded = true;
                const startDate = dailyPrices[0].date.toLocaleDateString();
                const endDate = dailyPrices[dailyPrices.length-1].date.toLocaleDateString();
                statusEl.innerHTML = `✅ Loaded ${dailyPrices.length.toLocaleString()} daily prices (${startDate} to ${endDate})`;
                statusEl.style.color = '#00d4aa';

                // Update year dropdowns based on actual data
                updateYearDropdowns();
                
                // Recalibrate with real data
                recalibrateParams();

                console.log('=== BTC DATA LOADED (Embedded) ===');
                console.log('Daily prices:', dailyPrices.length);
                console.log('Daily log returns:', dailyLogReturns.length);
                console.log('Date range:', startDate, 'to', endDate);
                console.log('Price range: $' + dailyPrices[0].price.toFixed(2) + ' to $' + dailyPrices[dailyPrices.length-1].price.toFixed(2));

                return true;
            } catch (err) {
                dataLoadError = err.message;
                statusEl.innerHTML = `❌ Failed to parse data: ${err.message}`;
                statusEl.style.color = '#ff4757';
                console.error('Data parse error:', err);
                return false;
            }
        }

        // Update year dropdown options based on actual data
        function updateYearDropdowns() {
            if (!dataLoaded || dailyPrices.length === 0) return;

            const years = [...new Set(dailyPrices.map(d => d.date.getFullYear()))].sort();
            const startSelect = document.getElementById('data-start');
            const endSelect = document.getElementById('data-end');

            // Clear and rebuild options
            startSelect.innerHTML = '';
            endSelect.innerHTML = '';

            years.forEach(year => {
                startSelect.innerHTML += `<option value="${year}">${year}</option>`;
                endSelect.innerHTML += `<option value="${year}">${year}</option>`;
            });

            // Set defaults: 2019 to 2024 (as requested)
            const defaultStart = years.includes(2019) ? 2019 : years[Math.max(0, years.length - 6)];
            const defaultEnd = years.includes(2024) ? 2024 : years[years.length - 1];
            
            startSelect.value = defaultStart;
            endSelect.value = defaultEnd;
        }

        // Get daily log returns for a date range
        function getDailyLogReturnsForRange(startYear, endYear) {
            if (!dataLoaded) return [];
            return dailyLogReturns
                .filter(d => d.date.getFullYear() >= startYear && d.date.getFullYear() <= endYear)
                .map(d => d.return);
        }

        // Get monthly log returns (for compatibility)
        function getMonthlyLogReturnsArray(startYear, endYear) {
            if (!dataLoaded) return fallbackMonthlyReturns(startYear, endYear);
            
            // Aggregate daily returns into monthly
            const monthlyReturns = [];
            let currentMonth = null;
            let monthSum = 0;

            dailyLogReturns
                .filter(d => d.date.getFullYear() >= startYear && d.date.getFullYear() <= endYear)
                .forEach(d => {
                    const monthKey = `${d.date.getFullYear()}-${d.date.getMonth()}`;
                    if (currentMonth !== monthKey) {
                        if (currentMonth !== null) {
                            monthlyReturns.push(monthSum);
                        }
                        currentMonth = monthKey;
                        monthSum = d.return;
                    } else {
                        monthSum += d.return;
                    }
                });
            
            if (currentMonth !== null) {
                monthlyReturns.push(monthSum);
            }

            return monthlyReturns;
        }

        // Alias for compatibility
        function getMonthlyLogReturns(startYear, endYear) {
            return getMonthlyLogReturnsArray(startYear, endYear);
        }

        // Fallback monthly data if embedded data fails to parse (shouldn't happen)
        const fallbackMonthlyData = {
            2014: [-0.19, -0.12, 0.17, -0.15],
            2015: [-0.28, 0.15, -0.04, -0.02, -0.07, 0.13, 0.08, -0.18, 0.02, 0.33, 0.19, 0.14],
            2016: [-0.14, 0.20, -0.04, 0.07, 0.20, 0.25, -0.07, -0.06, 0.06, 0.14, 0.05, 0.30],
            2017: [0.00, 0.23, -0.09, 0.27, 0.52, 0.12, 0.17, 0.65, -0.08, 0.48, 0.54, -0.30],
            2018: [-0.28, 0.02, -0.33, 0.33, -0.19, -0.15, 0.21, -0.09, -0.06, -0.04, -0.37, -0.08],
            2019: [-0.08, 0.11, 0.07, 0.29, 0.52, 0.26, -0.07, -0.05, -0.14, 0.10, -0.18, -0.05],
            2020: [0.30, -0.09, -0.25, 0.34, 0.10, -0.03, 0.24, 0.03, -0.08, 0.28, 0.43, 0.47],
            2021: [0.14, 0.37, 0.30, -0.02, -0.35, -0.06, 0.19, 0.13, -0.07, 0.40, -0.07, -0.19],
            2022: [-0.17, 0.12, 0.05, -0.17, -0.16, -0.37, 0.17, -0.14, -0.03, 0.05, -0.16, -0.04],
            2023: [0.39, 0.00, 0.23, 0.03, -0.07, 0.12, -0.04, -0.11, 0.04, 0.29, 0.09, 0.12],
            2024: [0.01, 0.44, 0.16, -0.15, 0.11, -0.07, 0.03, -0.08, 0.07, 0.10, 0.37, -0.03],
            2025: [0.09, 0.02, -0.12, 0.15, 0.08, -0.06, 0.11, -0.04, -0.08, 0.18]
        };

        function fallbackMonthlyReturns(startYear, endYear) {
            const returns = [];
            for (let year = startYear; year <= endYear; year++) {
                if (fallbackMonthlyData[year]) {
                    fallbackMonthlyData[year].forEach(r => returns.push(Math.log(1 + r)));
                }
            }
            return returns;
        }'''

# Find where to replace in the HTML
# Look for the old data section start
old_section_start = '''// ============================================
        // LIVE BTC DATA FROM COINGECKO API
        // ============================================
        let dailyPrices = [];'''

old_section_end = '''function fallbackMonthlyReturns(startYear, endYear) {
            const returns = [];
            for (let year = startYear; year <= endYear; year++) {
                if (fallbackMonthlyData[year]) {
                    fallbackMonthlyData[year].forEach(r => returns.push(Math.log(1 + r)));
                }
            }
            return returns;
        }'''

# Find the positions
start_idx = html.find('// ============================================\n        // LIVE BTC DATA FROM COINGECKO')
if start_idx == -1:
    print("Could not find start marker")
    exit(1)

end_idx = html.find('return returns;\n        }', start_idx)
if end_idx == -1:
    print("Could not find end marker")
    exit(1)

# Include the closing of fallbackMonthlyReturns function
end_idx = html.find('}', end_idx + len('return returns;\n        }')) + 1

# Replace the section
new_html = html[:start_idx] + new_data_section + html[end_idx:]

# Also update the initialization to use loadEmbeddedBTCData instead of fetchBTCData
new_html = new_html.replace(
    '''// Initialize - fetch live data first
        fetchBTCData().then(() => {
            updateDerivedValues();
            // Auto-run simulation after data loads
            setTimeout(() => runSimulation(), 500);
        });''',
    '''// Initialize - load embedded data
        loadEmbeddedBTCData();
        updateDerivedValues();
        // Auto-run simulation after data loads
        setTimeout(() => runSimulation(), 300);''')

# Write the new HTML
with open('btc-treasury-risk-model.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("HTML file updated successfully!")
print(f"Total size: {len(new_html):,} bytes")

