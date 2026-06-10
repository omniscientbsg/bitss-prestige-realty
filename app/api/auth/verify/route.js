import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';

export async function POST(request) {
  try {
    const { password, slug: rawSlug } = await request.json();
    const slug = (rawSlug || '').replace(/\s+/g, '-').toLowerCase();
    
    const client = await db.getClientBySlug(slug);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    if (client.password === password) {
      const cookieStore = await cookies();
      cookieStore.set('clientSlug', slug, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60, // 12 hours
        path: '/'
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
