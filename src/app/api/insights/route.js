export const maxDuration = 60; // 60 is the hobby limit.  300; // This function can run for a maximum of 300 seconds
export const dynamic = 'force-dynamic'; // static by default, unless reading the request

import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';

import { makePayload } from './methods';

// responds with generated Pulse Insights for the provided metric
export async function POST(req) {
  // Check if req is defined
  if (!req) {
    const msg = '400: Bad Request';
    console.debug(msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // session token specific to each user
  const token = await getToken({ req });

  // Check if token is defined
  if (token?.tableau) {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      const msg = '400: Bad Request - Invalid JSON';
      console.debug(msg, error);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    // only responds with data to authorized users
    const payload = await makePayload(token.tableau.rest_key, requestBody.metric, token.tableau.tableauUrl);
    if (payload) {
      return NextResponse.json(payload, { status: 200 });
    } else {
      const msg = '500: Internal error: cannot generate payload';
      console.debug(msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } else {
    // Not Signed in
    const msg = '401: Unauthorized';
    console.debug(msg);
    return NextResponse.json({ error: msg }, { status: 401 });
  }
};
