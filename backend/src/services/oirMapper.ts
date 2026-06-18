/**
 * Maps questionnaire_answers rows to template variables for OIR document generation.
 * Multi-select values are stored pipe-separated: "BU-01|BU-08|BU-23"
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
  has_loin: string;
  loin_geometric: string;
  loin_alphanumeric_list: string;
  loin_documentation_list: string;
  // Block 5
  update_frequency: string;
  has_security: string;
  security_types_list: string;
  retention_policy: string;
  observations_text: string;
}

type AnswerRow = { question_id: string; answer_value: string };

// ─── BIM Uses catalog (Penn State BIM Uses framework) ─────────────────────────

const BIM_USES_CATALOG: Record<string, { es: string; en: string; fase: string }> = {
  'BU-01': { es: 'Modelado de condiciones existentes',           en: 'Existing Conditions Modeling',    fase: 'Planificación' },
  'BU-02': { es: 'Estimación de costos',                         en: 'Cost Estimation',                 fase: 'Planificación' },
  'BU-03': { es: 'Planificación de fases — modelado 4D',         en: 'Phase Planning (4D Modeling)',    fase: 'Planificación' },
  'BU-04': { es: 'Programación de usos del espacio',             en: 'Programming',                     fase: 'Planificación' },
  'BU-05': { es: 'Análisis de sitio',                            en: 'Site Analysis',                   fase: 'Planificación' },
  'BU-06': { es: 'Autoría del diseño',                           en: 'Design Authoring',                fase: 'Diseño' },
  'BU-07': { es: 'Revisiones de diseño',                         en: 'Design Reviews',                  fase: 'Diseño' },
  'BU-08': { es: 'Coordinación 3D — detección de interferencias', en: '3D Coordination',               fase: 'Diseño' },
  'BU-09': { es: 'Análisis estructural',                         en: 'Structural Analysis',             fase: 'Diseño' },
  'BU-10': { es: 'Análisis de iluminación',                      en: 'Lighting Analysis',               fase: 'Diseño' },
  'BU-11': { es: 'Análisis energético',                          en: 'Energy Analysis',                 fase: 'Diseño' },
  'BU-12': { es: 'Análisis de sistemas mecánicos',               en: 'Mechanical Analysis',             fase: 'Diseño' },
  'BU-13': { es: 'Otros análisis de ingeniería',                 en: 'Other Engineering Analysis',      fase: 'Diseño' },
  'BU-14': { es: 'Evaluación de sostenibilidad',                 en: 'Sustainability Evaluation',       fase: 'Diseño' },
  'BU-15': { es: 'Validación normativa y regulatoria',           en: 'Code Validation',                 fase: 'Diseño' },
  'BU-16': { es: 'Planificación de uso del sitio en obra',       en: 'Site Utilization Planning',       fase: 'Construcción' },
  'BU-17': { es: 'Diseño de sistemas constructivos',             en: 'Construction System Design',      fase: 'Construcción' },
  'BU-18': { es: 'Fabricación digital',                          en: 'Digital Fabrication',             fase: 'Construcción' },
  'BU-19': { es: 'Control y planificación 3D en obra',           en: '3D Control and Planning',         fase: 'Construcción' },
  'BU-20': { es: 'Modelado as-built — condición construida',     en: 'Record Modeling (As-Built)',      fase: 'Operación' },
  'BU-21': { es: 'Programación de mantenimiento preventivo',     en: 'Maintenance Scheduling',          fase: 'Operación' },
  'BU-22': { es: 'Análisis de sistemas del edificio',            en: 'Building System Analysis',        fase: 'Operación' },
  'BU-23': { es: 'Gestión de activos',                           en: 'Asset Management',                fase: 'Operación' },
  'BU-24': { es: 'Gestión y seguimiento de espacios',            en: 'Space Management and Tracking',   fase: 'Operación' },
  'BU-25': { es: 'Planificación ante emergencias y desastres',   en: 'Disaster Planning',               fase: 'Operación' },
};

// ─── Nivel de información necesario / LOIN (ISO 19650-1 §11.2 · EN 17412-1) ────
// LOIN se define por sus tres componentes: información geométrica, alfanumérica
// y documental — no por una escala única tipo LOD.

const GEOMETRIC_LEVELS: Record<string, string> = {
  simbolico:   'Simbólica / 2D (sin geometría 3D significativa)',
  conceptual:  'Conceptual (masa o volumen aproximado)',
  generico:    'Genérica (forma y dimensiones esquemáticas)',
  especifico:  'Específica (geometría y dimensiones definidas)',
  fabricacion: 'Detallada para fabricación y montaje',
  construido:  'Tal como construido (as-built verificado)',
  // backward compatibility — legacy escala LOD/LOG y niveles numéricos
  'nivel_1':           'Conceptual (masa o volumen aproximado)',
  'nivel_2':           'Genérica (forma y dimensiones esquemáticas)',
  'nivel_3':           'Específica (geometría y dimensiones definidas)',
  'nivel_4':           'Detallada para fabricación y montaje',
  'nivel_5':           'Tal como construido (as-built verificado)',
  'LOG 1 conceptual':  'Conceptual (masa o volumen aproximado)',
  'LOG 2 esquemático': 'Genérica (forma y dimensiones esquemáticas)',
  'LOG 3 definido':    'Específica (geometría y dimensiones definidas)',
  'LOG 4 detallado':   'Detallada para fabricación y montaje',
  'LOG 5 construido':  'Tal como construido (as-built verificado)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Formats BIM uses grouped by phase with §Phase headers for document rendering.
 * Values are expected to be BU-codes (BU-01 … BU-25).
 * Legacy plain-text values fall into an "Otros" group.
 */
function formatBimUsesList(value: string | undefined): string {
  const codes = parseMulti(value);
  if (codes.length === 0) return 'No aplica';

  const phaseOrder = ['Planificación', 'Diseño', 'Construcción', 'Operación'];
  const grouped: Record<string, string[]> = {};

  for (const code of codes) {
    const info = BIM_USES_CATALOG[code];
    if (info) {
      if (!grouped[info.fase]) grouped[info.fase] = [];
      grouped[info.fase].push(`[${code}] ${info.en} — ${info.es}`);
    } else {
      // Legacy plain-text value
      if (!grouped['Otros']) grouped['Otros'] = [];
      grouped['Otros'].push(code);
    }
  }

  const lines: string[] = [];
  for (const fase of [...phaseOrder, 'Otros']) {
    if (grouped[fase]?.length) {
      lines.push(`§${fase}`);
      grouped[fase].forEach((item, i) => lines.push(`${i + 1}. ${item}`));
    }
  }

  return lines.join('\n');
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

function resolveGeometric(hasLoin: string | undefined, value: string | undefined): string {
  if (hasLoin !== 'Sí') return 'No aplica';
  if (!value) return 'No aplica';
  return GEOMETRIC_LEVELS[value] || value;
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
    bim_uses_list:         formatBimUsesList(m['OIR-2.1']),
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
    has_loin:              boolText(m['OIR-4.5']),
    loin_geometric:        resolveGeometric(m['OIR-4.5'], m['OIR-4.6']),
    loin_alphanumeric_list: conditionalList(m['OIR-4.5'], m['OIR-4.7']),
    loin_documentation_list: conditionalList(m['OIR-4.5'], m['OIR-4.8']),
    // Block 5
    update_frequency:    m['OIR-5.1'] || 'No aplica',
    has_security:        boolText(m['OIR-5.2']),
    security_types_list: conditionalList(m['OIR-5.2'], m['OIR-5.3']),
    retention_policy:    m['OIR-5.4'] || 'No aplica',
    observations_text:   conditional(m['OIR-5.5'], m['OIR-5.6'], ''),
  };
}
