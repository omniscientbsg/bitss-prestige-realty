const fs = require('fs');
const path = require('path');

// 1. FIX SERVER.JS
let serverPath = path.join(__dirname, 'server.js');
let serverStr = fs.readFileSync(serverPath, 'utf8');

if (!serverStr.includes("app.post('/api/upload'")) {
  const uploadLogic = `
app.post('/api/upload', requireAdmin, upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, filename: req.file.filename });
});
`;
  // Insert it after const upload = multer({ ... });
  // We'll just search for the end of the multer block or simply insert it before the first app.post
  const firstPostIndex = serverStr.indexOf("app.post(");
  if (firstPostIndex > -1) {
    serverStr = serverStr.slice(0, firstPostIndex) + uploadLogic + "\n" + serverStr.slice(firstPostIndex);
    fs.writeFileSync(serverPath, serverStr, 'utf8');
    console.log("Fixed server.js: Added /api/upload endpoint.");
  }
} else {
  console.log("server.js already has /api/upload.");
}

// 2. FIX PORTAL.HTML
let portalPath = path.join(__dirname, 'portal.html');
let portalStr = fs.readFileSync(portalPath, 'utf8');

// 2a. Add html2pdf
if (!portalStr.includes('html2pdf.bundle.min.js')) {
  portalStr = portalStr.replace(
    '</title>',
    '</title>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>'
  );
  console.log("Fixed portal.html: Added html2pdf.bundle.min.js");
}

// 2b. Remove duplicate generatePDF function block
// The old block looks like:
// function generatePDF() {
//   toast('Generating PDF...', 'info');
//   window.print();
//   setTimeout(() => {
//     toast('PDF Downloaded successfully!', 'success');
//   }, 1000);
// }
// We want to delete this specific string entirely.
const duplicateStr = `function generatePDF() {
  toast('Generating PDF...', 'info');
  window.print();
  setTimeout(() => {
    toast('PDF Downloaded successfully!', 'success');
  }, 1000);
}`;
if (portalStr.includes(duplicateStr)) {
  portalStr = portalStr.replace(duplicateStr, '');
  console.log("Fixed portal.html: Removed duplicate generatePDF block.");
}

// 2c. Fix Hero CSS
// Currently: .hero{position:relative;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;overflow:hidden}
const oldHeroCss = ".hero{position:relative;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;overflow:hidden}";
const newHeroCss = ".hero{position:relative;min-height:100vh;padding:80px 20px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;overflow:hidden}";
if (portalStr.includes(oldHeroCss)) {
  portalStr = portalStr.replace(oldHeroCss, newHeroCss);
  console.log("Fixed portal.html: Updated .hero CSS.");
}

// 2d. Fix Video CSS
// Currently: style="width:100%; max-height:400px; object-fit:cover; display:none; border-radius:12px; margin-top:24px; border:1px solid var(--border2);"
const oldVideoStyle = 'style="width:100%; max-height:400px; object-fit:cover; display:none; border-radius:12px; margin-top:24px; border:1px solid var(--border2);"';
const newVideoStyle = 'style="width:100%; max-width:800px; aspect-ratio:16/9; height:auto; object-fit:contain; display:none; border-radius:12px; margin-top:24px; border:1px solid var(--border2);"';
if (portalStr.includes(oldVideoStyle)) {
  portalStr = portalStr.replace(oldVideoStyle, newVideoStyle);
  console.log("Fixed portal.html: Updated #heroVideo inline styles.");
}

// 2e. Chatbot Buttons
// Currently:
//     // Inject "Request Proposal" button if they want to buy/finalize
//     if (data.reply.toLowerCase().includes('proposal') || data.reply.toLowerCase().includes('finalize')) {
//       const propBtn = document.createElement('button');
//       propBtn.className = 'ai-proposal-btn';
//       propBtn.innerHTML = '📄 Send Formal Proposal Request to Agent';
//       propBtn.onclick = requestProposalFromAI;
//       body.insertBefore(propBtn, typing);
//     }
// We want to replace it with 3 buttons.
const oldBtnInjection = `if (data.reply.toLowerCase().includes('proposal') || data.reply.toLowerCase().includes('finalize')) {
      const propBtn = document.createElement('button');
      propBtn.className = 'ai-proposal-btn';
      propBtn.innerHTML = '📄 Send Formal Proposal Request to Agent';
      propBtn.onclick = requestProposalFromAI;
      body.insertBefore(propBtn, typing);
    }`;
const newBtnInjection = `if (data.reply.toLowerCase().includes('proposal') || data.reply.toLowerCase().includes('finalize')) {
      const btnWrapper = document.createElement('div');
      btnWrapper.style.display = 'flex';
      btnWrapper.style.flexDirection = 'column';
      btnWrapper.style.gap = '8px';
      btnWrapper.style.marginTop = '12px';

      const callBtn = document.createElement('button');
      callBtn.className = 'ns-btn wa';
      callBtn.style.padding = '10px';
      callBtn.style.marginBottom = '0';
      callBtn.innerHTML = '📞 Call Agent Directly';
      callBtn.onclick = () => window.open('tel:+' + client.agent.whatsapp, '_self');

      const waBtn = document.createElement('button');
      waBtn.className = 'ns-btn wa';
      waBtn.style.padding = '10px';
      waBtn.style.marginBottom = '0';
      waBtn.innerHTML = '💬 Request via WhatsApp';
      waBtn.onclick = () => {
        const txt = encodeURIComponent('Hi ' + client.agent.name + ', I would like to request a formal proposal based on the portfolio you shared.');
        window.open('https://wa.me/' + client.agent.whatsapp + '?text=' + txt, '_blank');
      };

      const propBtn = document.createElement('button');
      propBtn.className = 'ns-btn email';
      propBtn.style.padding = '10px';
      propBtn.style.marginBottom = '0';
      propBtn.innerHTML = '📄 Send Formal Proposal Request';
      propBtn.onclick = requestProposalFromAI;
      
      btnWrapper.appendChild(callBtn);
      btnWrapper.appendChild(waBtn);
      btnWrapper.appendChild(propBtn);
      body.insertBefore(btnWrapper, typing);
    }`;

if (portalStr.includes(oldBtnInjection)) {
  portalStr = portalStr.replace(oldBtnInjection, newBtnInjection);
  console.log("Fixed portal.html: Added WhatsApp and Call buttons to Chatbot.");
}

fs.writeFileSync(portalPath, portalStr, 'utf8');
console.log("Done patching portal.html");
