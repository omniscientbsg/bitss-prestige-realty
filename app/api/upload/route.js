import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "Uploads";

export async function POST(request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: "No filename received." }, { status: 400 });
    }

    // Create unique filename
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${safeName}`;

    // Generate signed upload URL to bypass Vercel limits
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(uniqueFilename);

    if (error) throw error;

    // Get the public URL that will be active once the client finishes uploading
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uniqueFilename);

    return NextResponse.json({ 
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
