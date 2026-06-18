/**
 * Builds the AIR Word document (.docx).
 * Estructura: Heading 2 por sección, Heading 3 por sub-sección.
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, ShadingType, TableLayoutType,
} from 'docx';
import type { AIREnrichedVars } from './airLLMEnricher';

const BRAND_COLOR = '1D4ED8';
const HEADER_FILL = 'EFF6FF';

function h2(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 480, after: 200 }, run: { color: BRAND_COLOR, bold: true } });
}
function h3(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 280, after: 120 }, run: { color: '374151' } });
}
function body(text: string, opts: { bold?: boolean; italic?: boolean } = {}): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, ...opts, size: 22 })], spacing: { before: 80, after: 80 } });
}
function nar(text: string): Paragraph[] {
  if (!text) return [];
  return [new Paragraph({ children: [new TextRun({ text, size: 22, color: '111827' })], spacing: { before: 80, after: 160 } })];
}
function kv(key: string, value: string): Paragraph[] {
  const empty = !value || value === 'No aplica';
  return [new Paragraph({
    children: [
      new TextRun({ text: `${key}: `, bold: true, size: 22, color: '374151' }),
      new TextRun({ text: value || 'No aplica', size: 22, italics: empty, color: empty ? '9CA3AF' : '111827' }),
    ],
    spacing: { before: 80, after: 60 },
  })];
}
function multilineBody(text: string): Paragraph[] {
  if (!text || text === 'No aplica') return [body('No aplica', { italic: true })];
  return text.split('\n').filter(Boolean).map((line) => body(line.trim()));
}
function divider(): Paragraph {
  return new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } }, spacing: { before: 240, after: 240 } });
}
function infoTable(rows: [string, string][]): Table {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, fill: HEADER_FILL }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })] }),
        new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: v || 'No aplica', size: 20 })] })] }),
      ],
    })),
  });
}
function coverTable(v: AIREnrichedVars): Table {
  return infoTable([
    ['Activo', v.asset_name],
    ['Tipo de activo', v.asset_type],
    ['Versión', `v${v.doc_version}`],
    ['Fecha', v.doc_date],
    ['Estado', v.doc_status],
    ['Facility Manager', v.asset_manager],
  ]);
}
function controlTable(v: AIREnrichedVars): Table {
  const headerRow = new TableRow({
    children: ['Versión', 'Fecha', 'Facility Manager', 'Estado', 'Descripción del cambio'].map((h) =>
      new TableCell({ shading: { type: ShadingType.CLEAR, fill: '1D4ED8' }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF' })] })] })),
  });
  const dataRow = new TableRow({
    children: [`v${v.doc_version}`, v.doc_date, v.asset_manager, v.doc_status, 'Versión inicial generada desde BIM Doc Platform'].map((val) =>
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: val, size: 20 })] })] })),
  });
  return new Table({ layout: TableLayoutType.FIXED, width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, dataRow] });
}
function makeHeader(v: AIREnrichedVars): Header {
  return new Header({ children: [new Paragraph({
    children: [
      new TextRun({ text: `AIR — ${v.asset_name}`, bold: true, size: 18, color: BRAND_COLOR }),
      new TextRun({ text: `\t\tISO 19650 | v${v.doc_version} | ${v.doc_date}`, size: 18, color: '6B7280' }),
    ],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    tabStops: [{ type: 'right', position: 9360 }],
  })] });
}
function makeFooter(v: AIREnrichedVars): Footer {
  return new Footer({ children: [new Paragraph({
    children: [new TextRun({ text: `${v.asset_name}  ·  AIR v${v.doc_version}  ·  ${v.doc_date}  ·  ISO 19650`, size: 16, color: '6B7280' })],
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    alignment: AlignmentType.CENTER,
  })] });
}

export async function buildAirDocx(vars: AIREnrichedVars): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Cover
  children.push(
    new Paragraph({ children: [new TextRun({ text: 'REQUISITOS DE', bold: true, size: 60, color: BRAND_COLOR })], alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'INFORMACIÓN DEL ACTIVO', bold: true, size: 56, color: BRAND_COLOR })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: '(AIR) — ISO 19650', italics: true, size: 28, color: '6B7280' })], alignment: AlignmentType.CENTER, spacing: { after: 960 } }),
    coverTable(vars),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
  );

  // 1
  children.push(
    h2('1. Objeto y alcance del AIR'),
    ...nar(vars.intro_context),
    ...kv('Tipo de activo', vars.asset_type),
    ...kv('Fase de ciclo de vida objetivo', vars.lifecycle_phase),
    ...kv('OIR de referencia', vars.oir_reference),
    ...kv('Facility Manager / responsable del activo', vars.asset_manager),
    divider(),
  );

  // 2
  children.push(h2('2. Requisitos del gestor del activo'));
  children.push(...nar(vars.s2_fm));
  children.push(...kv('Objetivos de gestión del activo', ''));
  children.push(...multilineBody(vars.mgmt_objectives_list));
  children.push(infoTable([
    ['Estándar de gestión de activos', vars.am_standard],
    ['Integración con CAFM/CMMS', vars.has_cafm],
    ['Sistema CAFM/CMMS', vars.cafm_system],
  ]));
  children.push(...kv('Parámetros CAFM/CMMS requeridos', ''));
  children.push(...multilineBody(vars.cafm_params));
  children.push(divider());

  // 3
  children.push(h2('3. Contenidos del AIM'));
  children.push(...nar(vars.s3_aim));
  children.push(...kv('Información a incluir en el AIM', ''));
  children.push(...multilineBody(vars.aim_contents_list));
  children.push(infoTable([
    ['Nomenclatura de espacios', vars.space_naming],
    ['Nomenclatura de sistemas / MEP', vars.system_naming],
    ['Plan de puesta en marcha', vars.has_commissioning],
    ['Costos de reemplazo', vars.has_replacement_cost],
  ]));
  children.push(divider());

  // 4 LOIN
  children.push(h2('4. Nivel de información necesario del AIM (LOIN)'));
  children.push(body('Referencia normativa: ISO 19650-1 §11.2 · EN 17412-1', { italic: true }));
  children.push(...nar(vars.s4_loin));
  children.push(...kv('¿LOIN definido para el AIM?', vars.has_loin));
  if (vars.has_loin === 'Sí') {
    children.push(...kv('Información geométrica', vars.loin_geometric));
    children.push(...kv('Información alfanumérica', ''));
    children.push(...multilineBody(vars.loin_alphanumeric_list));
    children.push(...kv('Documentación asociada', ''));
    children.push(...multilineBody(vars.loin_documentation_list));
  }
  children.push(divider());

  // 5
  children.push(h2('5. Formatos y traspaso PIM → AIM'));
  children.push(...nar(vars.s5_handover));
  children.push(...kv('Formatos de entrega del AIM', ''));
  children.push(...multilineBody(vars.aim_formats_list));
  children.push(infoTable([
    ['COBie requerido', vars.requires_cobie],
    ['Momento de traspaso PIM → AIM', vars.handover_timing],
    ['Sistema de clasificación', vars.classification_system],
  ]));
  children.push(...kv('Procedimiento de traspaso', ''));
  children.push(...multilineBody(vars.handover_procedure));
  children.push(divider());

  // 6
  children.push(h2('6. Gobernanza del activo'));
  children.push(...nar(vars.s6_governance));
  children.push(infoTable([
    ['Plataforma de gestión del AIM / CDE', vars.aim_platform],
    ['Frecuencia de actualización del AIM', vars.update_frequency],
    ['Política de retención', vars.retention_policy],
    ['Restricciones de seguridad', vars.has_security],
  ]));
  if (vars.observations && vars.observations !== 'No aplica') {
    children.push(divider());
    children.push(h3('Observaciones'));
    children.push(...multilineBody(vars.observations));
  }
  children.push(divider());

  // Control
  children.push(
    new Paragraph({ children: [new TextRun({ text: 'Control de documento', bold: true, size: 28, color: BRAND_COLOR })], heading: HeadingLevel.HEADING_2, spacing: { before: 480, after: 200 } }),
    controlTable(vars),
  );

  const doc = new Document({
    numbering: { config: [] },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: { default: makeHeader(vars) },
      footers: { default: makeFooter(vars) },
      children,
    }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
