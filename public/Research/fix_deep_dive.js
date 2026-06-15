const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The deep dive layout is breaking because of unescaped quotes or a broken string from previous edits. Let's fix the raw string exactly.
const startIdx = html.indexOf(`deepDive: \`<div style="margin-top:32px; border-top:1px solid var(--border2); padding-top:32px;">`);
const endIdx = html.indexOf(`priceUSD:176000, priceAED:649000,`);

if (startIdx > -1 && endIdx > -1) {
    const cleanDeepDive = `deepDive: \`
<div style="margin-top:32px; border-top:1px solid var(--border2); padding-top:32px;">
    <div class="modal-section-title">360° Property Showcase</div>
    <div style="margin-bottom:32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin:0;">Live Site & Exterior Renders</h4>
            <div style="display:flex; gap:12px; align-items:center;">
                <span style="font-size:12px; color:var(--text3); border:1px solid var(--border); padding:4px 10px; border-radius:100px;">📅 Handover: Q1 2029</span>
                <a href="https://maps.app.goo.gl/KB3iK2axbgYHSFf59" target="_blank" style="font-size:12px; color:var(--gold); text-decoration:none; border:1px solid var(--border); padding:4px 10px; border-radius:100px; display:flex; align-items:center; gap:4px;">📍 View Map</a>
            </div>
        </div>
        <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;">
            <video src="Research/live-site.mp4" onclick="openLightbox('Research/live-site.mp4', true)" style="cursor:pointer; height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;"></video>
            <img src="Research/render1.jpg" onclick="openLightbox('Research/render1.jpg', false)" style="cursor:pointer; height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
            <img src="Research/raw_district_new_render.jpg" onclick="openLightbox('Research/raw_district_new_render.jpg', false)" style="cursor:pointer; height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
            <img src="Research/raw_district_sketch.jpg" onclick="openLightbox('Research/raw_district_sketch.jpg', false)" style="cursor:pointer; height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        </div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div>
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">Architectural Render</h4>
            <img src="Research/render2.jpg" onclick="openLightbox('Research/render2.jpg', false)" style="cursor:pointer; width:100%;border-radius:12px;border:1px solid var(--border2);object-fit:cover;height:240px;">
        </div>
        <div>
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">The Raw Collection</h4>
            <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px;">
                "Where Art Meets Use." Every apartment comes fully furnished with bespoke sculptural pieces. The lobby features permanent installations including a vintage Porsche 911, Dodge Charger, and kinetic furniture like the Vortex Spun Chair.
            </p>
            <ul style="font-size:13px;color:var(--text3);line-height:1.6;padding-left:16px;">
                <li><strong>Honest Materials:</strong> Raw timber, exposed rebar, and embossed chrome.</li>
                <li><strong>Kintsugi Lighting:</strong> Gold/brass lighting set into cracked concrete.</li>
                <li><strong>Turnkey Luxury:</strong> Custom "Soft Landing" sofas and floating leather chairs.</li>
            </ul>
        </div>
    </div>

    <div style="background:var(--glass);border-radius:12px;padding:24px;border:1px solid var(--border);margin-bottom:32px;">
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
            <img src="Research/azizi_data.jpg" onclick="openLightbox('Research/azizi_data.jpg', false)" style="cursor:pointer; height:120px;border-radius:8px;border:1px solid var(--border2);object-fit:cover;">
            <div style="flex:1;">
                <div style="color:var(--gold);font-size:16px;margin-bottom:4px;">📈 The Raw District ROI Calculation</div>
                <div style="font-size:12px;color:var(--text3);line-height:1.5;">At AED 649K entry for a Studio, capturing just the baseline AED 55K rent yields an <strong>8.4% gross ROI</strong>. With Imtiaz's turnkey 'Raw Stay' hospitality model and direct metro bridge premium, targeting AED 65K+ is highly probable, pushing gross yields past <strong>10%</strong>. Add the 40% post-handover leverage, and the cash-on-cash return is exceptional.</div>
            </div>
        </div>
    </div>

    <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">SZR Competitor Pricing Gap</h4>
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
</div>\`,
    `;

    html = html.substring(0, startIdx) + cleanDeepDive + html.substring(endIdx);
    fs.writeFileSync(filePath, html);
    console.log('Fixed Deep Dive HTML layout');
}
