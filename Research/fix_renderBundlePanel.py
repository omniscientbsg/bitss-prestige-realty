import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'

with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix renderBundlePanel bug
old_render_logic = """const el=document.getElementById('bundleItems');
   const empty=document.getElementById('emptyBundle');
   const analysis=document.getElementById('bundleAnalysis');
   if(bundle.length===0){
   empty.style.display='block';
   analysis.style.display='none';
   el.innerHTML='';
   el.appendChild(empty);
   return;
   }
   empty.style.display='none';
   el.innerHTML="""

new_render_logic = """const el=document.getElementById('bundleItems');
   const analysis=document.getElementById('analysisPanel');
   if(bundle.length===0){
   if(analysis) analysis.style.display='none';
   el.innerHTML=`<div class="empty-bundle" id="emptyBundle">
        <div class="icon">🏢</div>
        <p>Add properties to see your<br>combined analysis & ROI</p>
      </div>`;
   return;
   }
   if(analysis) analysis.style.display='flex';
   el.innerHTML="""

html = html.replace(old_render_logic, new_render_logic)

# Wait, `analysis` refers to `bundleAnalysis`, but wait...
# Originally `bundleAnalysis` was set to block/none. Now that it is inside `analysisPanel`, it is better to just hide/show the content of the analysis panel, or the analysis panel itself.
# Since it's split into `analysisPanel`, the analysis math is always visible when the left drawer opens. But if there are 0 items, it should probably be hidden or show empty state.
# I updated it to `analysisPanel` style display none/flex.
# Wait, actually, let's keep it referring to `bundleAnalysis` div inside the left drawer.

html = html.replace("const analysis=document.getElementById('analysisPanel');", "const analysis=document.getElementById('bundleAnalysis');")
html = html.replace("if(analysis) analysis.style.display='flex';", "if(analysis) analysis.style.display='block';")

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied renderBundlePanel fix")