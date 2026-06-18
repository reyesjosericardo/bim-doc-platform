/**
 * Builds the PIR Word document (.docx).
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, Footer,
  Header, ShadingType, TableLayoutType,
} from 'docx';
import type { PIREnrichedVars } from './pirLLMEnricher';

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
function coverTable(v: PIREnrichedVars): Table {
  return infoTable([
    ['Proyecto', v.project_name],
    ['Sector', v.sector],
    ['Versión', `v${v.doc_version}`],
    ['Fecha', v.doc_date],
    ['Estado', v.doc_status],
    ['Responsable del adjudicador', v.client_lead],
  ]);
}
function controlTable(v: PIREnrichedVars): Table {
  const headerRow = new TableRow({
    children: ['Versión', 'Fecha', 'Responsable', 'Estado', 'Descripción del cambio'].map((h) =>
      new TableCell({ shading: { type: ShadingType.CLEAR, fill: '1D4ED8' }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF' })] })] })),
  });
  const dataRow = new TableRow({
    children: [`v${v.doc_version}`, v.doc_date, v.client_lead, v.doc_status, 'Versión inicial generada desde BIM Doc Platform'].map((val) =>
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: val, size: 20 })] })] })),
  });
  return new Table({ layout: TableLayoutType.FIXED, width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, dataRow] });
}
function makeHeader(v: PIREnrichedVars): Header {
  return new Header({ children: [new Paragraph({
    children: [
      new TextRun({ text: `PIR — ${v.project_name}`, bold: true, size: 18, color: BRAND_COLOR }),
      new TextRun({ text: `\t\tISO 19650 | v${v.doc_version} | ${v.doc_date}`, size: 18, color: '6B7280' }),
    ],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    tabStops: [{ type: 'right', position: 9360 }],
  })] });
}
function makeFooter(v: PIREnrichedVars): Footer {
  return new Footer({ children: [new Paragraph({
    children: [new TextRun({ text: `${v.project_name}  ·  PIR v${v.doc_version}  ·  ${v.doc_date}  ·  ISO 19650`, size: 16, color: '6B7280' })],
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    alignment: AlignmentType.CENTER,
  })] });
}

export async function buildPirDocx(vars: PIREnrichedVars): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({ children: [new TextRun({ text: 'REQUISITOS DE', bold: true, size: 60, color: BRAND_COLOR })], alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 120 } }),
    new Paragraph({ children: [new TextRun({ text: 'INFORMACIÓN DEL PROYECTO', bold: true, size: 52, color: BRAND_COLOR })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
    new Paragraph({ children: [new TextRun({ text: '(PIR) — ISO 19650', italics: true, size: 28, color: '6B7280' })], alignment: AlignmentType.CENTER, spacing: { after: 960 } }),
    coverTable(vars),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
  );

  // 1
  children.push(
    h2('1. Objeto y alcance del PIR'),
    ...nar(vars.intro_context),
    ...kv('Sector', vars.sector),
    ...kv('OIR de referencia', vars.oir_reference),
    ...kv('Responsable del adjudicador', vars.client_lead),
    ...kv('Alcance de la inversión', ''),
    ...multilineBody(vars.investment_scope),
    divider(),
  );

  // 2
  children.push(h2('2. Objetivos estratégicos de la inversión'));
  children.push(...nar(vars.s2_objectives));
  children.push(...kv('Objetivos estratégicos', ''));
  children.push(...multilineBody(vars.strategic_objectives_list));
  children.push(infoTable([
    ['Presupuesto objetivo', vars.budget_target],
    ['Plazo objetivo', vars.schedule_target],
    ['Certificación ambiental', vars.has_certification === 'Sí' ? vars.certification : vars.has_certification],
  ]));
  children.push(...kv('Objetivos de sostenibilidad / energía', ''));
  children.push(...multilineBody(vars.sustainability_goals));
  children.push(divider());

  // 3
  children.push(h2('3. Hitos y puntos clave de decisión'));
  children.push(...nar(vars.s3_decisions));
  children.push(...kv('Hitos de decisión clave', ''));
  children.push(...multilineBody(vars.decision_milestones_list));
  children.push(...kv('¿Modelos para la toma de decisiones?', vars.requires_models));
  children.push(...kv('Información para la toma de decisiones', ''));
  children.push(...multilineBody(vars.decision_info_list));
  children.push(...kv('Preguntas clave a responder por hito', ''));
  children.push(...multilineBody(vars.key_questions));
  children.push(divider());

  // 4 LOIN
  children.push(h2('4. Nivel de información necesario por decisión (LOIN)'));
  children.push(body('Referencia normativa: ISO 19650-1 §11.2 · EN 17412-1', { italic: true }));
  children.push(...nar(vars.s4_loin));
  children.push(...kv('¿LOIN definido por punto de decisión?', vars.has_loin));
  if (vars.has_loin === 'Sí') {
    children.push(...kv('Información geométrica', vars.loin_geometric));
    children.push(...kv('Información alfanumérica', ''));
    children.push(...multilineBody(vars.loin_alphanumeric_list));
    children.push(...kv('Documentación asociada', ''));
    children.push(...multilineBody(vars.loin_documentation_list));
  }
  children.push(divider());

  // 5
  children.push(h2('5. Requisitos de gestión y entrega'));
  children.push(...nar(vars.s5_delivery));
  children.push(...kv('Usos BIM prioritarios', ''));
  children.push(...multilineBody(vars.bim_uses_list));
  children.push(...kv('Formatos de intercambio', ''));
  children.push(...multilineBody(vars.exchange_formats_list));
  children.push(...kv('Plan de transición a operación (AIR/AIM)', vars.has_transition));
  children.push(...kv('Restricciones / condicionantes', ''));
  children.push(...multilineBody(vars.constraints));
  if (vars.observations && vars.observations !== 'No aplica') {
    children.push(divider());
    children.push(h3('Observaciones'));
    children.push(...multilineBody(vars.observations));
  }
  children.push(divider());

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
