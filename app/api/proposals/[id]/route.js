import { NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

export async function DELETE(request, { params }) {
  // Await the params properly in Next 15+ or destructure safely
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const success = await db.deleteProposal(id);
  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });
  }
}
