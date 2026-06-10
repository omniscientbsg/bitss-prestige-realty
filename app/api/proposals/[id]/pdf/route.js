import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { db } from '../../../../../lib/database';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Use the live URL on production, localhost in dev
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://bitss-prestige-realty.onrender.com' : 'http://localhost:3000');
  const url = `${baseUrl}/proposals/${id}`;

  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ]
    });
    const page = await browser.newPage();
    
    // Set viewport for a standard desktop size — renders nicely to A4
    await page.setViewport({ width: 1200, height: 800 });
    
    // Go to the proposal view page
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    
    // Generate PDF in A4 with full background colors
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    
    await browser.close();
    
    // Log the event (non-blocking)
    db.logEvent('pdf_generated').catch(() => {});

    // Force download as file — not browser preview
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BITSS-Prestige-Proposal-${id}.pdf"`,
        'Cache-Control': 'no-store',
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
