import os

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'
with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix the top script tag issue
bad_script = """<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js">
function openLightbox(src, isVideo) {
    const container = document.getElementById('lightboxContainer');
    if (isVideo) {
        container.innerHTML = '<video src="'+src+'" onclick="openLightbox(\\''+src+'\\', true)" style="cursor:pointer;" autoplay class="lightbox-content" onclick="event.stopPropagation()"></video>';
    } else {
        container.innerHTML = '<img src="'+src+'" class="lightbox-content" onclick="event.stopPropagation()">';
    }
    document.getElementById('lightboxOverlay').classList.add('open');
}
function closeLightbox() {
    document.getElementById('lightboxOverlay').classList.remove('open');
    document.getElementById('lightboxContainer').innerHTML = ''; // Stop video playback
}
</script>"""

# Fix quote issue in the python string representation, use replace step by step
start_idx = html.find('<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js">')
end_idx = html.find('</script>', start_idx) + 9

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>' + html[end_idx:]

# 2. Re-inject the lightbox JS at the bottom properly
lightbox_js = """
function openLightbox(src, isVideo) {
    const container = document.getElementById('lightboxContainer');
    if (isVideo) {
        container.innerHTML = '<video src="'+src+'" controls autoplay class="lightbox-content" onclick="event.stopPropagation()"></video>';
    } else {
        container.innerHTML = '<img src="'+src+'" class="lightbox-content" onclick="event.stopPropagation()">';
    }
    document.getElementById('lightboxOverlay').classList.add('open');
}
function closeLightbox() {
    document.getElementById('lightboxOverlay').classList.remove('open');
    document.getElementById('lightboxContainer').innerHTML = ''; // Stop video playback
}
"""

# Insert right before the last </script> tag at the bottom
last_script_idx = html.rfind('</script>')
if last_script_idx != -1:
    html = html[:last_script_idx] + lightbox_js + html[last_script_idx:]

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed JS structure")