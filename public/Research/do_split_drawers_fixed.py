import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
basePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.working.html'

with open(basePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add CSS for left panel
analysis_css = """
.analysis-panel{position:fixed;left:-480px;top:0;bottom:0;width:480px;background:var(--dark2);border-right:1px solid var(--border);z-index:200;transition:left 0.4s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;overflow:hidden}
.analysis-panel.open{left:0}
"""
html = html.replace('.bundle-panel.open{right:0}', '.bundle-panel.open{right:0}\n' + analysis_css)

# 2. Extract bundle-analysis content
analysis_start = html.find('<div class="bundle-analysis" id="bundleAnalysis"')
analysis_end = html.find('<button class="bundle-close-btn"', analysis_start)

if analysis_start != -1 and analysis_end != -1:
    analysis_html = html[analysis_start:analysis_end].strip()
    
    # Remove it from the original place
    html = html[:analysis_start] + html[analysis_end:]
    
    # Also remove the original big close button since we'll put X buttons at the top
    html = re.sub(r'<button class="bundle-close-btn"[^>]*>.*?</button>', '', html)
    
    # Construct the Left Panel
    left_panel = f"""
<!-- ANALYSIS PANEL (LEFT) -->
<div class="analysis-panel" id="analysisPanel">
    <div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>Portfolio Math</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:4px">Real-time ROI & blended yields</p>
      </div>
      <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>
    <div style="flex:1;overflow-y:auto;overflow-x:hidden;">
      {analysis_html}
    </div>
</div>
"""
    
    # Find BUNDLE PANEL and put left_panel before it
    bundle_panel_start = html.find('<!-- BUNDLE PANEL -->')
    html = html[:bundle_panel_start] + left_panel + '\n' + html[bundle_panel_start:]
    
    # Update the right panel header to have the close button too
    old_right_header = """<div class="bundle-header">
      <h2>My Portfolio</h2>
      <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p>
    </div>"""
    new_right_header = """<div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>My Portfolio</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p>
      </div>
      <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>"""
    html = html.replace(old_right_header, new_right_header)

# 3. Update JS open/close
html = html.replace(
    "function openBundle(){document.getElementById('bundlePanel').classList.add('open');}",
    "function openBundle(){document.getElementById('bundlePanel').classList.add('open'); document.getElementById('analysisPanel').classList.add('open');}"
)
html = html.replace(
    "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open');}",
    "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open'); document.getElementById('analysisPanel').classList.remove('open');}"
)

# Fix empty spaces
html = re.sub(r' +', ' ', html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Split implemented successfully.")