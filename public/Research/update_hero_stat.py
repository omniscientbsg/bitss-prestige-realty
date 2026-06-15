import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the hero stat block that says "91.7M" 
html = html.replace('<div class="hero-stat"><div class="n">91.7M</div><div class="l">AED Budget Available</div></div>', '<div class="hero-stat"><div class="n">25M</div><div class="l">AED Budget Available</div></div>')

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated Hero Budget Stat to 25M")