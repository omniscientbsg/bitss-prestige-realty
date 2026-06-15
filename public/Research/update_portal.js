const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

const oldRegex = /    id:2, name:'Imtiyaz Coral Residences'[\s\S]*?projValues:\[320000,342000,368000,397000,430000,455000\],/;

const newProp = `    id:2, name:'Raw District', developer:'Imtiaz Developments', location:'Sheikh Zayed Road, Downtown Jebel Ali', locationShort:'SZR / Jebel Ali',
    type:'offplan', emoji:'🏗️', phase:'Phase 1',
    priceUSD:176000, priceAED:649000,
    grossYield:10.5, capitalGain5yr:45, annualRentalUSD:18480,
    downPayment:20, paymentPlan:[{l:'On Booking',p:24,phase:'Now'},{l:'Construction',p:26,phase:'Quarterly'},{l:'On Handover',p:50,phase:'Q1 2029'}],
    distress:false, hot:true,
    usps:['Direct Metro Bridge','Fully Furnished','Raw Stay Operated','SZR Address'],
    hotUsps:['Direct SZR Metro','AED 649K Entry'],
    why:[
      {icon:'🚇',title:'Direct Metro Tunnel',desc:'Unlike Sobha, Peace Homes, and Danube launches on SZR, Raw District has a direct pedestrian bridge to the metro.'},
      {icon:'📈',title:'Underpriced SZR Entry',desc:'Other recent SZR launches hit the market at much higher psf. AED 649K for an SZR address with metro access is instant built-in equity.'},
      {icon:'🏨',title:'Raw Stay Management',desc:'Turnkey hospitality model. Imtiaz owns and operates the serviced apartments, ensuring premium yields over long-term lets.'},
      {icon:'🌟',title:'Azizi Baseline Premium',desc:'The Azizi plot next door establishes baseline rental yields, but Imtiaz superior urban lifestyle build quality guarantees a rental premium.'},
    ],
    projValues:[176000,195000,215000,235000,255000,280000],`;

html = html.replace(oldRegex, newProp);

fs.writeFileSync(filePath, html);
console.log('Replaced successfully');