import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Inject the analysis panel CSS
analysis_css = """
.analysis-panel {
    overflow-y:auto; 
    position:fixed;
    left:-480px;
    top:0;
    bottom:0;
    width:480px;
    background:var(--dark2);
    border-right:1px solid var(--border);
    z-index:200;
    transition:left 0.4s cubic-bezier(0.4,0,0.2,1);
    display:flex;
    flex-direction:column;
}
.analysis-panel.open {
    left:0;
}
"""
if '.analysis-panel' not in html:
    html = html.replace('/* BUNDLE PANEL */', analysis_css + '\n/* BUNDLE PANEL */')

# 2. Extract the bundleAnalysis block
analysis_start = html.find('<div class="bundle-analysis" id="bundleAnalysis"')
analysis_end = html.find('<button class="bundle-close-btn"', analysis_start)

if analysis_start != -1 and analysis_end != -1:
    analysis_html = html[analysis_start:analysis_end]
    
    # Remove it from the original place
    html = html[:analysis_start] + html[analysis_end:]
    
    # Create the left panel HTML
    left_panel = f"""
<!-- ANALYSIS PANEL (LEFT) -->
<div class="analysis-panel" id="analysisPanel">
    <div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>Portfolio Math</h2>
        <p style="color:var(--text2);font-size:14px;">Real-time ROI & blended yields.</p>
      </div>
      <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>
    {analysis_html}
</div>
"""
    # Insert it right before bundle panel
    bundle_panel_start = html.find('<!-- BUNDLE PANEL -->')
    if bundle_panel_start != -1:
        html = html[:bundle_panel_start] + left_panel + '\n' + html[bundle_panel_start:]
    else:
        # Fallback if comment is missing
        bundle_id_start = html.find('<div class="bundle-panel"')
        html = html[:bundle_id_start] + left_panel + '\n' + html[bundle_id_start:]

# 3. Update the JavaScript functions to open/close both
html = html.replace(
    "function openBundle(){document.getElementById('bundlePanel').classList.add('open');}",
    "function openBundle(){document.getElementById('bundlePanel').classList.add('open'); const ap = document.getElementById('analysisPanel'); if(ap) ap.classList.add('open');}"
)

html = html.replace(
    "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open');}",
    "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open'); const ap = document.getElementById('analysisPanel'); if(ap) ap.classList.remove('open');}"
)

# Also update closeLightbox inside the modal script to ensure we don't accidentally close the bundle
# Wait, closeBundle is fine.

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Dual Drawers Implemented Successfully")
