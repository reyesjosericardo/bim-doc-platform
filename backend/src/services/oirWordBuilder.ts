/**
 * Sprint 3.2 — Builds the OIR Word document (.docx).
 * Structure: Heading 2 for sections, Heading 3 for sub-sections.
 * Each sub-section: narrative paragraph (plain text) → structured data.
 * Supports 'complete' and 'narrative_only' modes.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, PageNumber, NumberFormat, ShadingType,
  TableLayoutType,
} from 'docx';
import type { OIREnrichedVars } from './oirLLMEnricher';

export type DocMode = 'complete' | 'narrative_only';

// ─── Constants ───────────────────────────────────────────────────────────────

const BRAND_COLOR = '1D4ED8';
const HEADER_FILL = 'EFF6FF';
const GRAY_FILL   = 'F9FAFB';

// ─── Paragraph helpers ────────────────────────────────────────────────────────

/** Section title — Word Heading 2 */
function h2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 480, after: 200 },
    run: { color: BRAND_COLOR, bold: true },
  });
}

/** Sub-section title — Word Heading 3 */
function h3(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    run: { color: '374151' },
  });
}

/** Plain body paragraph */
function body(text: string, opts: { bold?: boolean; italic?: boolean } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, ...opts, size: 22 })],
    spacing: { before: 80, after: 80 },
  });
}

/** LLM narrative — plain Normal style, no background */
function nar(text: string): Paragraph[] {
  if (!text) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text, size: 22, color: '111827' })],
      spacing: { before: 80, after: 160 },
    }),
  ];
}

/** Blockquote — indented with gray left border (for user's original text) */
function blockquote(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `"${text}"`, size: 22, italics: true, color: '6B7280' })],
    indent: { left: 480 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: 'D1D5DB' } },
    spacing: { before: 120, after: 160 },
  });
}

/** Bold label */
function label(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: '374151' })],
    spacing: { before: 140, after: 40 },
  });
}

/** Key-value pair */
function kv(key: string, value: string): Paragraph[] {
  const empty = !value || value === 'No aplica';
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `${key}: `, bold: true, size: 22, color: '374151' }),
        new TextRun({ text: value || 'No aplica', size: 22, italics: empty, color: empty ? '9CA3AF' : '111827' }),
      ],
      spacing: { before: 80, after: 60 },
    }),
  ];
}

/** Multiline text split by \n — §Phase headers shown in brand color */
function multilineBody(text: string): Paragraph[] {
  if (!text || text === 'No aplica') return [body('No aplica', { italic: true })];
  return text.split('\n').filter(Boolean).map((line) => {
    if (line.startsWith('§')) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(1), bold: true, size: 22, color: BRAND_COLOR })],
        spacing: { before: 200, after: 40 },
      });
    }
    return body(line.trim());
  });
}

/** Horizontal divider between main sections */
function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    spacing: { before: 240, after: 240 },
  });
}

/** Two-column info table */
function infoTable(rows: [string, string][]): Table {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: HEADER_FILL },
            children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: v || 'No aplica', size: 20 })] })],
          }),
        ],
      })
    ),
  });
}

/** Penn State BIM Uses footnote */
function pennStateNote(): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text: 'Los usos BIM han sido definidos según el framework BIM Uses de la Universidad de Penn State (Computer Integrated Construction Research Program) y adaptados a los requisitos de información establecidos en ISO 19650-1.',
      size: 18, italics: true, color: '6B7280',
    })],
    spacing: { before: 100, after: 80 },
  });
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildOirDocx(
  vars: OIREnrichedVars,
  mode: DocMode = 'complete',
): Promise<Buffer> {
  const full = mode === 'complete';

  const children: (Paragraph | Table)[] = [

    // ── PORTADA ──────────────────────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'REQUISITOS DE INFORMACIÓN DE LA ORGANIZACIÓN', bold: true, size: 48, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '(OIR)', bold: true, size: 36, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Según norma ISO 19650-1', size: 24, color: '6B7280', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
    }),
    infoTable([
      ['Organización', vars.org_name],
      ['Proyecto',     vars.project_name],
      ['Versión',      `v${vars.doc_version}`],
      ['Fecha',        vars.doc_date],
      ['Estado',       vars.doc_status],
      ['Responsable',  vars.responsible_name],
    ]),
    new Paragraph({ text: '', pageBreakBefore: true }),

    // ── SECCIÓN 1 — Objeto y campo de aplicación ──────────────────────────
    h2('1. Objeto y campo de aplicación'),
    ...nar(vars.intro_context ||
      `El presente documento establece los Requisitos de Información de la Organización (OIR) de ${vars.org_name}, ` +
      `conforme a la norma ISO 19650-1:2018, §5.2. Su propósito es definir la información que la organización ` +
      `necesita para la gestión de sus activos a lo largo del ciclo de vida.`),
    ...(full ? [
      ...kv('Sector de actividad', vars.sector),
      ...kv('Ámbito geográfico',   vars.country),
    ] : []),
    divider(),

    // ── SECCIÓN 2 — Identificación de la organización ─────────────────────
    h2('2. Identificación de la organización'),

    h3('2.1 Perfil institucional'),
    ...nar(vars.s2_1_perfil),
    ...(full ? [
      new Paragraph({ spacing: { after: 80 } }),
      infoTable([
        ['Nombre oficial',             vars.org_name],
        ['Tipo de organización',       vars.org_type],
        ['Sector principal',           vars.sector],
        ['País y región de operación', vars.country],
      ]),
    ] : []),

    h3('2.2 Estándares BIM reconocidos'),
    ...nar(vars.s2_2_estandares),
    ...(full ? multilineBody(vars.standards_list) : []),

    h3('2.3 Responsable de gestión de información'),
    ...nar(vars.s2_3_responsable),
    ...(full ? kv('Responsable designado', vars.responsible_name) : []),
    divider(),

    // ── SECCIÓN 3 — Objetivos estratégicos ───────────────────────────────
    h2('3. Objetivos estratégicos'),

    h3('3.1 Usos BIM requeridos'),
    ...nar(vars.s3_1_usos_bim),
    ...(full ? [...multilineBody(vars.bim_uses_list), pennStateNote()] : []),

    h3('3.2 Objetivo estratégico principal'),
    ...nar(vars.s3_2_objetivo),
    ...(full && vars.strategic_objective ? [
      label('Declaración del adjudicador:'),
      blockquote(vars.strategic_objective),
    ] : []),

    h3('3.3 Plan de gestión de activos'),
    ...nar(vars.s3_3_plan_activos),
    ...(full ? [
      ...kv('¿Dispone de plan de gestión de activos vigente?', vars.has_asset_plan),
      ...(vars.has_asset_plan === 'Sí' ? kv('Norma aplicable del plan', vars.asset_plan_standard) : []),
    ] : []),

    h3('3.4 Obligaciones regulatorias'),
    ...nar(vars.s3_4_regulatorio),
    ...(full ? [
      ...kv('¿Existen obligaciones regulatorias?', vars.has_regulatory),
      ...(vars.has_regulatory === 'Sí' ? [label('Descripción:'), body(vars.regulatory_description)] : []),
    ] : []),
    divider(),

    // ── SECCIÓN 4 — Requisitos de información del activo ──────────────────
    h2('4. Requisitos de información del activo'),

    h3('4.1 Registro de activos'),
    ...nar(vars.s4_1_registro),
    ...(full ? multilineBody(vars.asset_registry_list) : []),

    h3('4.2 Operación y mantenimiento'),
    ...nar(vars.s4_2_om),
    ...(full ? multilineBody(vars.om_requirements_list) : []),

    h3('4.3 Gestión de riesgos'),
    ...nar(vars.s4_3_riesgos),
    ...(full ? [
      ...kv('¿Requiere información para gestión de riesgos?', vars.has_risk_mgmt),
      ...(vars.has_risk_mgmt === 'Sí' ? [label('Tipos de riesgo:'), ...multilineBody(vars.risk_types_list)] : []),
    ] : []),

    h3('4.4 Impactos a gestionar'),
    ...nar(vars.s4_4_impactos),
    ...(full ? multilineBody(vars.impact_types_list) : []),

    h3('4.5 Fin de vida útil'),
    ...nar(vars.s4_5_eol),
    ...(full ? [
      ...kv('¿Requiere información para fin de vida útil?', vars.has_eol),
      ...(vars.has_eol === 'Sí' ? [label('Información requerida:'), ...multilineBody(vars.eol_requirements_list)] : []),
    ] : []),
    divider(),

    // ── SECCIÓN 5 — Estándares y formatos ────────────────────────────────
    h2('5. Estándares y formatos de información'),

    h3('5.1 Formatos de intercambio aceptados'),
    ...nar(vars.s5_1_formatos),
    ...(full ? multilineBody(vars.exchange_formats_list) : []),

    h3('5.2 Sistema de clasificación'),
    ...nar(vars.s5_2_clasificacion),
    ...(full ? kv('Sistema seleccionado', vars.classification_system) : []),

    h3('5.3 Entorno común de datos (CDE)'),
    ...nar(vars.s5_3_cde),
    ...(full ? [
      ...kv('¿Usa o planea usar CDE?', vars.has_cde),
      ...(vars.has_cde === 'Sí' ? kv('Plataforma CDE', vars.cde_platform) : []),
    ] : []),

    h3('5.4 Nivel de información necesario'),
    ...nar(vars.s5_4_nivel_info),
    ...(full ? [
      body('Referencia normativa: ISO 19650-1 §11.2', { italic: true }),
      ...kv('¿Nivel de información necesario definido?', vars.has_lod),
      ...(vars.has_lod === 'Sí' ? kv('Nivel mínimo requerido', vars.lod_level) : []),
    ] : []),
    divider(),

    // ── SECCIÓN 6 — Gobernanza ────────────────────────────────────────────
    h2('6. Gobernanza de la información'),

    h3('6.1 Frecuencia de actualización del modelo'),
    ...nar(vars.s6_1_frecuencia),
    ...(full ? kv('Frecuencia establecida', vars.update_frequency) : []),

    h3('6.2 Restricciones de seguridad'),
    ...nar(vars.s6_2_seguridad),
    ...(full ? [
      ...kv('¿Existen restricciones de seguridad?', vars.has_security),
      ...(vars.has_security === 'Sí' ? [label('Tipos de restricciones:'), ...multilineBody(vars.security_types_list)] : []),
    ] : []),

    h3('6.3 Política de retención de información'),
    ...nar(vars.s6_3_retencion),
    ...(full ? kv('Política aplicada', vars.retention_policy) : []),
    divider(),

    // ── SECCIÓN 7 — Observaciones (condicional) ───────────────────────────
    ...(vars.observations_text ? [
      h2('7. Observaciones adicionales'),
      ...nar(vars.s7_observaciones),
      ...(full ? [label('Declaración del adjudicador:'), blockquote(vars.observations_text)] : []),
      divider(),
    ] : []),

    // ── CONTROL DE DOCUMENTO (complete only) ─────────────────────────────
    ...(full ? [
      h2('Control de documento'),
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: ['Versión', 'Fecha', 'Autor', 'Estado', 'Descripción del cambio'].map((h) =>
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: BRAND_COLOR },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20 })] })],
              })
            ),
          }),
          new TableRow({
            children: [
              `v${vars.doc_version}`,
              vars.doc_date,
              vars.responsible_name,
              vars.doc_status,
              'Versión inicial generada desde BIM Doc Platform',
            ].map((val) =>
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: GRAY_FILL },
                children: [new Paragraph({ children: [new TextRun({ text: val, size: 20 })] })],
              })
            ),
          }),
        ],
      }),
    ] : []),
  ];

  const doc = new Document({
    title: `OIR — ${vars.org_name}`,
    description: 'Requisitos de Información de la Organización (OIR) — ISO 19650-1',
    numbering: {
      config: [{
        reference: 'list-numbered',
        levels: [{ level: 0, format: NumberFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT }],
      }],
    },
    sections: [{
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `OIR — ${vars.org_name}`, size: 18, color: '6B7280' }),
              new TextRun({ text: `  |  ISO 19650-1`, size: 18, color: '9CA3AF' }),
              ...(mode === 'narrative_only' ? [new TextRun({ text: '  |  Versión ejecutiva', size: 18, color: '9CA3AF' })] : []),
            ],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `${vars.org_name}  |  OIR v${vars.doc_version}  |  ${vars.doc_date}  |  ISO 19650-1    Pág. `, size: 18, color: '6B7280' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '6B7280' }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
