import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'

with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Add event.stopPropagation() to the select element's onchange and onclick events
old_select = 'onchange="updateUnitOption(${p.id}, this.value); event.stopPropagation();"'
new_select = 'onchange="updateUnitOption(${p.id}, this.value); event.stopPropagation();" onclick="event.stopPropagation();"'

if new_select not in html:
    html = html.replace(old_select, new_select)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Select propagation fixed.")