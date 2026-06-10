const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// We will inject the SZR Comparables block right after the DXB interact block
const insertionPoint = '</div>\\s*</div>\\s*</div>\\s*</div>\\s*</div>\\s*</div>\\s*</div>'; 
// Actually, let's just find the end of the `deepDive:` string and insert before the backtick closing it.
// Wait, the deepDive string is wrapped in backticks now (from fix_syntax.js).
const searchPattern = /<div style="color:var\(--gold\);font-size:16px;margin-bottom:4px;">📈 The Raw District ROI Calculation<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const compBlock = `
        <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-top:32px;margin-bottom:16px;">SZR Competitor Pricing Gap</h4>
        <p style="font-size:12px;color:var(--text2);margin-bottom:16px;">Comparative analysis against other recent Sheikh Zayed Road launches proves the aggressive underpricing of Raw District's entry point.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
            <div style="background:var(--dark3);padding:16px;border-radius:8px;border:1px solid var(--border2);position:relative;">
                <div style="position:absolute;top:16px;right:16px;font-size:20px;">🏢</div>
                <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Sobha Central</div>
                <div style="color:var(--red);font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;">Avg AED 2,960 / sq.ft.</div>
                <div style="font-size:11px;color:var(--text3);margin-top:8px;">
                    1-Bed starting at <strong>AED 1.45M</strong><br>
                    2-Bed starting at <strong>AED 2.48M</strong>
                </div>
            </div>
            <div style="background:var(--dark3);padding:16px;border-radius:8px;border:1px solid var(--border2);position:relative;">
                <div style="position:absolute;top:16px;right:16px;font-size:20px;">🏢</div>
                <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Danube Shahrukhz</div>
                <div style="color:var(--red);font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;">Avg AED 4,000 / sq.ft.</div>
                <div style="font-size:11px;color:var(--text3);margin-top:8px;">
                    Premium commercial SZR tower.<br>
                    Trading up to AED 5,050 / sq.ft.
                </div>
            </div>
        </div>
        <div style="background:rgba(201,168,76,0.1);padding:16px;border-radius:8px;border:1px solid var(--border);">
            <div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;margin-bottom:4px;">The Imtiaz Arbitrage</div>
            <div style="font-size:12px;color:var(--text2);line-height:1.5;">Raw District is launching from <strong>AED 649K</strong> (~AED 1,700 / sq.ft.). This represents a massive <strong>40% to 50% discount</strong> per square foot compared to direct SZR competitors like Sobha Central, locking in immediate, undeniable day-one equity before the shovel even hits the dirt.</div>
        </div>
`;

// Insert the comp block right before the closing divs of the deepDive HTML
let newHtml = html.replace(searchPattern, match => match + compBlock);

fs.writeFileSync(filePath, newHtml);
console.log('Comparables added');
