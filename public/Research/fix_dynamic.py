import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'

with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix budget text in hero
html = html.replace('<div class="n">25M</div><div class="l">AED Budget Available</div>', '<div class="n">5M</div><div class="l">AED Phase 1 Budget</div>')
html = html.replace('<h2 class="section-title">Phase 1 ?" <strong>AED 25M</strong></h2>', '<h2 class="section-title">Phase 1 &mdash; <strong>AED 5M</strong></h2>')
html = html.replace('<strong>AED 18,350,000</strong> remaining', '<strong>AED 5,000,000</strong> remaining')

# Fix USD -> AED text in sidebar/hero if there's any
html = html.replace('<div style="font-family:\'Cormorant Garamond\',serif;font-size:48px;font-weight:300;color:var(--gold);line-height:1">25M</div>', '<div style="font-family:\'Cormorant Garamond\',serif;font-size:48px;font-weight:300;color:var(--gold);line-height:1">5M</div>')
html = html.replace('<div style="font-size:12px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-top:4px">USD Total Budget</div>', '<div style="font-size:12px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-top:4px">AED Phase 1 Budget</div>')
html = html.replace('Phase 1 starts at <strong style="color:var(--text)">USD 5M</strong>', 'Phase 1 starts at <strong style="color:var(--text)">AED 5M</strong>')

# Fix bi-remove button inside renderBundlePanel
# We will use regex to find the exact line and replace it
html = re.sub(r'<button class="bi-remove"[^>]*>.*?</button>', r'<button class="bi-remove" onclick="toggleBundle(${p.id})">&times;</button>', html)

# Fix toggleBundle string
old_btn_update = r"if\(btn\)\{btn\.textContent=bundle\.find\(x=>x\.id===id\)\?.*?:.*?;btn\.className='btn-add'\+\(bundle\.find\(x=>x\.id===id\)\?' added':''\);\}"
new_btn_update = r"if(btn){btn.innerHTML=bundle.find(x=>x.id===id)?'&times;':'+';btn.className='btn-add'+(bundle.find(x=>x.id===id)?' added':'');}"
html = re.sub(old_btn_update, new_btn_update, html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied fixes")