const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
setTimeout(() => {
    try {
        const window = dom.window;
        window.Chart = class Chart { constructor() { this.destroy = () => {}; } }; 
        window.toggleBundle(1); // add
        window.toggleBundle(2); // add
        console.log("After add: ", window.bundle.length);
        window.toggleBundle(1); // remove
        console.log("After remove: ", window.bundle.length);
        console.log("Empty bundle exists?", !!window.document.getElementById('emptyBundle'));
    } catch (e) {
        console.error(e);
    }
}, 1000);