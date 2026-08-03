import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://yourdomain.com',
  'https://featured.yourdomain.com',
  'https://reviews.yourdomain.com',
  'https://contact.yourdomain.com',
  'http://localhost:3000',
];

type ApiHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse;

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function withCors(handler: ApiHandler) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      return setCorsHeaders(response, origin);
    }

    const response = await handler(request, ...args);
    return setCorsHeaders(response, origin);
  };
}
