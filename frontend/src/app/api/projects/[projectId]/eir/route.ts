import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONDITIONAL_TRIGGERS: Record<string, string> = {
  'EIR-3.4': 'EIR-3.3',
  'EIR-4.5': 'EIR-4.4',
  'EIR-5.4': 'EIR-5.3',
  'EIR-6.2': 'EIR-6.1',
  'EIR-6.6': 'EIR-6.5',
};
const BASE_COUNT = 26;

function calcProgress(answers: { question_id: string; answer_value: string }[]) {
  const answerMap: Record<string, string> = {};
  for (const a of answers) answerMap[a.question_id] = a.answer_value;

  const activeConditionals = Object.entries(CONDITIONAL_TRIGGERS)
    .filter(([, trigger]) => answerMap[trigger] === 'Sí').length;
  const total = BASE_COUNT + activeConditionals;

  const conditionalIds = new Set(Object.keys(CONDITIONAL_TRIGGERS));
  const answered = answers.filter(({ question_id, answer_value }) => {
    if (!answer_value) return false;
    if (conditionalIds.has(question_id)) {
      return answerMap[CONDITIONAL_TRIGGERS[question_id]] === 'Sí';
    }
    return true;
  }).length;

  return { answered, total, pct: Math.min(100, Math.round((answered / total) * 100)) };
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const documents = await prisma.bimDocument.findMany({
    where: { project_id: params.projectId, document_type: 'EIR' },
    include: {
      questionnaire_answers: { select: { question_id: true, answer_value: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const withProgress = documents.map((doc) => {
    const { answered, total, pct } = calcProgress(doc.questionnaire_answers);
    return {
      ...doc,
      answered_count: answered,
      total_questions: total,
      progress_pct: pct,
    };
  });

  return NextResponse.json(withProgress);
}
