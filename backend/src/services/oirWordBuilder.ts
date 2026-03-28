/**
 * Builds the OIR Word document (.docx) programmatically using the `docx` package.
 * Structure follows ISO 19650-1 §5.2 with 7 sections + control table.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, PageNumber, NumberFormat, ShadingType,
  TableLayoutType,
} from 'docx';
import type { OIREnrichedVars } from './oirLLMEnricher';

// ─── Helpers ────────────────────────────────────────────────────────────────

const BRAND_COLOR = '1D4ED8'; // blue-700
const HEADER_FILL  = 'EFF6FF'; // blue-50
const GRAY_FILL    = 'F9FAFB';

function h1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { color: BRAND_COLOR, bold: true },
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    run: { color: BRAND_COLOR },
  });
}

function body(text: string, options: { bold?: boolean; italic?: boolean } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, ...options, size: 22 })],
    spacing: { before: 80, after: 80 },
  });
}

function label(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: '374151' })],
    spacing: { before: 160, after: 40 },
  });
}

function multilineBody(text: string): Paragraph[] {
  if (!text || text === 'No aplica') return [body(text || 'No aplica', { italic: true })];
  return text.split('\n').filter(Boolean).map((line) => {
    // §Phase headers produced by formatBimUsesList
    if (line.startsWith('§')) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(1), bold: true, size: 22, color: BRAND_COLOR })],
        spacing: { before: 200, after: 40 },
      });
    }
    return body(line.trim());
  });
}

function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    spacing: { before: 200, after: 200 },
  });
}

function kv(key: string, value: string): Paragraph[] {
  return [label(key), body(value || 'No aplica', { italic: !value || value === 'No aplica' })];
}

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

// ─── Main builder ────────────────────────────────────────────────────────────

/** Renders a narrative paragraph if present; skips silently if empty. */
function narrative(text: string): Paragraph[] {
  if (!text) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text, size: 22, italics: true, color: '374151' })],
      spacing: { before: 120, after: 200 },
    }),
  ];
}

export async function buildOirDocx(vars: OIREnrichedVars): Promise<Buffer> {
  const doc = new Document({
    title: `OIR — ${vars.org_name}`,
    description: 'Requisitos de Información de la Organización (OIR) — ISO 19650-1',
    numbering: {
      config: [
        {
          reference: 'list-numbered',
          levels: [{ level: 0, format: NumberFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT }],
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `OIR — ${vars.org_name}`, size: 18, color: '6B7280' }),
                  new TextRun({ text: `  |  ISO 19650-1`, size: 18, color: '9CA3AF' }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${vars.org_name}  |  OIR v${vars.doc_version}  |  ${vars.doc_date}  |  ISO 19650-1    Pág. `, size: 18, color: '6B7280' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '6B7280' }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // ── PORTADA ─────────────────────────────────────────────────────
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
            ['Organización',   vars.org_name],
            ['Proyecto',       vars.project_name],
            ['Versión',        `v${vars.doc_version}`],
            ['Fecha',          vars.doc_date],
            ['Estado',         vars.doc_status],
            ['Responsable',    vars.responsible_name],
          ]),
          new Paragraph({ text: '', pageBreakBefore: true }),

          // ── SECCIÓN 1 — Objeto y campo de aplicación ─────────────────
          h1('1. Objeto y campo de aplicación'),
          body(
            `El presente documento establece los Requisitos de Información de la Organización (OIR) de ${vars.org_name}, ` +
            `conforme a lo estipulado en la norma ISO 19650-1:2018, §5.2. Su propósito es definir la información que la organización ` +
            `necesita para la gestión de sus activos a lo largo del ciclo de vida.`
          ),
          body(
            `El OIR proporciona la base para la elaboración del AIR (Asset Information Requirements) y el EIR (Exchange Information Requirements), ` +
            `y es vinculante para todos los adjudicatarios que participen en proyectos de la organización.`
          ),
          ...kv('Sector de actividad', vars.sector),
          ...kv('Ámbito geográfico', vars.country),
          label('Estándares BIM reconocidos por la organización'),
          ...multilineBody(vars.standards_list),
          divider(),

          // ── SECCIÓN 2 — Identificación de la organización ────────────
          h1('2. Identificación de la organización'),
          ...narrative(vars.narrative_identification),
          infoTable([
            ['Nombre oficial',             vars.org_name],
            ['Tipo de organización',       vars.org_type],
            ['Sector principal',           vars.sector],
            ['País y región de operación', vars.country],
            ['Responsable de gestión',     vars.responsible_name],
          ]),
          new Paragraph({ spacing: { after: 200 } }),
          label('Estándares BIM reconocidos'),
          ...multilineBody(vars.standards_list),
          divider(),

          // ── SECCIÓN 3 — Objetivos estratégicos ───────────────────────
          h1('3. Objetivos estratégicos'),
          ...narrative(vars.narrative_objectives),

          h2('3.1 Usos BIM requeridos'),
          ...multilineBody(vars.bim_uses_list),
          new Paragraph({
            children: [new TextRun({
              text: 'Los usos BIM han sido definidos según el framework BIM Uses de la Universidad de Penn State (Computer Integrated Construction Research Program) y adaptados a los requisitos de información establecidos en ISO 19650-1.',
              size: 18, italics: true, color: '6B7280',
            })],
            spacing: { before: 100, after: 80 },
          }),

          h2('3.2 Objetivo estratégico principal'),
          body(vars.strategic_objective),

          h2('3.3 Plan de gestión de activos'),
          ...kv('¿Dispone de plan de gestión de activos vigente?', vars.has_asset_plan),
          ...(vars.has_asset_plan === 'Sí' ? kv('Norma aplicable del plan', vars.asset_plan_standard) : []),

          h2('3.4 Obligaciones regulatorias'),
          ...kv('¿Existen obligaciones regulatorias?', vars.has_regulatory),
          ...(vars.has_regulatory === 'Sí' ? [label('Descripción de obligaciones'), body(vars.regulatory_description)] : []),
          divider(),

          // ── SECCIÓN 4 — Requisitos de información del activo ─────────
          h1('4. Requisitos de información del activo'),
          ...narrative(vars.narrative_assets),

          h2('4.1 Registro de activos'),
          label('Información requerida para el registro de activos'),
          ...multilineBody(vars.asset_registry_list),

          h2('4.2 Operación y mantenimiento'),
          label('Información requerida para operación y mantenimiento'),
          ...multilineBody(vars.om_requirements_list),

          h2('4.3 Gestión de riesgos'),
          ...kv('¿Requiere información para gestión de riesgos?', vars.has_risk_mgmt),
          ...(vars.has_risk_mgmt === 'Sí' ? [label('Tipos de riesgo a gestionar'), ...multilineBody(vars.risk_types_list)] : []),

          h2('4.4 Impactos a gestionar'),
          ...multilineBody(vars.impact_types_list),

          h2('4.5 Fin de vida útil'),
          ...kv('¿Requiere información para fin de vida útil?', vars.has_eol),
          ...(vars.has_eol === 'Sí' ? [label('Información requerida para demolición/desmantelamiento'), ...multilineBody(vars.eol_requirements_list)] : []),
          divider(),

          // ── SECCIÓN 5 — Estándares y formatos ────────────────────────
          h1('5. Estándares y formatos'),
          ...narrative(vars.narrative_standards),

          h2('5.1 Formatos de intercambio de información'),
          ...multilineBody(vars.exchange_formats_list),

          h2('5.2 Sistema de clasificación'),
          body(vars.classification_system),

          h2('5.3 Entorno común de datos (CDE)'),
          ...kv('¿Usa o planea usar un entorno común de datos?', vars.has_cde),
          ...(vars.has_cde === 'Sí' ? kv('Plataforma CDE', vars.cde_platform) : []),

          h2('5.4 Nivel de información necesario (ISO 19650-1 §11.2)'),
          ...kv('¿Tiene la organización definido un nivel de información necesario para sus activos?', vars.has_lod),
          ...(vars.has_lod === 'Sí' ? kv('Nivel de información necesario mínimo requerido', vars.lod_level) : []),
          divider(),

          // ── SECCIÓN 6 — Gobernanza ────────────────────────────────────
          h1('6. Gobernanza de la información'),
          ...narrative(vars.narrative_governance),

          h2('6.1 Frecuencia de actualización del modelo'),
          body(vars.update_frequency),

          h2('6.2 Restricciones de seguridad de la información'),
          ...kv('¿Existen restricciones de seguridad?', vars.has_security),
          ...(vars.has_security === 'Sí' ? [label('Tipos de restricciones'), ...multilineBody(vars.security_types_list)] : []),

          h2('6.3 Política de retención de información'),
          body(vars.retention_policy),
          divider(),

          // ── SECCIÓN 7 — Observaciones (condicional) ──────────────────
          ...(vars.observations_text ? [
            h1('7. Observaciones adicionales'),
            body(vars.observations_text),
            divider(),
          ] : []),

          // ── TABLA CONTROL DE DOCUMENTO ────────────────────────────────
          h1('Control de documento'),
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
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
