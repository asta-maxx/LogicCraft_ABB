import { NextRequest, NextResponse } from 'next/server';

// Proxy POST requests to Django backend
export async function POST(req: NextRequest) {
  const body = await req.text();
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000/api/validate/';

  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
