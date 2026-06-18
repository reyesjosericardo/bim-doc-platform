/**
 * Sprint 5 — Maps questionnaire_answers rows to template variables for BEP generation.
 * BEP = Plan de Ejecución BIM (ISO 19650-2). Respuesta del adjudicatario al EIR.
 * 34 questions across 6 blocks, 1 conditional (BEP-4.6 ← BEP-4.5).
 */

export interface BEPTemplateVars {
  // Metadata
  project_name: string;
  doc_version: string;
  doc_date: string;
  doc_status: string;
  bim_manager: string;
  // Block 1 — Identificación del BEP
  contractor: string;
  bep_phase: string;
  eir_reference: string;
  bim_objectives: string;
  // Block 2 — Gestión (equipo y responsabilidades)
  bim_coordinator: string;
  iso_roles_list: string;
  disciplines_list: string;
  has_resp_matrix: string;
  risks_text: string;
  // Block 3 — Planificación y documentación
  federation_strategy: string;
  federated_structure_list: string;
  milestones_list: string;
  deliverables_list: string;
  has_midp: string;
  has_tidp: string;
  // Block 4 — Estándares y procedimientos
  naming_system: string;
  classification_system: string;
  loin_geometric: string;
  loin_alphanumeric_list: string;
  loin_documentation_list: string;
  exchange_formats_list: string;
  has_clash: string;
  clash_frequency: string;
  requires_cobie: string;
  // Block 5 — Entorno común de datos (CDE)
  cde_platform: string;
  cde_states_list: string;
  requires_iso_folders: string;
  approval_procedure: string;
  security_policy: string;
  // Block 6 — Software y hardware
  authoring_software_list: string;
  coordination_software: string;
  software_versions: string;
  hardware_resources: string;
  observations: string;
}

type AnswerRow = { question_id: string; answer_value: string };

// ─── LOIN — información geométrica (ISO 19650-1 §11.2 · EN 17412-1) ───────────

const GEOMETRIC_LEVELS: Record<string, string> = {
  simbolico:   'Simbólica / 2D (sin geometría 3D significativa)',
  conceptual:  'Conceptual (masa o volumen aproximado)',
  generico:    'Genérica (forma y dimensiones esquemáticas)',
  especifico:  'Específica (geometría y dimensiones definidas)',
  fabricacion: 'Detallada para fabricación y montaje',
  construido:  'Tal como construido (as-built verificado)',
  // backward compatibility — escala numérica previa
  nivel_1: 'Conceptual (masa o volumen aproximado)',
  nivel_2: 'Genérica (forma y dimensiones esquemáticas)',
  nivel_3: 'Específica (geometría y dimensiones definidas)',
  nivel_4: 'Detallada para fabricación y montaje',
  nivel_5: 'Tal como construido (as-built verificado)',
};

const BEP_PHASES: Record<string, string> = {
  precontractual: 'Precontractual (PRE-BEP)',
  contractual: 'Contractual',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function resolveGeometric(value: string | undefined): string {
  if (!value) return 'No aplica';
  return GEOMETRIC_LEVELS[value] || value;
}

function resolvePhase(value: string | undefined): string {
  if (!value) return 'No especificado';
  return BEP_PHASES[value] || value;
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export function mapBepAnswersToVars(
  answers: AnswerRow[],
  meta: { project_name: string; version: number; status: string },
): BEPTemplateVars {
  const map: Record<string, string> = {};
  for (const a of answers) map[a.question_id] = a.answer_value;

  const get = (id: string) => map[id];
  const conditional = (id: string, triggerId: string) =>
    get(triggerId) === 'Sí' ? get(id) : undefined;

  const statusLabel: Record<string, string> = {
    borrador: 'Borrador',
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
  };

  return {
    // Metadata
    project_name: meta.project_name,
    doc_version:  String(meta.version),
    doc_date:     new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    doc_status:   statusLabel[meta.status] ?? meta.status,
    bim_manager:  text(get('BEP-2.1'), 'Sin especificar'),

    // Block 1
    contractor:      text(get('BEP-1.2'), 'Sin especificar'),
    bep_phase:       resolvePhase(get('BEP-1.3')),
    eir_reference:   text(get('BEP-1.4'), 'No aplica'),
    bim_objectives:  text(get('BEP-1.5'), 'Sin especificar'),

    // Block 2
    bim_coordinator: text(get('BEP-2.2'), 'No especificado'),
    iso_roles_list:  formatList(get('BEP-2.3')),
    disciplines_list: formatList(get('BEP-2.4')),
    has_resp_matrix: yesNo(get('BEP-2.5')),
    risks_text:      text(get('BEP-2.6'), 'No aplica'),

    // Block 3
    federation_strategy:      text(get('BEP-3.1'), 'Sin especificar'),
    federated_structure_list: formatList(get('BEP-3.2')),
    milestones_list:          formatList(get('BEP-3.3')),
    deliverables_list:        formatList(get('BEP-3.4')),
    has_midp:                 yesNo(get('BEP-3.5')),
    has_tidp:                 yesNo(get('BEP-3.6')),

    // Block 4
    naming_system:         text(get('BEP-4.1'), 'Sin especificar'),
    classification_system: text(get('BEP-4.2'), 'Sin especificar'),
    loin_geometric:        resolveGeometric(get('BEP-4.3')),
    loin_alphanumeric_list: formatList(get('BEP-4.4')),
    loin_documentation_list: formatList(get('BEP-4.5')),
    exchange_formats_list: formatList(get('BEP-4.6')),
    has_clash:             yesNo(get('BEP-4.7')),
    clash_frequency:       text(conditional('BEP-4.8', 'BEP-4.7'), 'No aplica'),
    requires_cobie:        yesNo(get('BEP-4.9')),

    // Block 5
    cde_platform:         text(get('BEP-5.1'), 'Sin especificar'),
    cde_states_list:      formatList(get('BEP-5.2')),
    requires_iso_folders: yesNo(get('BEP-5.3')),
    approval_procedure:   text(get('BEP-5.4'), 'No aplica'),
    security_policy:      text(get('BEP-5.5'), 'No aplica'),

    // Block 6
    authoring_software_list: formatList(get('BEP-6.1')),
    coordination_software:   text(get('BEP-6.2'), 'Sin especificar'),
    software_versions:       text(get('BEP-6.3'), 'No aplica'),
    hardware_resources:      text(get('BEP-6.4'), 'No aplica'),
    observations:            text(get('BEP-6.5'), ''),
  };
}
