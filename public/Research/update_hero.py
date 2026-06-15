import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the Main Hero Heading
html = html.replace('Dubai Real Estate<br><em>Portfolio Curation</em></h1>', 'Prateek Khanna<br><em>Dubai Real Estate Portfolio</em></h1>')

# 2. Update the Subheading
html = html.replace(
    'Exclusively prepared for Mr. Prateek Khanna — handpicked distress deals, pre-launches, and ready assets across Dubai\'s most lucrative corridors.',
    'An exclusive, highly curated strategy designed specifically for Prateek Khanna — focusing on high-leverage distress deals, premium pre-launches, and maximum rental yields.'
)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated Hero Headline")