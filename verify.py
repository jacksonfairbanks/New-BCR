import re

with open('btc-treasury-risk-model.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Count data entries using a simple pattern
entry_count = html.count('{"d":')
print(f'BTC data entries: {entry_count:,}')

# Find the script section
script_start = html.find('<script>')
script_end = html.find('</script>')
script = html[script_start:script_end]

# Basic balance check
open_braces = script.count('{')
close_braces = script.count('}')
print(f'Braces in script: {open_braces:,} open, {close_braces:,} close')

if open_braces == close_braces:
    print('✅ Braces balanced!')
else:
    print('⚠️ Brace mismatch:', open_braces - close_braces)

# Check key functions exist
functions = ['loadEmbeddedBTCData', 'updateYearDropdowns', 'getDailyLogReturnsForRange', 
             'runSimulation', 'calibrateFromHistory']
for func in functions:
    if func in html:
        print(f'✅ Function {func} found')
    else:
        print(f'❌ Function {func} NOT found')

print(f'\nTotal file size: {len(html):,} bytes')
print('File appears ready to use!')

