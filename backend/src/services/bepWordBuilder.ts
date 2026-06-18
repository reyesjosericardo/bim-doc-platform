/**
 * Sprint 5 — Builds the BEP Word document (.docx).
 * Structure: Heading 2 for sections, Heading 3 for sub-sections.
 * Each sub-section: narrative paragraph → structured data.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, ShadingType, TableLayoutType,
} from 'docx';
import type { BEPEnrichedVars } from './bepLLMEnricher';

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

function coverTable(vars: BEPEnrichedVars): Table {
  const rows: [string, string][] = [
    ['Proyecto', vars.project_name],
    ['Adjudicatario principal', vars.contractor],
    ['Fase del BEP', vars.bep_phase],
    ['Versión', `v${vars.doc_version}`],
    ['Fecha', vars.doc_date],
    ['Estado', vars.doc_status],
    ['BIM Manager', vars.bim_manager],
  ];
  return infoTable(rows);
}

// ─── Control de documento table ───────────────────────────────────────────────

function controlTable(vars: BEPEnrichedVars): Table {
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

function makeHeader(vars: BEPEnrichedVars): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `BEP — ${vars.project_name}`, bold: true, size: 18, color: BRAND_COLOR }),
          new TextRun({ text: `\t\tISO 19650-2 | v${vars.doc_version} | ${vars.doc_date}`, size: 18, color: '6B7280' }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
        tabStops: [{ type: 'right', position: 9360 }],
      }),
    ],
  });
}

function makeFooter(vars: BEPEnrichedVars): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${vars.project_name}  ·  BEP v${vars.doc_version}  ·  ${vars.doc_date}  ·  ISO 19650-2`, size: 16, color: '6B7280' }),
        ],
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildBepDocx(vars: BEPEnrichedVars): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // ── Cover page ──────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'PLAN DE', bold: true, size: 64, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1440, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'EJECUCIÓN BIM', bold: true, size: 64, color: BRAND_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '(BEP) — ISO 19650-2', italics: true, size: 28, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 960 },
    }),
    coverTable(vars),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
  );

  // ── Section 1 — Objeto y alcance del BEP ────────────────────────────────────
  children.push(
    h2('1. Objeto y alcance del BEP'),
    ...nar(vars.intro_context),
    ...kv('Adjudicatario principal', vars.contractor),
    ...kv('Fase del BEP', vars.bep_phase),
    ...kv('EIR / documento de referencia', vars.eir_reference),
    ...kv('Objetivos BIM del proyecto', ''),
    ...multilineBody(vars.bim_objectives),
    divider(),
  );

  // ── Section 2 — Gestión del proyecto BIM ────────────────────────────────────
  children.push(
    h2('2. Gestión del proyecto BIM'),
    ...nar(vars.s2_gestion),
    infoTable([
      ['BIM Manager', vars.bim_manager],
      ['BIM Coordinator', vars.bim_coordinator],
      ['Matriz de responsabilidades definida', vars.has_resp_matrix],
    ]),
  );
  children.push(...kv('Roles ISO 19650 en el equipo', ''));
  children.push(...multilineBody(vars.iso_roles_list));
  children.push(...kv('Disciplinas / equipos de tareas', ''));
  children.push(...multilineBody(vars.disciplines_list));
  children.push(...kv('Cuadro de riesgos BIM', ''));
  children.push(...multilineBody(vars.risks_text));
  children.push(divider());

  // ── Section 3 — Planificación y documentación ───────────────────────────────
  children.push(h2('3. Planificación y documentación'));

  // 3.1
  children.push(h3('3.1 Estrategia de federación del modelo'));
  children.push(...nar(vars.s3_1_federacion));
  children.push(...multilineBody(vars.federation_strategy));
  children.push(...kv('Estructura del modelo federado', ''));
  children.push(...multilineBody(vars.federated_structure_list));

  // 3.2
  children.push(h3('3.2 Hitos, entregables y planes de entrega'));
  children.push(...nar(vars.s3_2_planificacion));
  children.push(...kv('Hitos de entrega de información', ''));
  children.push(...multilineBody(vars.milestones_list));
  children.push(...kv('Entregables comprometidos', ''));
  children.push(...multilineBody(vars.deliverables_list));
  children.push(...kv('Elabora MIDP (Master Information Delivery Plan)', vars.has_midp));
  children.push(...kv('Elabora TIDP por equipo de tareas', vars.has_tidp));
  children.push(divider());

  // ── Section 4 — Estándares y procedimientos ─────────────────────────────────
  children.push(h2('4. Estándares y procedimientos'));

  // 4.1
  children.push(h3('4.1 Nomenclatura, clasificación y formatos'));
  children.push(...nar(vars.s4_1_estandares));
  children.push(
    infoTable([
      ['Sistema de nomenclatura', vars.naming_system],
      ['Sistema de clasificación', vars.classification_system],
      ['COBie para O&M', vars.requires_cobie],
    ])
  );
  children.push(...kv('Formatos de intercambio', ''));
  children.push(...multilineBody(vars.exchange_formats_list));

  // 4.2
  children.push(h3('4.2 Nivel de información necesario (LOIN)'));
  children.push(body('Referencia normativa: ISO 19650-1 §11.2 y EN17412-1', { italic: true }));
  children.push(...nar(vars.s4_2_loin));
  children.push(...kv('Información geométrica', vars.loin_geometric));
  children.push(...kv('Información alfanumérica', ''));
  children.push(...multilineBody(vars.loin_alphanumeric_list));
  children.push(...kv('Documentación asociada', ''));
  children.push(...multilineBody(vars.loin_documentation_list));

  // 4.3
  children.push(h3('4.3 Detección de conflictos (Clash Detection)'));
  children.push(...nar(vars.s4_3_clash));
  children.push(...kv('¿Se ejecuta clash detection?', vars.has_clash));
  if (vars.has_clash === 'Sí') {
    children.push(...kv('Frecuencia / hitos de clash detection', vars.clash_frequency));
  }
  children.push(divider());

  // ── Section 5 — Entorno común de datos (CDE) ────────────────────────────────
  children.push(h2('5. Entorno común de datos (CDE)'));
  children.push(...nar(vars.s5_cde));
  children.push(
    infoTable([
      ['Plataforma CDE', vars.cde_platform],
      ['Estructura de carpetas ISO 19650', vars.requires_iso_folders],
    ])
  );
  children.push(...kv('Estados del CDE', ''));
  children.push(...multilineBody(vars.cde_states_list));
  children.push(...kv('Procedimiento de aprobación / transición de estados', ''));
  children.push(...multilineBody(vars.approval_procedure));
  children.push(...kv('Política de seguridad y permisos de acceso', ''));
  children.push(...multilineBody(vars.security_policy));
  children.push(divider());

  // ── Section 6 — Software y hardware ──────────────────────────────────────────
  children.push(h2('6. Software y hardware'));
  children.push(...nar(vars.s6_software));
  children.push(...kv('Software de autoría BIM', ''));
  children.push(...multilineBody(vars.authoring_software_list));
  children.push(...kv('Software de coordinación / federación', vars.coordination_software));
  children.push(...kv('Versiones de software comprometidas', ''));
  children.push(...multilineBody(vars.software_versions));
  children.push(...kv('Recursos de hardware / infraestructura', ''));
  children.push(...multilineBody(vars.hardware_resources));

  // Observaciones (optional)
  if (vars.observations && vars.observations !== 'No aplica') {
    children.push(divider());
    children.push(h3('Observaciones y anexos'));
    children.push(...multilineBody(vars.observations));
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
