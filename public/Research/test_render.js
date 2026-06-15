const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
setTimeout(() => {
    try {
        const window = dom.window;
        window.Chart = class Chart { constructor() { this.destroy = () => {}; } }; // mock Chart
        
        window.toggleBundle(1); // Add property 1
        window.toggleBundle(2); // Add property 2
        const bundleItemsHTML = window.document.getElementById('bundleItems').innerHTML;
        const analysisDisplay = window.document.getElementById('bundleAnalysis').style.display;
        
        console.log("Bundle Items contains '&times;' ? :", bundleItemsHTML.includes('&times;'));
        console.log("Analysis Display:", analysisDisplay);
        console.log("Number of properties in bundle:", window.bundle.length);
        
        window.toggleBundle(1); // Remove property 1
        window.toggleBundle(2); // Remove property 2
        
        console.log("Empty bundle exists?", !!window.document.getElementById('emptyBundle'));
        
    } catch (e) {
        console.error(e);
    }
}, 1000);