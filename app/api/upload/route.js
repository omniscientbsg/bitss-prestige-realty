import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Ensure public/media directory exists
    const uploadDir = join(process.cwd(), "public", "media");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }
    
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    
    console.log(`File saved to ${path}`);

    // Return the relative URL
    return NextResponse.json({ url: `/media/${filename}`, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
