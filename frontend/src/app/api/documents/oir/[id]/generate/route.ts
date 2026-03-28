import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Forward mode from the request body to the Express backend
  const body = await req.json().catch(() => ({}));
  const mode = body?.mode === 'narrative_only' ? 'narrative_only' : 'complete';

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/documents/oir/${params.id}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-call': 'true' },
    body: JSON.stringify({ mode }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
