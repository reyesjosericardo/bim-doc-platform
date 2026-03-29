/**
 * Maps questionnaire_answers rows to template variables for EIR document generation.
 * EIR = Requisitos de Intercambio de Información (ISO 19650 "Pliego BIM")
 * 31 questions across 6 blocks, 5 conditionals.
 */

export interface EIRTemplateVars {
  // Metadata
  project_name: string;
  doc_version: string;
  doc_date: string;
  doc_status: string;
  bim_manager: string;
  // Block 1 — Identificación del proyecto
  project_description: string;
  sector: string;
  phases_list: string;
  // Block 2 — Información previa disponible
  has_topo: string;
  has_geo: string;
  has_aim: string;
  has_style_book: string;
  other_docs: string;
  // Block 3 — Hitos y entregables
  deliverables_list: string;
  requires_ifc: string;
  has_clash: string;
  clash_frequency: string;
  bep_timing: string;
  // Block 4 — Estándares de información
  naming_system: string;
  classification_system: string;
  exchange_formats_list: string;
  requires_software: string;
  software_versions: string;
  requires_cobie: string;
  // Block 5 — LOIN
  loin_level: string;
  loin_components_list: string;
  loin_by_discipline: string;
  loin_disciplines_list: string;
  // Block 6 — CDE y gobernanza
  client_provides_cde: string;
  cde_platform: string;
  cde_states_list: string;
  requires_iso_folders: string;
  has_restrictions: string;
  restrictions_description: string;
}

type AnswerRow = { question_id: string; answer_value: string };

// ─── LOIN levels (ISO 19650-1 §11.2) ─────────────────────────────────────────

const LOIN_LEVELS: Record<string, string> = {
  nivel_1: 'Nivel 1 — Representación conceptual',
  nivel_2: 'Nivel 2 — Representación genérica',
  nivel_3: 'Nivel 3 — Representación específica',
  nivel_4: 'Nivel 4 — Representación detallada',
  nivel_5: 'Nivel 5 — Representación construida',
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

function resolveLoін(value: string | undefined): string {
  if (!value) return 'No aplica';
  return LOIN_LEVELS[value] || value;
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export function mapEirAnswersToVars(
  answers: AnswerRow[],
  meta: { project_name: string; version: number; status: string },
): EIRTemplateVars {
  const map: Record<string, string> = {};
  for (const a of answers) map[a.question_id] = a.answer_value;

  const get = (id: string) => map[id];
  const conditional = (id: string, triggerId: string) =>
    get(triggerId) === 'Sí' ? get(id) : undefined;

  // Status label
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
    bim_manager:  text(get('EIR-1.5'), 'Sin especificar'),

    // Block 1
    project_description: text(get('EIR-1.2'), 'Sin descripción'),
    sector:              text(get('EIR-1.3'), 'No especificado'),
    phases_list:         formatList(get('EIR-1.4')),

    // Block 2
    has_topo:       yesNo(get('EIR-2.1')),
    has_geo:        yesNo(get('EIR-2.2')),
    has_aim:        yesNo(get('EIR-2.3')),
    has_style_book: yesNo(get('EIR-2.4')),
    other_docs:     text(get('EIR-2.5'), 'Ninguno'),

    // Block 3
    deliverables_list: formatList(get('EIR-3.1')),
    requires_ifc:      yesNo(get('EIR-3.2')),
    has_clash:         yesNo(get('EIR-3.3')),
    clash_frequency:   text(conditional('EIR-3.4', 'EIR-3.3'), 'No aplica'),
    bep_timing:        text(get('EIR-3.5'), 'No especificado'),

    // Block 4
    naming_system:        text(get('EIR-4.1'), 'Sin especificar'),
    classification_system: text(get('EIR-4.2'), 'Sin especificar'),
    exchange_formats_list: formatList(get('EIR-4.3')),
    requires_software:    yesNo(get('EIR-4.4')),
    software_versions:    text(conditional('EIR-4.5', 'EIR-4.4'), 'No aplica'),
    requires_cobie:       yesNo(get('EIR-4.6')),

    // Block 5
    loin_level:          resolveLoін(get('EIR-5.1')),
    loin_components_list: formatList(get('EIR-5.2')),
    loin_by_discipline:  yesNo(get('EIR-5.3')),
    loin_disciplines_list: text(conditional('EIR-5.4', 'EIR-5.3'), 'No aplica'),

    // Block 6
    client_provides_cde:    yesNo(get('EIR-6.1')),
    cde_platform:           text(conditional('EIR-6.2', 'EIR-6.1'), 'No aplica'),
    cde_states_list:        formatList(get('EIR-6.3')),
    requires_iso_folders:   yesNo(get('EIR-6.4')),
    has_restrictions:       yesNo(get('EIR-6.5')),
    restrictions_description: text(conditional('EIR-6.6', 'EIR-6.5'), 'No aplica'),
  };
}
