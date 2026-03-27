import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const valid = ['borrador', 'en_revision', 'aprobado'];
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  if (status === 'aprobado') {
    const allowed = ['adjudicador', 'adj_principal'];
    if (!allowed.includes(session.user.role)) {
      return NextResponse.json({ error: 'Solo adjudicador o adj_principal puede aprobar' }, { status: 403 });
    }
  }

  const updated = await prisma.bimDocument.update({
    where: { id: params.id },
    data: {
      status,
      approved_by: status === 'aprobado' ? session.user.id : undefined,
    },
  });

  return NextResponse.json(updated);
}
