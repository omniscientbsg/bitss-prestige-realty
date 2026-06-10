import { NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET() {
  const proposals = await db.getAllProposals();
  return NextResponse.json(proposals);
}

export async function POST(request) {
  try {
    const data = await request.json();
    const proposal = await db.insertProposal(data);
    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
