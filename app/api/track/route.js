import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function POST(request) {
  try {
    const { slug, action, details } = await request.json();
    
    if (!slug || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.logActivity(slug, action, details);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Failed to track activity" }, { status: 500 });
  }
}
