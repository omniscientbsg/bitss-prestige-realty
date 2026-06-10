const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');
let admin = fs.readFileSync('admin.html', 'utf8');
let portal = fs.readFileSync('portal.html', 'utf8');

// 1. Update server.js: Remove requireAdmin from /api/upload
if (server.includes("app.post('/api/upload', requireAdmin,")) {
  server = server.replace("app.post('/api/upload', requireAdmin,", "app.post('/api/upload',");
  fs.writeFileSync('server.js', server, 'utf8');
  console.log("Updated server.js: Removed requireAdmin from /api/upload.");
}

// 2. Update admin.html: Show PDF link in loadProposals
if (admin.includes('async function loadProposals()')) {
  const pdfHtml = `\${p.pdfUrl ? \`<a href="\${p.pdfUrl}" target="_blank" style="display:inline-block; margin-top:8px; padding:6px 12px; background:rgba(201,168,76,0.1); border:1px solid var(--gold); border-radius:8px; color:var(--gold); text-decoration:none; font-size:12px;">📄 View Attached PDF</a>\` : ''}`;
  
  if (!admin.includes('📄 View Attached PDF')) {
    admin = admin.replace(
      /\<div style="font-size:13px;color:var\(--gold\);margin-top:8px;"\>Client Slug: \$\{escHtml\(p\.clientSlug\)\}\<\/div\>/,
      `<div style="font-size:13px;color:var(--gold);margin-top:8px;">Client Slug: \${escHtml(p.clientSlug)}</div>
        ${pdfHtml}`
    );
    fs.writeFileSync('admin.html', admin, 'utf8');
    console.log("Updated admin.html: Added PDF link to proposals list.");
  }
}

// 3. Update portal.html - JavaScript Logic
const newJSLogic = `
async function generatePDFBlob() {
  const element = document.body;
  const prevStyle = element.style.cssText;
  element.style.background = '#fff';
  element.style.color = '#000';
  document.documentElement.style.background = '#fff';
  
  const opt = {
    margin:       10,
    filename:     'Investment_Proposal_' + clientSlug + '.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
  
  element.style.cssText = prevStyle;
  document.documentElement.style.background = '#0a0a0a';
  return pdfBlob;
}

async function requestProposal() {
  if (bundle.length === 0) {
    if (!confirm("You have not added any properties to your portfolio. Would you like to proceed and send a proposal request without attaching a property portfolio?")) {
      return;
    }
  }
  
  toast("Preparing your proposal...", "info");
  
  let pdfUrl = null;
  if (bundle.length > 0) {
    toast("Generating PDF...", "info");
    const pdfBlob = await generatePDFBlob();
    const formData = new FormData();
    formData.append('video', pdfBlob, 'proposal.pdf');
    
    try {
      toast("Uploading proposal...", "info");
      const upRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const upData = await upRes.json();
      if (upData.url) {
        pdfUrl = upData.url;
      }
    } catch(e) {
      console.error("PDF upload failed", e);
      toast("Failed to attach PDF, but sending request anyway.", "warning");
    }
  }
  
  try {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        clientSlug,
        message: 'Client requested a formal proposal via Dashboard Button.',
        pdfUrl
      })
    });
    if(res.ok) {
      toast("Proposal Request Sent Successfully!", "success");
    } else {
      toast("Error sending proposal.", "error");
    }
  } catch(e) {
    toast("Error reaching server.", "error");
  }
}

async function requestProposalFromAI() {
  if (bundle.length === 0) {
    if (!confirm("You have not added any properties to your portfolio. Would you like to proceed and send a proposal request without attaching a property portfolio?")) {
      return;
    }
  }

  const body = document.getElementById('aiBody');
  const typing = document.getElementById('aiTyping');
  
  const aMsg = document.createElement('div');
  aMsg.className = 'ai-msg ai';
  aMsg.textContent = "Processing your request... Please wait.";
  body.insertBefore(aMsg, typing);

  let pdfUrl = null;
  if (bundle.length > 0) {
    const pdfBlob = await generatePDFBlob();
    const formData = new FormData();
    formData.append('video', pdfBlob, 'proposal.pdf');
    try {
      const upRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const upData = await upRes.json();
      if (upData.url) pdfUrl = upData.url;
    } catch(e) {}
  }

  try {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        clientSlug,
        message: 'Client requested a formal proposal via AI Chatbot.',
        chatHistory,
        pdfUrl
      })
    });
    
    if (res.ok) {
      aMsg.innerHTML = '<span style="color:var(--green)">✅ Proposal request sent successfully! Your agent will review and get back to you shortly.</span>';
    } else {
      aMsg.textContent = "Sorry, there was an error sending your request.";
    }
  } catch (err) {
    aMsg.textContent = "Service unavailable. Please try again later.";
  }
}
`;

const generatePDFRegex = /function generatePDF\(\) \{[\s\S]*?\nasync function requestProposalFromAI\(\) \{[\s\S]*?\}\n\}/;
if (generatePDFRegex.test(portal)) {
  portal = portal.replace(generatePDFRegex, newJSLogic);
} else {
  console.log("Could not replace JS logic using regex.");
}

// 4. Update portal.html - 100x UX CSS
const newCssRules = `
/* 100x PREMIUM UI UPLIFT */
.ai-fab {
  background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.05)) !important;
  border: 1px solid rgba(201,168,76,0.5) !important;
  box-shadow: 0 0 20px rgba(201,168,76,0.2) !important;
  backdrop-filter: blur(10px) !important;
}
.ai-chat-panel {
  background: linear-gradient(145deg, rgba(26,26,37,0.95), rgba(15,15,20,0.98)) !important;
  backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(201,168,76,0.2) !important;
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(201,168,76,0.1) !important;
  border-radius: 20px !important;
}
.ai-header {
  background: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}
.ai-title {
  text-shadow: 0 0 10px rgba(201,168,76,0.3) !important;
}
.ai-msg {
  box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
}
.ai-msg.ai {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  border-radius: 16px 16px 16px 4px !important;
}
.ai-msg.user {
  background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05)) !important;
  border: 1px solid rgba(201,168,76,0.2) !important;
  border-radius: 16px 16px 4px 16px !important;
  color: var(--text) !important;
}
.ai-input-wrap {
  background: rgba(0,0,0,0.2) !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
}
.ai-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.2) !important;
}
.ai-input:focus {
  border-color: rgba(201,168,76,0.5) !important;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.2), 0 0 12px rgba(201,168,76,0.1) !important;
}
.ai-send {
  background: linear-gradient(135deg, var(--gold), #e8c97a) !important;
  color: #000 !important;
  box-shadow: 0 4px 12px rgba(201,168,76,0.3) !important;
  transition: all 0.3s ease !important;
}
.ai-send:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(201,168,76,0.4) !important;
}
.ns-btn {
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
}
.ns-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(201,168,76,0.2) !important;
}
.ns-btn.wa {
  background: linear-gradient(135deg, rgba(37,211,102,0.15), rgba(37,211,102,0.05)) !important;
  border: 1px solid rgba(37,211,102,0.4) !important;
  color: #25d366 !important;
}
.ns-btn.wa:hover {
  box-shadow: 0 8px 24px rgba(37,211,102,0.2) !important;
}
.ns-btn.email {
  background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05)) !important;
  border: 1px solid rgba(201,168,76,0.3) !important;
  color: var(--gold) !important;
}
`;

if (!portal.includes('/* 100x PREMIUM UI UPLIFT */')) {
  portal = portal.replace('</head>', '<style>\n' + newCssRules + '\n</style>\n</head>');
}

fs.writeFileSync('portal.html', portal, 'utf8');
console.log("Updated portal.html: Injected 100x Premium UX CSS & new PDF generation logic.");
