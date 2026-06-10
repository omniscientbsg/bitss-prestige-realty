const fs = require('fs');

let portalStr = fs.readFileSync('portal.html', 'utf8');

// 1. Remove duplicate generatePDF function
const firstGenIdx = portalStr.indexOf('function generatePDF() {');
if (firstGenIdx > -1) {
  const secondGenIdx = portalStr.indexOf('function generatePDF() {', firstGenIdx + 1);
  if (secondGenIdx > -1) {
    console.log("Found second generatePDF at index", secondGenIdx);
    // Find the end of the script tag or file to truncate, or just remove from secondGenIdx to the end of the script
    const scriptEnd = portalStr.indexOf('</script>', secondGenIdx);
    if (scriptEnd > -1) {
      // It was appended at the end of the file in my previous patch
      portalStr = portalStr.slice(0, secondGenIdx) + portalStr.slice(scriptEnd);
      console.log("Removed duplicate generatePDF.");
    }
  }
}

// 2. Fix Chatbot Buttons
// We know my previous deep-fix didn't match the Chatbot injection string. 
// Let's use a regex to match the old block and replace it.
// The old block looks like:
/*
    // Inject "Request Proposal" button if they want to buy/finalize
    if (data.reply.toLowerCase().includes('proposal') || data.reply.toLowerCase().includes('finalize')) {
      const propBtn = document.createElement('button');
      propBtn.className = 'ai-proposal-btn';
      propBtn.innerHTML = '📄 Send Formal Proposal Request to Agent';
      propBtn.onclick = requestProposalFromAI;
      body.insertBefore(propBtn, typing);
    }
*/
const chatBlockRegex = /\/\/ Inject "Request Proposal" button[\s\S]*?body\.insertBefore\(propBtn,\s*typing\);\s*\}/;
if (chatBlockRegex.test(portalStr)) {
  const newBtnInjection = `// Inject "Request Proposal" buttons if they want to buy/finalize
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
    }`;
  portalStr = portalStr.replace(chatBlockRegex, newBtnInjection);
  console.log("Fixed portal.html: Added WhatsApp and Call buttons to Chatbot.");
} else {
  console.log("Could not find Chatbot button injection block via regex.");
}

fs.writeFileSync('portal.html', portalStr, 'utf8');
console.log("Done patching portal.html (pass 2).");
