import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; format: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(
    `${backendUrl}/api/documents/eir/${params.id}/download/${params.format}`,
    { headers: { 'x-internal-call': 'true' } }
  );

  if (!res.ok) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  const disposition = res.headers.get('content-disposition') ?? `attachment; filename="EIR.${params.format}"`;

  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType, 'Content-Disposition': disposition },
  });
}
