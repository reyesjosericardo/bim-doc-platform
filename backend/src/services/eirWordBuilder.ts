/**
 * Sprint 4 — Builds the EIR Word document (.docx).
 * Structure: Heading 2 for sections, Heading 3 for sub-sections.
 * Each sub-section: narrative paragraph → structured data.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, PageNumber, NumberFormat, ShadingType, TableLayoutType,
} from 'docx';
import type { EIREnrichedVars } from './eirLLMEnricher';

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_COLOR = '1D4ED8';
const HEADER_FILL = 'EFF6FF';

// ─── Paragraph helpers ────────────────────────────────────────────────────────

function h2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 480, after: 200 },
    run: { color: BRAND_COLOR, bold: true },
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    run: { color: '374151' },
  });
}

function body(text: string, opts: { bold?: boolean; italic?: boolean } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, ...opts, size: 22 })],
    spacing: { before: 80, after: 80 },
  });
}

function nar(text: string): Paragraph[] {
  if (!text) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text, size: 22, color: '111827' })],
      spacing: { before: 80, after: 160 },
    }),
  ];
}

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

function multilineBody(text: string): Paragraph[] {
  if (!text || text === 'No aplica') return [body('No aplica', { italic: true })];
  return text.split('\n').filter(Boolean).map((line) => body(line.trim()));
}

function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    spacing: { before: 240, after: 240 },
  });
}

function infoTable(rows: [string, string][]): Table {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: HEADER_FILL },
            children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: v || 'No aplica', size: 20 })] })],
          }),
        ],
      })
    ),
  });
}

// ─── Cover table ─────────────────────────────────────────────────────────────

function coverTable(vars: EIREnrichedVars): Table {
  const rows: [string, string][] = [
    ['Proyecto', vars.project_name],
    ['Versión', `v${vars.doc_version}`],
    ['Fecha', vars.doc_date],
    ['Estado', vars.doc_status],
    ['BIM Manager', vars.bim_manager],
  ];
  return infoTable(rows);
}

// ─── Control de documento table ───────────────────────────────────────────────

function controlTable(vars: EIREnrichedVars): Table {
  const headerRow = new TableRow({
    children: ['Versión', 'Fecha', 'BIM Manager', 'Estado', 'Descripción del cambio'].map((h) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: '1D4ED8' },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF' })] })],
      })
    ),
  });

  const dataRow = new TableRow({
    children: [
      `v${vars.doc_version}`,
      vars.doc_date,
      vars.bim_manager,
      vars.doc_status,
      'Versión inicial generada desde BIM Doc Platform',
    ].map((v) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: v, size: 20 })] })],
      })
    ),
  });

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, dataRow],
  });
}

// ─── Header/Footer ────────────────────────────────────────────────────────────

function makeHeader(vars: EIREnrichedVars): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `EIR — ${vars.project_name}`, bold: true, size: 18, color: BRAND_COLOR }),
          new TextRun({ text: `\t\tISO 19650-2 | v${vars.doc_version} | ${vars.doc_date}`, size: 18, color: '6B7280' }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
        tabStops: [{ type: 'right', position: 9360 }],
      }),
    ],
  });
}

function makeFooter(vars: EIREnrichedVars): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${vars.project_name}  ·  EIR v${vars.doc_version}  ·  ${vars.doc_date}  ·  ISO 19650-2`, size: 16, color: '6B7280' }),
        ],
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildEirDocx(vars: EIREnrichedVars): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // ── Cover page ──────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'REQUISITOS DE', bold: true, size: 64, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1440, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'INTERCAMBIO DE', bold: true, size: 64, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'INFORMACIÓN', bold: true, size: 64, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '(EIR) — ISO 19650-2', italics: true, size: 28, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 960 },
    }),
    coverTable(vars),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
  );

  // ── Section 1 — Objeto y campo de aplicación ────────────────────────────────
  children.push(
    h2('1. Objeto y campo de aplicación'),
    ...nar(vars.intro_context),
    ...kv('Sector de actividad', vars.sector),
    ...kv('Fases del proyecto cubiertas', ''),
    ...multilineBody(vars.phases_list),
    ...kv('BIM Manager del adjudicador', vars.bim_manager),
    divider(),
  );

  // ── Section 2 — Información previa disponible ────────────────────────────────
  children.push(
    h2('2. Información previa disponible'),
    ...nar(vars.s2_info_previa),
    infoTable([
      ['Levantamiento topográfico', vars.has_topo],
      ['Estudio geotécnico', vars.has_geo],
      ['Modelo de estado actual (AIM / nube de puntos)', vars.has_aim],
      ['Libro de estilo / fichas técnicas del cliente', vars.has_style_book],
      ['Otros documentos de referencia', vars.other_docs],
    ]),
    divider(),
  );

  // ── Section 3 — Hitos y entregables de información ──────────────────────────
  children.push(h2('3. Hitos y entregables de información'));

  // 3.1
  children.push(h3('3.1 Entregables mínimos requeridos'));
  children.push(...nar(vars.s3_1_entregables));
  children.push(...kv('Entregables mínimos', ''));
  children.push(...multilineBody(vars.deliverables_list));
  children.push(...kv('IFC obligatorio en cada hito', vars.requires_ifc));

  // 3.2
  children.push(h3('3.2 Detección de conflictos (Clash Detection)'));
  children.push(...nar(vars.s3_2_clash));
  children.push(...kv('¿Se requiere clash detection?', vars.has_clash));
  if (vars.has_clash === 'Sí') {
    children.push(...kv('Frecuencia de clash detection', vars.clash_frequency));
  }

  // 3.3
  children.push(h3('3.3 Plan de Ejecución BIM (BEP)'));
  children.push(...kv('Momento de entrega del BEP', vars.bep_timing));
  children.push(divider());

  // ── Section 4 — Estándares de información ────────────────────────────────────
  children.push(h2('4. Estándares de información'));

  // 4.1
  children.push(h3('4.1 Nomenclatura y clasificación'));
  children.push(...nar(vars.s4_1_nomenclatura));
  children.push(
    infoTable([
      ['Sistema de nomenclatura de archivos', vars.naming_system],
      ['Sistema de clasificación', vars.classification_system],
    ])
  );

  // 4.2
  children.push(h3('4.2 Formatos de intercambio'));
  children.push(...nar(vars.s4_2_formatos));
  children.push(...kv('Formatos requeridos', ''));
  children.push(...multilineBody(vars.exchange_formats_list));
  children.push(...kv('COBie para O&M', vars.requires_cobie));

  // 4.3
  children.push(h3('4.3 Requisitos de software'));
  children.push(...nar(vars.s4_3_software));
  children.push(...kv('Versión de software específica requerida', vars.requires_software));
  if (vars.requires_software === 'Sí') {
    children.push(...kv('Versiones requeridas', vars.software_versions));
  }
  children.push(divider());

  // ── Section 5 — Nivel de información necesario (LOIN) ────────────────────────
  children.push(h2('5. Nivel de información necesario (LOIN)'));
  children.push(body('Referencia normativa: ISO 19650-1 §11.2 y EN17412-1 — Nivel de información necesaria', { italic: true }));

  // 5.1
  children.push(h3('5.1 Nivel mínimo requerido'));
  children.push(...nar(vars.s5_1_nivel));
  children.push(...kv('Nivel mínimo de información necesario', vars.loin_level));

  // 5.2
  children.push(h3('5.2 Componentes de información requeridos'));
  children.push(...nar(vars.s5_2_componentes));
  children.push(...kv('Componentes requeridos', ''));
  children.push(...multilineBody(vars.loin_components_list));

  // 5.3
  if (vars.loin_by_discipline === 'Sí') {
    children.push(h3('5.3 LOIN diferenciado por disciplina'));
    children.push(...nar(vars.s5_3_disciplinas));
    children.push(...kv('Disciplinas con LOIN específico', ''));
    children.push(...multilineBody(vars.loin_disciplines_list));
  }
  children.push(divider());

  // ── Section 6 — CDE y gobernanza ─────────────────────────────────────────────
  children.push(h2('6. Entorno común de datos y gobernanza'));

  // 6.1
  children.push(h3('6.1 Plataforma CDE'));
  children.push(...nar(vars.s6_1_cde));
  children.push(
    infoTable([
      ['Adjudicador provee el CDE', vars.client_provides_cde],
      ['Plataforma CDE', vars.cde_platform],
      ['Estructura de carpetas ISO 19650', vars.requires_iso_folders],
    ])
  );

  // 6.2
  children.push(h3('6.2 Estados de flujo de información'));
  children.push(...nar(vars.s6_2_estados));
  children.push(...kv('Estados requeridos en CDE', ''));
  children.push(...multilineBody(vars.cde_states_list));

  // 6.3
  if (vars.has_restrictions === 'Sí') {
    children.push(h3('6.3 Restricciones de acceso a información'));
    children.push(...nar(vars.s6_3_restricciones));
    children.push(...kv('¿Existen restricciones de acceso?', vars.has_restrictions));
    children.push(...kv('Descripción de restricciones', vars.restrictions_description));
  } else {
    children.push(h3('6.3 Acceso a información'));
    children.push(...nar(vars.s6_3_restricciones));
    children.push(...kv('Restricciones de acceso', 'No aplica'));
  }
  children.push(divider());

  // ── Control de documento ───────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Control de documento', bold: true, size: 28, color: BRAND_COLOR })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 480, after: 200 },
    }),
    controlTable(vars),
  );

  const doc = new Document({
    numbering: { config: [] },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: { default: makeHeader(vars) },
      footers: { default: makeFooter(vars) },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
