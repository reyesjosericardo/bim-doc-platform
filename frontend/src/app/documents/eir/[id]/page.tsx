import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { EIRForm } from '@/components/eir/EIRForm';
import { PrismaClient } from '@prisma/client';
import type { AnswersMap } from '@/types/oir';

const prisma = new PrismaClient();

interface Props {
  params: { id: string };
  searchParams: { projectId?: string };
}

export default async function EIRPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const isNew = params.id === 'new';
  const projectId = searchParams.projectId ?? '';

  let doc = null;
  if (!isNew) {
    doc = await prisma.bimDocument.findUnique({
      where: { id: params.id, document_type: 'EIR' },
      include: {
        questionnaire_answers: { orderBy: { question_id: 'asc' } },
      },
    });
    if (!doc) redirect('/dashboard');
  }

  const initialAnswers: AnswersMap = {};
  if (doc?.questionnaire_answers) {
    for (const a of doc.questionnaire_answers) {
      initialAnswers[a.question_id] = a.answer_value;
    }
  }

  return (
    <EIRForm
      documentId={isNew ? undefined : params.id}
      projectId={doc?.project_id ?? projectId}
      initialAnswers={initialAnswers}
      initialStatus={doc?.status ?? 'borrador'}
    />
  );
}
