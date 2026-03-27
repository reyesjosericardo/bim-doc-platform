export type AnswerType = 'text' | 'textarea' | 'select' | 'multi_select' | 'boolean';

export interface Answer {
  question_id: string;
  answer_value: string;
  answer_type: AnswerType;
}

export type AnswersMap = Record<string, string>;

export type DocumentStatus = 'borrador' | 'en_revision' | 'aprobado';

export interface OIRDocument {
  id: string;
  project_id: string;
  status: DocumentStatus;
  version: number;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  questionnaire_answers: Answer[];
}

export interface OIRWithProgress extends OIRDocument {
  answered_count: number;
  total_questions: number;
  progress_pct: number;
  project: { id: string; name: string };
}

export interface Project {
  id: string;
  name: string;
  status: string;
  organization_id: string;
  created_at: string;
}
