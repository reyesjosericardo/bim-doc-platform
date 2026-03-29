import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/documents/eir/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const document = await prisma.bimDocument.findUnique({
    where: { id: params.id, document_type: 'EIR' },
    include: {
      questionnaire_answers: { orderBy: { question_id: 'asc' } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(document);
}

// PATCH /api/documents/eir/:id — upsert answers (autosave)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { answers } = await req.json();
  if (!answers?.length) return NextResponse.json({ error: 'answers required' }, { status: 400 });

  const document = await prisma.bimDocument.findUnique({
    where: { id: params.id, document_type: 'EIR' },
  });
  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await Promise.all(
    answers.map((a: any) =>
      prisma.questionnaireAnswer.upsert({
        where: { document_id_question_id: { document_id: params.id, question_id: a.question_id } },
        update: { answer_value: a.answer_value, answer_type: a.answer_type },
        create: {
          document_id: params.id,
          question_id: a.question_id,
          answer_value: a.answer_value,
          answer_type: a.answer_type,
        },
      })
    )
  );

  await prisma.bimDocument.update({
    where: { id: params.id },
    data: { updated_at: new Date() },
  });

  const updated = await prisma.bimDocument.findUnique({
    where: { id: params.id },
    include: { questionnaire_answers: { orderBy: { question_id: 'asc' } } },
  });

  return NextResponse.json(updated);
}
