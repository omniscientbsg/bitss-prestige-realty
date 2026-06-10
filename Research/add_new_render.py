import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Add the new render image to the gallery next to render1.jpg
target_html = r'<img src="Research/render1.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">'

new_img = r'<img src="Research/raw_district_new_render.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">'

html = html.replace(target_html, target_html + '\n        ' + new_img)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Added new render image to gallery.")