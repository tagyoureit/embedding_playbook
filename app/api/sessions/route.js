export const dynamic = 'force-dynamic'; // static by default, unless reading the request

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
  if (!req) {
    return NextResponse.json({ error: '400: Bad Request' }, { status: 400 });
  }

  const token = await getToken({ req });

  if (token) {
    try {
      // Clear session cookies
      const response = NextResponse.json({ message: 'All sessions expired' }, { status: 200 });

      // Set cookies to expire immediately
      response.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/', httpOnly: true });
      response.cookies.set('next-auth.callback-url', '', { maxAge: 0, path: '/', httpOnly: true });

      return response;
    } catch (error) {
      console.error('Error in expireSessionsHandler:', error);
      return NextResponse.json({ error: '500: Internal server error' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'NO TOKEN FOUND.  401: Unauthorized' }, { status: 401 });
  }
}
