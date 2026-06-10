import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the entire renderBundlePanel function up to analysis.style.display='block';
def replacement(m):
    return """function renderBundlePanel(){
 const el=document.getElementById('bundleItems');
 const analysis=document.getElementById('bundleAnalysis');
 if(bundle.length===0){
  if(analysis) analysis.style.display='none';
  el.innerHTML=`<div class="empty-bundle" id="emptyBundle">
   <div class="icon">🏢</div>
   <p>Add properties to see your<br>combined analysis & ROI</p>
  </div>`;
  return;
 }
 el.innerHTML=bundle.map(p=>`
  <div class="bundle-item">
   <div class="bi-icon">${p.emoji}</div>
   <div class="bi-content">
    <div class="bi-name">${p.name}</div>
    <div class="bi-location">${p.locationShort}</div>
    <div class="bi-metrics">
     <div class="bi-metric">Yield: <strong>${p.grossYield}%</strong></div>
     <div class="bi-metric">${formatAED(p.priceAED)}</div>
    </div>
   </div>
   <button class="bi-remove" onclick="toggleBundle(${p.id})">&times;</button>
  </div>
 `).join('');
 if(analysis) analysis.style.display='block';
"""

# Match from function renderBundlePanel(){ ... to ... analysis.style.display='block';
pattern = r'function renderBundlePanel\(\)\{.*?analysis\.style\.display=\'block\';'
html = re.sub(pattern, replacement, html, flags=re.DOTALL)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Regex replace successful.")