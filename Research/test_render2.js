const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
setTimeout(() => {
    try {
        const window = dom.window;
        window.Chart = class Chart { constructor() { this.destroy = () => {}; } }; 
        window.toggleBundle(1); 
        window.toggleBundle(2); 
        const bundleItemsHTML = window.document.getElementById('bundleItems').innerHTML;
        console.log(bundleItemsHTML);
    } catch (e) {
        console.error(e);
    }
}, 1000);