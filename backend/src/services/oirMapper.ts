/**
 * Maps questionnaire_answers rows to template variables for OIR document generation.
 * Multi-select values are stored pipe-separated: "ISO 19650|BIM Level 2"
 */

export interface OIRTemplateVars {
  // Metadata
  org_name: string;
  project_name: string;
  doc_version: string;
  doc_date: string;
  doc_status: string;
  // Block 1
  org_type: string;
  sector: string;
  country: string;
  standards_list: string;
  responsible_name: string;
  // Block 2
  bim_uses_list: string;
  strategic_objective: string;
  has_asset_plan: string;
  asset_plan_standard: string;
  has_regulatory: string;
  regulatory_description: string;
  // Block 3
  asset_registry_list: string;
  om_requirements_list: string;
  has_risk_mgmt: string;
  risk_types_list: string;
  impact_types_list: string;
  has_eol: string;
  eol_requirements_list: string;
  // Block 4
  exchange_formats_list: string;
  classification_system: string;
  has_cde: string;
  cde_platform: string;
  has_lod: string;
  lod_level: string;
  // Block 5
  update_frequency: string;
  has_security: string;
  security_types_list: string;
  retention_policy: string;
  observations_text: string;
}

type AnswerRow = { question_id: string; answer_value: string };

function parseMulti(value: string | undefined): string[] {
  if (!value) return [];
  // Support both pipe-separated (our storage) and JSON array (legacy)
  if (value.startsWith('[')) {
    try { return JSON.parse(value); } catch { /* fall through */ }
  }
  return value.split('|').map((s) => s.trim()).filter(Boolean);
}

function formatList(value: string | undefined): string {
  const items = parseMulti(value);
  if (items.length === 0) return 'No aplica';
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

function boolText(value: string | undefined): string {
  if (value === 'Sí') return 'Sí';
  if (value === 'No') return 'No';
  return 'No aplica';
}

function conditional(condition: string | undefined, value: string | undefined, fallback = 'No aplica'): string {
  if (condition !== 'Sí') return fallback;
  return value || fallback;
}

function conditionalList(condition: string | undefined, value: string | undefined): string {
  if (condition !== 'Sí') return 'No aplica';
  return formatList(value);
}

export function mapAnswersToVars(
  answers: AnswerRow[],
  meta: { project_name: string; version: number; status: string }
): OIRTemplateVars {
  const m: Record<string, string> = {};
  for (const a of answers) {
    m[a.question_id] = a.answer_value;
  }

  const now = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const statusLabel: Record<string, string> = {
    borrador: 'Borrador',
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
  };

  return {
    // Metadata
    org_name:          m['OIR-1.1'] || 'Sin especificar',
    project_name:      meta.project_name,
    doc_version:       String(meta.version),
    doc_date:          now,
    doc_status:        statusLabel[meta.status] ?? meta.status,
    // Block 1
    org_type:          m['OIR-1.2'] || 'No aplica',
    sector:            m['OIR-1.3'] || 'No aplica',
    country:           m['OIR-1.4'] || 'No aplica',
    standards_list:    formatList(m['OIR-1.5']),
    responsible_name:  m['OIR-1.6'] || 'No aplica',
    // Block 2
    bim_uses_list:         formatList(m['OIR-2.1']),
    strategic_objective:   m['OIR-2.2'] || 'No aplica',
    has_asset_plan:        boolText(m['OIR-2.3']),
    asset_plan_standard:   conditional(m['OIR-2.3'], m['OIR-2.4']),
    has_regulatory:        boolText(m['OIR-2.5']),
    regulatory_description: conditional(m['OIR-2.5'], m['OIR-2.6']),
    // Block 3
    asset_registry_list:  formatList(m['OIR-3.1']),
    om_requirements_list: formatList(m['OIR-3.2']),
    has_risk_mgmt:        boolText(m['OIR-3.3']),
    risk_types_list:      conditionalList(m['OIR-3.3'], m['OIR-3.4']),
    impact_types_list:    formatList(m['OIR-3.5']),
    has_eol:              boolText(m['OIR-3.6']),
    eol_requirements_list: conditionalList(m['OIR-3.6'], m['OIR-3.7']),
    // Block 4
    exchange_formats_list: formatList(m['OIR-4.1']),
    classification_system: m['OIR-4.2'] || 'No aplica',
    has_cde:               m['OIR-4.3'] || 'No aplica',
    cde_platform:          conditional(m['OIR-4.3'], m['OIR-4.4']),
    has_lod:               boolText(m['OIR-4.5']),
    lod_level:             conditional(m['OIR-4.5'], m['OIR-4.6']),
    // Block 5
    update_frequency:    m['OIR-5.1'] || 'No aplica',
    has_security:        boolText(m['OIR-5.2']),
    security_types_list: conditionalList(m['OIR-5.2'], m['OIR-5.3']),
    retention_policy:    m['OIR-5.4'] || 'No aplica',
    observations_text:   conditional(m['OIR-5.5'], m['OIR-5.6'], ''),
  };
}
