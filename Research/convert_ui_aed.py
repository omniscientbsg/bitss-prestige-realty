import re
import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix visual text
html = html.replace('25M</div><div class="l">USD Budget', '91.7M</div><div class="l">AED Budget')
html = html.replace('Phase 1 — <strong>AED 18.4M (~USD 5M)</strong>', 'Phase 1 — <strong>AED 18.4M</strong>')
html = html.replace('Price (USD)', 'Price (AED)')
html = html.replace('Est. Total Yield (USD)', 'Est. Total Yield (AED)')
html = html.replace('Total Value (USD)', 'Total Value (AED)')
html = html.replace('Est. Yield (USD)', 'Est. Yield (AED)')

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("UI labels updated to AED.")
