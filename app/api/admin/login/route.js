import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = 'Admin@Gurmukh2025';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('adminLoggedIn', 'true', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60, // 12 hours
        path: '/'
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Incorrect admin password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
