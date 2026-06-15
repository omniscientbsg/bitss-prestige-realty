import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# The image of the violin/cello is likely page2_img0.jpg based on the order. Let's remove it.
# We will just replace that entire <img> tag.
target_img = r'<img src="Research/extracted_images/page2_img0\.jpg" style="height:240px;border-radius:12px;border:1px solid var\(--border2\);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">'

html = re.sub(target_img, '', html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Removed violin image from gallery.")