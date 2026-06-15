import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Change Phase 1 title budget
html = html.replace('Phase 1 — <strong>AED 18.4M</strong>', 'Phase 1 — <strong>AED 25M</strong>')

# 2. Change dynamic budget JS max limit
html = html.replace('const BUDGET_LIMIT = 18350000;', 'const BUDGET_LIMIT = 25000000;')

# 3. Change header budget limit string
html = html.replace('">AED 18,350,000</div>', '">AED 25,000,000</div>')

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated budget to 25M AED")