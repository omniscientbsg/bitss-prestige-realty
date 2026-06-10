import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Make the card clickable and update the Add button. The previous regex replace missed due to exact formatting.
oldCardActions1 = '<div class="card-actions">\n          <button class="btn-primary" onclick="openModal(${p.id})">View Deal →</button>\n          <button class="btn-add ${inBundle?\'added\':\'\'}" id="add-${p.id}" onclick="toggleBundle(${p.id})">${inBundle?\'✓\':\'+\'}$</button>\n        </div>\n      </div>\n    `;\n    grid.appendChild(card);'

newCardActions1 = """<div class="card-actions">
          <button class="btn-primary" style="flex:1" onclick="openModal(${p.id}); event.stopPropagation();">View Details</button>
          <button class="btn-secondary ${inBundle?'added':''}" id="add-${p.id}" onclick="toggleBundle(${p.id}); event.stopPropagation();" style="flex:1; border: 1px solid var(--gold); background: ${inBundle?'rgba(201,168,76,0.15)':'transparent'}; color: ${inBundle?'var(--gold)':'var(--text2)'};">${inBundle?'✓ Added':'Add to Portfolio'}</button>
        </div>
      </div>
    `;
    card.onclick = () => openModal(p.id);
    grid.appendChild(card);"""

if oldCardActions1 in html:
    html = html.replace(oldCardActions1, newCardActions1)
else:
    # Let's try a softer replace
    import re
    pattern = re.compile(r'<div class="card-actions">\s*<button class="btn-primary"[^>]*>.*?</button>\s*<button class="btn-add[^>]*>.*?</button>\s*</div>\s*</div>\s*`;\s*grid.appendChild\(card\);', re.DOTALL)
    html = pattern.sub(newCardActions1, html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated Card actions and clickability.")