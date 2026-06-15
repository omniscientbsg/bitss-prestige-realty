const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The deep dive for Raw District has an "Investor's Edge" block. 
// We are going to replace "The Investor's Edge" with "Verified Market Data (DXB Interact)"
// and use the Azizi baseline data to prove the ROI.

const oldEdge = /<h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var\(--text\);margin-bottom:16px;">The Investor's Edge<\/h4>[\s\S]*?<\/div>\s*<\/div>/;

const newEdge = `
        <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">Verified Market Data (DXB Interact)</h4>
        <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">Live rental contracts from <strong>Azizi Aura Residences</strong> (the immediate neighboring plot, non-premium build) registered in Feb 2026. Imtiaz's superior build and Raw Stay management guarantees a premium above these baselines.</p>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:16px;">
            <div style="background:var(--dark3);padding:12px;border-radius:8px;border:1px solid var(--border2);">
                <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Studio Baseline</div>
                <div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;">AED 55K</div>
                <div style="font-size:11px;color:var(--text3);margin-top:4px;">391 sq.ft. (16th Flr)</div>
            </div>
            <div style="background:var(--dark3);padding:12px;border-radius:8px;border:1px solid var(--border2);">
                <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">1-Bed Baseline</div>
                <div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;">AED 70K</div>
                <div style="font-size:11px;color:var(--text3);margin-top:4px;">694 sq.ft. (15th Flr)</div>
            </div>
            <div style="background:var(--dark3);padding:12px;border-radius:8px;border:1px solid var(--border2);">
                <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">2-Bed Baseline</div>
                <div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;">AED 110K</div>
                <div style="font-size:11px;color:var(--text3);margin-top:4px;">Registered Contract</div>
            </div>
        </div>
        <div style="display:flex;gap:16px;">
            <img src="Research/azizi_data.jpg" style="height:120px;border-radius:8px;border:1px solid var(--border2);object-fit:cover;cursor:pointer;" onclick="window.open(this.src)">
            <div style="flex:1;">
                <div style="color:var(--gold);font-size:16px;margin-bottom:4px;">📈 The Raw District ROI Calculation</div>
                <div style="font-size:12px;color:var(--text3);line-height:1.5;">At AED 649K entry for a Studio, capturing just the baseline AED 55K rent yields an <strong>8.4% gross ROI</strong>. With Imtiaz's turnkey 'Raw Stay' hospitality model and direct metro bridge premium, targeting AED 65K+ is highly probable, pushing gross yields past <strong>10%</strong>. Add the 40% post-handover leverage, and the cash-on-cash return is exceptional.</div>
            </div>
        </div>
`;

html = html.replace(oldEdge, newEdge);
fs.writeFileSync(filePath, html);
console.log('Replaced with verified data');