import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'

with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'<h2 class="section-title">Phase 1[^<]*<strong>AED 25M</strong></h2>', '<h2 class="section-title">Phase 1 &mdash; <strong>AED 5M</strong></h2>', html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed section title 25M -> 5M")