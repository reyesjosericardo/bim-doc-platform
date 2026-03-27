import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/documents/oir — crear OIR y guardar respuestas iniciales
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, answers } = await req.json();
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

  const document = await prisma.bimDocument.create({
    data: {
      project_id,
      document_type: 'OIR',
      status: 'borrador',
      version: 1,
      created_by: session.user.id,
      questionnaire_answers: answers?.length
        ? {
            createMany: {
              data: answers.map((a: any) => ({
                question_id: a.question_id,
                answer_value: a.answer_value,
                answer_type: a.answer_type,
              })),
              skipDuplicates: true,
            },
          }
        : undefined,
    },
    include: { questionnaire_answers: true },
  });

  return NextResponse.json(document, { status: 201 });
}
