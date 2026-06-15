const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

setTimeout(() => {
    try {
        const window = dom.window;
        const document = window.document;
        
        console.log("Initial bundle length:", window.bundle.length);
        window.toggleBundle(1);
        console.log("Bundle after adding 1:", window.bundle.length);
        console.log("BundleItems content:", document.getElementById('bundleItems').innerHTML);
        window.toggleBundle(2);
        console.log("Bundle after adding 2:", window.bundle.length);
        console.log("BundleItems content:", document.getElementById('bundleItems').innerHTML);
        
        window.toggleBundle(1);
        console.log("Bundle after removing 1:", window.bundle.length);
        console.log("BundleItems content:", document.getElementById('bundleItems').innerHTML);
    } catch (err) {
        console.log(err);
    }
}, 1000);