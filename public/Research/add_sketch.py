import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Add the architectural sketch to the gallery
target_img = r'<img src="Research/raw_district_new_render.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">'

new_img = r'<img src="Research/raw_district_sketch.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">'

html = html.replace(target_img, target_img + '\n        ' + new_img)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Added sketch to gallery.")