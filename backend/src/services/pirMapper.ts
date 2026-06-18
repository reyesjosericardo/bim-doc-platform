/**
 * Maps questionnaire_answers rows to template variables for PIR generation.
 * PIR = Requisitos de Información del Proyecto (ISO 19650). Lo redacta el adjudicador
 * antes de la licitación: objetivos estratégicos de la inversión y puntos clave de decisión.
 * 24 preguntas en 5 bloques, 4 condicionales (PIR-2.6←2.5; PIR-4.2/4.3/4.4←4.1).
 */

export interface PIRTemplateVars {
  project_name: string;
  doc_version: string;
  doc_date: string;
  doc_status: string;
  client_lead: string;
  // Block 1
  sector: string;
  oir_reference: string;
  investment_scope: string;
  // Block 2 — Objetivos estratégicos
  strategic_objectives_list: string;
  budget_target: string;
  schedule_target: string;
  sustainability_goals: string;
  has_certification: string;
  certification: string;
  // Block 3 — Hitos y decisiones
  decision_milestones_list: string;
  key_questions: string;
  requires_models: string;
  decision_info_list: string;
  // Block 4 — LOIN
  has_loin: string;
  loin_geometric: string;
  loin_alphanumeric_list: string;
  loin_documentation_list: string;
  // Block 5 — Gestión y entrega
  bim_uses_list: string;
  exchange_formats_list: string;
  has_transition: string;
  constraints: string;
  observations: string;
}

type AnswerRow = { question_id: string; answer_value: string };

const GEOMETRIC_LEVELS: Record<string, string> = {
  simbolico:   'Simbólica / 2D (sin geometría 3D significativa)',
  conceptual:  'Conceptual (masa o volumen aproximado)',
  generico:    'Genérica (forma y dimensiones esquemáticas)',
  especifico:  'Específica (geometría y dimensiones definidas)',
  fabricacion: 'Detallada para fabricación y montaje',
  construido:  'Tal como construido (as-built verificado)',
  nivel_1: 'Conceptual (masa o volumen aproximado)',
  nivel_2: 'Genérica (forma y dimensiones esquemáticas)',
  nivel_3: 'Específica (geometría y dimensiones definidas)',
  nivel_4: 'Detallada para fabricación y montaje',
  nivel_5: 'Tal como construido (as-built verificado)',
};

function parseMulti(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return value.split('|').map((s) => s.trim()).filter(Boolean);
}
function formatList(value: string | undefined): string {
  const items = parseMulti(value);
  if (items.length === 0) return 'No aplica';
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}
function yesNo(value: string | undefined): string {
  if (!value) return 'No especificado';
  return value;
}
function text(value: string | undefined, fallback = 'No aplica'): string {
  return value?.trim() || fallback;
}
function resolveGeometric(hasLoin: string | undefined, value: string | undefined): string {
  if (hasLoin !== 'Sí') return 'No aplica';
  if (!value) return 'No aplica';
  return GEOMETRIC_LEVELS[value] || value;
}

export function mapPirAnswersToVars(
  answers: AnswerRow[],
  meta: { project_name: string; version: number; status: string },
): PIRTemplateVars {
  const map: Record<string, string> = {};
  for (const a of answers) map[a.question_id] = a.answer_value;

  const get = (id: string) => map[id];
  const conditional = (id: string, triggerId: string) => (get(triggerId) === 'Sí' ? get(id) : undefined);
  const conditionalList = (id: string, triggerId: string) => (get(triggerId) === 'Sí' ? formatList(get(id)) : 'No aplica');

  const statusLabel: Record<string, string> = { borrador: 'Borrador', en_revision: 'En revisión', aprobado: 'Aprobado' };

  return {
    project_name: meta.project_name,
    doc_version:  String(meta.version),
    doc_date:     new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    doc_status:   statusLabel[meta.status] ?? meta.status,
    client_lead:  text(get('PIR-1.4'), 'Sin especificar'),

    // Block 1
    sector:           text(get('PIR-1.2'), 'No especificado'),
    oir_reference:    text(get('PIR-1.3'), 'No aplica'),
    investment_scope: text(get('PIR-1.5'), 'Sin especificar'),

    // Block 2
    strategic_objectives_list: formatList(get('PIR-2.1')),
    budget_target:        text(get('PIR-2.2'), 'No especificado'),
    schedule_target:      text(get('PIR-2.3'), 'No especificado'),
    sustainability_goals: text(get('PIR-2.4'), 'No aplica'),
    has_certification:    yesNo(get('PIR-2.5')),
    certification:        text(conditional('PIR-2.6', 'PIR-2.5'), 'No aplica'),

    // Block 3
    decision_milestones_list: formatList(get('PIR-3.1')),
    key_questions:            text(get('PIR-3.2'), 'No aplica'),
    requires_models:          yesNo(get('PIR-3.3')),
    decision_info_list:       formatList(get('PIR-3.4')),

    // Block 4 — LOIN
    has_loin:                yesNo(get('PIR-4.1')),
    loin_geometric:          resolveGeometric(get('PIR-4.1'), get('PIR-4.2')),
    loin_alphanumeric_list:  conditionalList('PIR-4.3', 'PIR-4.1'),
    loin_documentation_list: conditionalList('PIR-4.4', 'PIR-4.1'),

    // Block 5
    bim_uses_list:         formatList(get('PIR-5.1')),
    exchange_formats_list: formatList(get('PIR-5.2')),
    has_transition:        yesNo(get('PIR-5.3')),
    constraints:           text(get('PIR-5.4'), 'No aplica'),
    observations:          text(get('PIR-5.5'), ''),
  };
}
