const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The issue: The portfolio analysis section is overlapping because flex-direction column pushes it out of the container when cards are added, 
// and `overflow-y: auto` wasn't working properly because the inner items container didn't flex right, or the absolute positioning.
// Gurmukh's idea is brilliant: Separate them. Portfolio Analysis on the LEFT drawer, Portfolio Items on the RIGHT drawer.

// 1. Let's create a new left panel for Analysis
const analysisCSSToInject = `
.analysis-panel {
    overflow-y:auto; 
    position:fixed;
    left:-480px;
    top:0;
    bottom:0;
    width:480px;
    background:var(--dark2);
    border-right:1px solid var(--border);
    z-index:200;
    transition:left 0.4s cubic-bezier(0.4,0,0.2,1);
    display:flex;
    flex-direction:column;
}
.analysis-panel.open {
    left:0;
}
`;
html = html.replace('/* BUNDLE PANEL */', analysisCSSToInject + '\n/* BUNDLE PANEL */');

// 2. We need to split the HTML
// Find the bundleAnalysis div
const analysisHTMLStart = html.indexOf('<div class="bundle-analysis" id="bundleAnalysis"');
const analysisHTMLEnd = html.indexOf('<div class="compare-section" id="compareSection">'); // The next major section
// Actually the analysis ends at the end of the bundle panel:
const bundleEnd = html.indexOf('</div>\n</div>\n\n<!-- COMPARE -->');
const analysisHTML = html.substring(analysisHTMLStart, bundleEnd);

// Remove it from the right panel
html = html.replace(analysisHTML, '');

// Inject the new left panel before the right panel
const leftPanelHTML = `
<!-- ANALYSIS PANEL (LEFT) -->
<div class="analysis-panel" id="analysisPanel">
    <div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>Portfolio Math</h2>
        <p style="color:var(--text2);font-size:14px;">Real-time ROI & blended yields.</p>
      </div>
      <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>
    ${analysisHTML}
</div>
`;

html = html.replace('<!-- BUNDLE PANEL -->', leftPanelHTML + '\n<!-- BUNDLE PANEL (RIGHT) -->');

// 3. Update the JS to open/close both panels simultaneously
const oldOpenBundle = "function openBundle(){document.getElementById('bundlePanel').classList.add('open');}";
const newOpenBundle = "function openBundle(){document.getElementById('bundlePanel').classList.add('open'); document.getElementById('analysisPanel').classList.add('open');}";
html = html.replace(oldOpenBundle, newOpenBundle);

const oldCloseBundle = "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open');}";
const newCloseBundle = "function closeBundle(){document.getElementById('bundlePanel').classList.remove('open'); document.getElementById('analysisPanel').classList.remove('open');}";
html = html.replace(oldCloseBundle, newCloseBundle);

// 4. Ensure the right drawer has a cross button (it failed to inject earlier because of a missed string match)
const rightDrawerHeader = `<div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>My Portfolio</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p>
      </div>
      <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>`;

html = html.replace(/<div class="bundle-header">\s*<h2>My Portfolio<\/h2>\s*<p style="font-size:13px;color:var\(--text3\);margin-top:4px">Build your Phase 1 allocation<\/p>\s*<\/div>/, rightDrawerHeader);

fs.writeFileSync(filePath, html);
console.log('Split drawers implemented');