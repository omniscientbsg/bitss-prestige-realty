import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { db } from '../../../../../lib/database';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/proposals/${id}`;

  try {
    const browser = await puppeteer.launch({ 
      headless: true, // using standard headless
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport for a standard desktop size, which renders nicely to A4
    await page.setViewport({ width: 1200, height: 800 });
    
    // Go to the proposal view
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });
    
    await browser.close();
    
    // Log the event
    db.logEvent('pdf_generated');

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal-${id}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
