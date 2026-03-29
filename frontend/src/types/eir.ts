import type { AnswerType, AnswersMap, DocumentStatus } from './oir';
export type { AnswerType, AnswersMap, DocumentStatus };

export interface EIRDocument {
  id: string;
  project_id: string;
  status: DocumentStatus;
  version: number;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  questionnaire_answers: { question_id: string; answer_value: string; answer_type: AnswerType }[];
}

export interface EIRWithProgress extends EIRDocument {
  answered_count: number;
  total_questions: number;
  progress_pct: number;
  project: { id: string; name: string };
}
