/**
 * Maps questionnaire_answers rows to template variables for AIR generation.
 * AIR = Requisitos de Información del Activo (ISO 19650). Lo redacta el adjudicador;
 * define la información que debe contener el AIM y el traspaso PIM → AIM.
 * 29 preguntas en 6 bloques, 4 condicionales (AIR-2.4←2.3; AIR-4.2/4.3/4.4←4.1).
 */

export interface AIRTemplateVars {
  // Metadata
  project_name: string;
  doc_version: string;
  doc_date: string;
  doc_status: string;
  asset_manager: string;
  // Block 1 — Identificación del activo
  asset_name: string;
  asset_type: string;
  lifecycle_phase: string;
  oir_reference: string;
  // Block 2 — Requisitos del gestor del activo (FM)
  mgmt_objectives_list: string;
  am_standard: string;
  has_cafm: string;
  cafm_system: string;
  cafm_params: string;
  // Block 3 — Contenidos del AIM
  aim_contents_list: string;
  space_naming: string;
  system_naming: string;
  has_commissioning: string;
  has_replacement_cost: string;
  // Block 4 — LOIN del activo (EN 17412-1)
  has_loin: string;
  loin_geometric: string;
  loin_alphanumeric_list: string;
  loin_documentation_list: string;
  // Block 5 — Formatos y traspaso PIM → AIM
  aim_formats_list: string;
  requires_cobie: string;
  handover_timing: string;
  handover_procedure: string;
  classification_system: string;
  // Block 6 — Gobernanza del activo
  aim_platform: string;
  update_frequency: string;
  retention_policy: string;
  has_security: string;
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
  nivel_1: 'Conceptual (masa o volumen aproximado)',
  nivel_2: 'Genérica (forma y dimensiones esquemáticas)',
  nivel_3: 'Específica (geometría y dimensiones definidas)',
  nivel_4: 'Detallada para fabricación y montaje',
  nivel_5: 'Tal como construido (as-built verificado)',
};

const ASSET_TYPES: Record<string, string> = {
  edificio:       'Edificio',
  infraestructura:'Infraestructura',
  industrial:     'Industrial',
  portafolio:     'Portafolio / cartera de activos',
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

function resolveGeometric(hasLoin: string | undefined, value: string | undefined): string {
  if (hasLoin !== 'Sí') return 'No aplica';
  if (!value) return 'No aplica';
  return GEOMETRIC_LEVELS[value] || value;
}

function resolveAssetType(value: string | undefined): string {
  if (!value) return 'No especificado';
  return ASSET_TYPES[value] || value;
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export function mapAirAnswersToVars(
  answers: AnswerRow[],
  meta: { project_name: string; version: number; status: string },
): AIRTemplateVars {
  const map: Record<string, string> = {};
  for (const a of answers) map[a.question_id] = a.answer_value;

  const get = (id: string) => map[id];
  const conditional = (id: string, triggerId: string) =>
    get(triggerId) === 'Sí' ? get(id) : undefined;
  const conditionalList = (id: string, triggerId: string) =>
    get(triggerId) === 'Sí' ? formatList(get(id)) : 'No aplica';

  const statusLabel: Record<string, string> = {
    borrador: 'Borrador',
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
  };

  return {
    project_name: meta.project_name,
    doc_version:  String(meta.version),
    doc_date:     new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    doc_status:   statusLabel[meta.status] ?? meta.status,
    asset_manager: text(get('AIR-1.5'), 'Sin especificar'),

    // Block 1
    asset_name:      text(get('AIR-1.1'), 'Sin especificar'),
    asset_type:      resolveAssetType(get('AIR-1.2')),
    lifecycle_phase: text(get('AIR-1.3'), 'No especificado'),
    oir_reference:   text(get('AIR-1.4'), 'No aplica'),

    // Block 2
    mgmt_objectives_list: formatList(get('AIR-2.1')),
    am_standard:          text(get('AIR-2.2'), 'No especificado'),
    has_cafm:             yesNo(get('AIR-2.3')),
    cafm_system:          text(conditional('AIR-2.4', 'AIR-2.3'), 'No aplica'),
    cafm_params:          text(get('AIR-2.5'), 'No aplica'),

    // Block 3
    aim_contents_list:    formatList(get('AIR-3.1')),
    space_naming:         text(get('AIR-3.2'), 'Sin especificar'),
    system_naming:        text(get('AIR-3.3'), 'Sin especificar'),
    has_commissioning:    yesNo(get('AIR-3.4')),
    has_replacement_cost: yesNo(get('AIR-3.5')),

    // Block 4 — LOIN
    has_loin:                yesNo(get('AIR-4.1')),
    loin_geometric:          resolveGeometric(get('AIR-4.1'), get('AIR-4.2')),
    loin_alphanumeric_list:  conditionalList('AIR-4.3', 'AIR-4.1'),
    loin_documentation_list: conditionalList('AIR-4.4', 'AIR-4.1'),

    // Block 5
    aim_formats_list:    formatList(get('AIR-5.1')),
    requires_cobie:      yesNo(get('AIR-5.2')),
    handover_timing:     text(get('AIR-5.3'), 'No especificado'),
    handover_procedure:  text(get('AIR-5.4'), 'No aplica'),
    classification_system: text(get('AIR-5.5'), 'Sin especificar'),

    // Block 6
    aim_platform:     text(get('AIR-6.1'), 'Sin especificar'),
    update_frequency: text(get('AIR-6.2'), 'No especificado'),
    retention_policy: text(get('AIR-6.3'), 'No especificado'),
    has_security:     yesNo(get('AIR-6.4')),
    observations:     text(get('AIR-6.5'), ''),
  };
}
