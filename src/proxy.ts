import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export const proxy = auth((req) => {
  // Protect all /api/projects/* routes — require session
  if (req.nextUrl.pathname.startsWith('/api/projects')) {
    if (!req.auth) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 });
    }
  }
  return NextResponse.next();
});

export const config = {
  // Run middleware on API project routes only
  matcher: ['/api/projects/:path*'],
};
