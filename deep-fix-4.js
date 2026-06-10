const fs = require('fs');

let portal = fs.readFileSync('portal.html', 'utf8');
let lines = portal.split('\n');

const genIdx = lines.findIndex(l => l.includes('function generatePDF'));
const endIdx = lines.findIndex((l, i) => i > genIdx && l.includes('</script>'));

if (genIdx > -1 && endIdx > -1) {
  const newJSLogic = `async function generatePDFBlob() {
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
      document.getElementById('nextStepsOverlay').classList.add('open');
    } else {
      toast("Error sending proposal.", "error");
    }
  } catch(e) {
    toast("Error reaching server.", "error");
  }
}

function closeNextSteps() {
  document.getElementById('nextStepsOverlay').classList.remove('open');
}

async function trackProposalSent() {
  try {
    await fetch('/api/track/' + clientSlug, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'proposal_sent' })
    });
  } catch(e) {}
  document.getElementById('nextStepsOverlay').classList.remove('open');
  closeBundle();
}

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────
let chatHistory = [];

function toggleAIChat() {
  const panel = document.getElementById('aiChatPanel');
  panel.classList.toggle('open');
}

async function sendAiMessage() {
  const inp = document.getElementById('aiInput');
  const text = inp.value.trim();
  if(!text) return;
  inp.value = '';

  const body = document.getElementById('aiBody');
  const typing = document.getElementById('aiTyping');
  
  const uMsg = document.createElement('div');
  uMsg.className = 'ai-msg user';
  uMsg.textContent = text;
  body.insertBefore(uMsg, typing);
  body.scrollTop = body.scrollHeight;

  chatHistory.push({ role: 'user', text });

  typing.style.display = 'flex';
  body.scrollTop = body.scrollHeight;

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        message: text,
        clientSlug,
        propertiesContext: bundle.length > 0 ? bundle : PROPERTIES,
        history: chatHistory.slice(0, -1)
      })
    });
    
    const data = await r.json();
    typing.style.display = 'none';

    const aMsg = document.createElement('div');
    aMsg.className = 'ai-msg ai';
    aMsg.innerHTML = data.reply.replace(/\\n/g, '<br>');
    body.insertBefore(aMsg, typing);
    
    chatHistory.push({ role: 'model', text: data.reply });

    if (data.reply.toLowerCase().includes('proposal') || data.reply.toLowerCase().includes('finalize')) {
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
    }

  } catch(e) {
    typing.style.display = 'none';
    const aMsg = document.createElement('div');
    aMsg.className = 'ai-msg ai';
    aMsg.style.color = 'var(--red)';
    aMsg.textContent = 'Sorry, the AI is disconnected right now. Please message your agent directly.';
    body.insertBefore(aMsg, typing);
  }
  body.scrollTop = body.scrollHeight;
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
}`;

  lines.splice(genIdx, endIdx - genIdx, newJSLogic);
  fs.writeFileSync('portal.html', lines.join('\n'), 'utf8');
  console.log("Replaced JS successfully.");
} else {
  console.log("Could not find indices.");
}
