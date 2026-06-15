import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the other extracted images that might be irrelevant/abstract art
target_img3 = r'<img src="Research/extracted_images/page3_img0\.jpg" .*?>'
target_img4 = r'<img src="Research/extracted_images/page4_img0\.jpg" .*?>'

html = re.sub(target_img3, '', html)
html = re.sub(target_img4, '', html)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Removed remaining extracted abstract images.")