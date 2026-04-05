import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/documents/oir/${params.id}/narratives`, {
    headers: { 'x-internal-call': 'true' },
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/documents/oir/${params.id}/narratives`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-internal-call': 'true' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
