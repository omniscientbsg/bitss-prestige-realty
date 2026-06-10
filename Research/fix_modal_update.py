import os
import re

filePath = r'C:\Users\Admin\Documents\Prateek Khanna\prateek-investment-portal.html'

with open(filePath, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix updateUnitOption function to re-render the modal content if it is open
old_update_unit_option = """    // Also re-render Modal if open
    if(currentModal && currentModal.id === id) {
        document.getElementById('modalPrice').innerHTML = formatAED(p.priceAED);
        const stats = document.querySelectorAll('.stat-card .val');
        if(stats.length > 0) stats[0].textContent = p.grossYield + '%';
    }"""

new_update_unit_option = """    // Also re-render Modal if open
    if(currentModal && currentModal.id === id) {
        openModal(id); // Re-run openModal to recalculate everything including Payment Plan
    }"""

html = html.replace(old_update_unit_option, new_update_unit_option)

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated updateUnitOption to refresh modal and payment plans.")