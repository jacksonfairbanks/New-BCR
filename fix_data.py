import re

# Read the BTC data from btc_data.js
with open('btc_data.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract just the array
match = re.search(r'const BTC_RAW_DATA = (\[.*?\]);', js_content, re.DOTALL)
if match:
    data_array = match.group(1)
    
    # Read monte-carlo.html
    with open('monte-carlo.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace the comment with actual data
    html = html.replace(
        '// BTC_RAW_DATA loaded from btc_data.js',
        'const BTC_RAW_DATA = ' + data_array + ';'
    )
    
    # Remove the external script reference
    html = html.replace('<script src="btc_data.js"></script>', '<!-- Data embedded inline -->')
    
    with open('monte-carlo.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print('Fixed monte-carlo.html - data embedded inline')
else:
    print('Could not find data')

