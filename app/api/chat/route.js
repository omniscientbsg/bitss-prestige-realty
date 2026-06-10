import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function POST(request) {
  let clientContext;
  try {
    const body = await request.json();
    const { messages } = body;
    clientContext = body.clientContext;
    
    // Retrieve API key
    const settings = await db.getSettings();
    const apiKey = settings.google_api_key;
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured in Admin Settings." }, { status: 400 });
    }

    // Prepare system instructions based on context
    const agentName = clientContext.agentName ? `${clientContext.agentName} Assistant` : 'Wealth Advisor Assistant';
    let systemInstruction = `You are a professional real estate ${agentName} for a firm in Dubai. 
You are speaking to a client named ${clientContext.name}. 
Be extremely concise, polite, and data-driven. Do NOT use markdown. Keep responses to 2-3 short sentences.`;

    if (clientContext.properties && clientContext.properties.length > 0) {
      const propNames = clientContext.properties.map(p => p.name).join(", ");
      systemInstruction += `\n\nThe client's current portfolio/assigned properties include: ${propNames}.`;
    }

    // Log the user's message BEFORE calling API
    const userMsg = messages[messages.length - 1];
    if (userMsg && userMsg.role === 'user') {
      await db.logChat(clientContext.slug, 'user', userMsg.content);
    }

    // Convert messages to Gemini format
    const geminiContents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: systemInstruction }
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      const errMsg = data.error.message || "Failed to generate response.";
      await db.logChat(clientContext.slug, 'error', `System Error: ${errMsg}`);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I cannot assist with that right now.";
    
    await db.logChat(clientContext.slug, 'assistant', aiText);

    return NextResponse.json({ reply: aiText });
  } catch (error) {
    console.error("Chat API error:", error);
    if (clientContext?.slug) {
      await db.logChat(clientContext.slug, 'error', `Internal Server Error: ${error.message}`);
    }
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}
