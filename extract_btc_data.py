import csv
import re

# Read CSV and extract Date and Close
data = []
with open(r'C:\Users\JacksonFairbanks\OneDrive - Strive\Documents\Daily BTC Prices.csv', 'r', encoding='latin-1') as f:
    reader = csv.reader(f)
    next(reader)  # Skip header 1
    next(reader)  # Skip header 2
    next(reader)  # Skip header 3
    next(reader)  # Skip header 4
    for row in reader:
        if len(row) >= 6:
            date_str = row[1].strip()
            close_str = row[5].replace(',', '').strip()
            # Validate date format and close price
            if re.match(r'\d+-\w+-\d+', date_str) and re.match(r'^[\d.]+$', close_str):
                data.append((date_str, float(close_str)))

# Reverse to chronological order (oldest first)
data = data[::-1]

print(f'Total records: {len(data)}')
print(f'Date range: {data[0][0]} to {data[-1][0]}')
print(f'Price range: ${data[0][1]:.2f} to ${data[-1][1]:.2f}')

# Write as JavaScript
with open(r'C:\Users\JacksonFairbanks\btc-risk-model\btc_data.js', 'w') as f:
    f.write('// BTC Daily Price Data extracted from Excel\n')
    f.write('// Format: [date_string, close_price]\n')
    f.write('const BTC_DAILY_DATA = [\n')
    for i, (date, price) in enumerate(data):
        comma = ',' if i < len(data) - 1 else ''
        f.write(f'  ["{date}", {price}]{comma}\n')
    f.write('];\n')

print('Saved to btc_data.js')
