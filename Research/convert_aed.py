import re
import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Change the budget from USD 5,000,000 to AED 18,350,000
html = html.replace('>USD 5,000,000<', '>AED 18,350,000<')
html = html.replace('const BUDGET_LIMIT = 5000000;', 'const BUDGET_LIMIT = 18350000;')

# 2. Change occurrences of formatting
# The property cards
html = html.replace('${formatUSD(p.priceUSD)} <span>/ ${formatAED(p.priceAED)}</span>', '${formatAED(p.priceAED)}')
html = html.replace('${formatUSD(p.priceUSD)}', '${formatAED(p.priceAED)}')

# The annual rental
html = html.replace('${formatUSD(p.annualRentalUSD)}', '${formatAED(p.priceAED * p.grossYield / 100)}')
html = html.replace('p.annualRentalUSD', '(p.priceAED * p.grossYield / 100)')

# The bundle chart updates and calculations
# `let total=0; bundle.forEach(p=>total+=p.priceUSD);`
html = html.replace('total+=p.priceUSD', 'total+=p.priceAED')
html = html.replace('p.priceUSD', 'p.priceAED')

# `formatUSD(total)`
html = html.replace('formatUSD(total)', 'formatAED(total)')
html = html.replace('formatUSD(rent)', 'formatAED(rent)')
html = html.replace('formatUSD(p.priceAED)', 'formatAED(p.priceAED)')
html = html.replace('formatUSD(', 'formatAED(')

# Chart labels
html = html.replace('label:\'Value (USD)\'', 'label:\'Value (AED)\'')
html = html.replace('label:\'Value\'', 'label:\'Value (AED)\'')
# The `projValues` are currently in USD. Let's map them to AED inline if they are used in the chart.
# Actually, the chart uses p.projValues. We can just multiply by 3.67 dynamically in JS or update the arrays.
html = html.replace('data:p.projValues', 'data:p.projValues.map(v => v * 3.67)')
html = html.replace('data:chartData', 'data:chartData.map(v => v * 3.67)')

# 3. Add the extracted images to the gallery for Raw District
# Find the gallery block and insert the new images.
img_inject = """
        <img src="Research/extracted_images/page2_img0.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extracted_images/page3_img0.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extracted_images/page4_img0.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
"""
html = html.replace('</video>', '</video>' + img_inject)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Conversion to AED and new images added.")
