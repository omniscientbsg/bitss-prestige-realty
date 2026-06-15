const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The regex will find the payment plan we just wrote and replace it with the post-handover plan
const oldRegex = /paymentPlan:\[\{l:'On Booking',p:24,phase:'Now'\},\{l:'Construction',p:26,phase:'Quarterly'\},\{l:'On Handover',p:50,phase:'Q1 2029'\}\],/;
const newProp = `paymentPlan:[{l:'On Booking',p:24,phase:'Now'},{l:'Construction',p:35,phase:'Quarterly'},{l:'Handover',p:5,phase:'Q1 2029'},{l:'Post Handover',p:40,phase:'3 Yrs (3.3%/Q)'}],`;

html = html.replace(oldRegex, newProp);

// Update USP array to highlight the post-handover plan
const oldUsps = /usps:\['Direct Metro Bridge','Fully Furnished','Raw Stay Operated','SZR Address'\],/;
const newUsps = `usps:['3-Yr Post Handover','Direct Metro Bridge','Raw Stay Operated','SZR Address'],`;
html = html.replace(oldUsps, newUsps);

// Update hotUsps to highlight the post-handover plan
const oldHotUsps = /hotUsps:\['Direct SZR Metro','AED 649K Entry'\],/;
const newHotUsps = `hotUsps:['40% Post Handover','AED 649K Entry'],`;
html = html.replace(oldHotUsps, newHotUsps);

fs.writeFileSync(filePath, html);
console.log('Replaced successfully');