/**
 * Sprint 3.2 — Document generation service.
 * Orchestrates: DB read → variable mapping → LLM enrichment → Word build → PDF render → DB write.
 * Supports 'complete' (full document) and 'narrative_only' (executive version) modes.
 */

import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { mapAnswersToVars } from './oirMapper';
import { enrichOirWithLLM } from './oirLLMEnricher';
import { buildOirDocx } from './oirWordBuilder';
import { buildOirHtml } from './oirHtmlBuilder';
import { mapEirAnswersToVars } from './eirMapper';
import { enrichEirWithLLM } from './eirLLMEnricher';
import { buildEirDocx } from './eirWordBuilder';
import { buildEirHtml } from './eirHtmlBuilder';

const prisma = new PrismaClient();

const STORAGE_DIR = path.resolve(__dirname, '../../storage/generated');

export type GenerateMode = 'complete' | 'narrative_only';

export interface GeneratedFiles {
  docxUrl:  string;
  pdfUrl:   string;
  docxPath: string;
  pdfPath:  string;
}

export async function generateOirDocuments(
  documentId: string,
  mode: GenerateMode = 'complete',
): Promise<GeneratedFiles> {
  // 1. Load document + answers + project info
  const doc = await prisma.bimDocument.findUniqueOrThrow({
    where: { id: documentId },
    include: {
      questionnaire_answers: true,
      project: { select: { name: true } },
    },
  });

  // 2. Map answers to template variables
  const baseVars = mapAnswersToVars(doc.questionnaire_answers, {
    project_name: doc.project.name,
    version: doc.version,
    status: doc.status,
  });

  // 3. Use saved narratives if available, otherwise call LLM
  let vars: import('./oirLLMEnricher').OIREnrichedVars;
  if (doc.narratives && typeof doc.narratives === 'object') {
    const saved = doc.narratives as Record<string, string>;
    // Strip HTML tags to get plain text for Word/PDF builders
    const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    vars = {
      ...baseVars,
      intro_context:      stripHtml(saved['intro_context'] ?? ''),
      s2_1_perfil:        stripHtml(saved['s2_1_perfil'] ?? ''),
      s2_2_estandares:    stripHtml(saved['s2_2_estandares'] ?? ''),
      s2_3_responsable:   stripHtml(saved['s2_3_responsable'] ?? ''),
      s3_1_usos_bim:      stripHtml(saved['s3_1_usos_bim'] ?? ''),
      s3_2_objetivo:      stripHtml(saved['s3_2_objetivo'] ?? ''),
      s3_3_plan_activos:  stripHtml(saved['s3_3_plan_activos'] ?? ''),
      s3_4_regulatorio:   stripHtml(saved['s3_4_regulatorio'] ?? ''),
      s4_1_registro:      stripHtml(saved['s4_1_registro'] ?? ''),
      s4_2_om:            stripHtml(saved['s4_2_om'] ?? ''),
      s4_3_riesgos:       stripHtml(saved['s4_3_riesgos'] ?? ''),
      s4_4_impactos:      stripHtml(saved['s4_4_impactos'] ?? ''),
      s4_5_eol:           stripHtml(saved['s4_5_eol'] ?? ''),
      s5_1_formatos:      stripHtml(saved['s5_1_formatos'] ?? ''),
      s5_2_clasificacion: stripHtml(saved['s5_2_clasificacion'] ?? ''),
      s5_3_cde:           stripHtml(saved['s5_3_cde'] ?? ''),
      s5_4_nivel_info:    stripHtml(saved['s5_4_nivel_info'] ?? ''),
      s6_1_frecuencia:    stripHtml(saved['s6_1_frecuencia'] ?? ''),
      s6_2_seguridad:     stripHtml(saved['s6_2_seguridad'] ?? ''),
      s6_3_retencion:     stripHtml(saved['s6_3_retencion'] ?? ''),
      s7_observaciones:   stripHtml(saved['s7_observaciones'] ?? ''),
    };
  } else {
    vars = await enrichOirWithLLM(baseVars);
  }

  // 4. Ensure storage directory exists
  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const suffix   = mode === 'narrative_only' ? '_exec' : '';
  const baseName = `${documentId}_OIR_v${doc.version}${suffix}`;
  const docxPath = path.join(STORAGE_DIR, `${baseName}.docx`);
  const pdfPath  = path.join(STORAGE_DIR, `${baseName}.pdf`);

  // 5. Generate Word document
  const docxBuffer = await buildOirDocx(vars, mode);
  await fs.writeFile(docxPath, docxBuffer);

  // 6. Generate PDF via Puppeteer
  const html = buildOirHtml(vars, mode);
  await renderHtmlToPdf(html, pdfPath);

  // 7. Register files in DB
  const baseUrl     = process.env.BACKEND_URL || 'http://localhost:4000';
  const formatDocx  = mode === 'narrative_only' ? 'docx_exec' : 'docx';
  const formatPdf   = mode === 'narrative_only' ? 'pdf_exec'  : 'pdf';

  await prisma.$transaction([
    prisma.generatedFile.upsert({
      where:  { id: `${documentId}-${formatDocx}` },
      update: { file_url: `${baseUrl}/api/documents/oir/${documentId}/download/${formatDocx}`, generated_at: new Date() },
      create: {
        id: `${documentId}-${formatDocx}`,
        document_id: documentId,
        file_format: formatDocx,
        file_url: `${baseUrl}/api/documents/oir/${documentId}/download/${formatDocx}`,
      },
    }),
    prisma.generatedFile.upsert({
      where:  { id: `${documentId}-${formatPdf}` },
      update: { file_url: `${baseUrl}/api/documents/oir/${documentId}/download/${formatPdf}`, generated_at: new Date() },
      create: {
        id: `${documentId}-${formatPdf}`,
        document_id: documentId,
        file_format: formatPdf,
        file_url: `${baseUrl}/api/documents/oir/${documentId}/download/${formatPdf}`,
      },
    }),
  ]);

  return {
    docxUrl:  `${baseUrl}/api/documents/oir/${documentId}/download/${formatDocx}`,
    pdfUrl:   `${baseUrl}/api/documents/oir/${documentId}/download/${formatPdf}`,
    docxPath,
    pdfPath,
  };
}

export async function generateEirDocuments(
  documentId: string,
): Promise<GeneratedFiles> {
  const doc = await prisma.bimDocument.findUniqueOrThrow({
    where: { id: documentId },
    include: {
      questionnaire_answers: true,
      project: { select: { name: true } },
    },
  });

  const baseVars = mapEirAnswersToVars(doc.questionnaire_answers, {
    project_name: doc.project.name,
    version: doc.version,
    status: doc.status,
  });

  const vars = await enrichEirWithLLM(baseVars);

  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const baseName = `${documentId}_EIR_v${doc.version}`;
  const docxPath = path.join(STORAGE_DIR, `${baseName}.docx`);
  const pdfPath  = path.join(STORAGE_DIR, `${baseName}.pdf`);

  const docxBuffer = await buildEirDocx(vars);
  await fs.writeFile(docxPath, docxBuffer);

  const html = buildEirHtml(vars);
  await renderHtmlToPdf(html, pdfPath);

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';

  await prisma.$transaction([
    prisma.generatedFile.upsert({
      where:  { id: `${documentId}-eir-docx` },
      update: { file_url: `${baseUrl}/api/documents/eir/${documentId}/download/docx`, generated_at: new Date() },
      create: {
        id: `${documentId}-eir-docx`,
        document_id: documentId,
        file_format: 'docx',
        file_url: `${baseUrl}/api/documents/eir/${documentId}/download/docx`,
      },
    }),
    prisma.generatedFile.upsert({
      where:  { id: `${documentId}-eir-pdf` },
      update: { file_url: `${baseUrl}/api/documents/eir/${documentId}/download/pdf`, generated_at: new Date() },
      create: {
        id: `${documentId}-eir-pdf`,
        document_id: documentId,
        file_format: 'pdf',
        file_url: `${baseUrl}/api/documents/eir/${documentId}/download/pdf`,
      },
    }),
  ]);

  return {
    docxUrl:  `${baseUrl}/api/documents/eir/${documentId}/download/docx`,
    pdfUrl:   `${baseUrl}/api/documents/eir/${documentId}/download/pdf`,
    docxPath,
    pdfPath,
  };
}

export function getEirGeneratedFilePath(
  documentId: string,
  version: number,
  format: 'docx' | 'pdf',
): string {
  const ext = format;
  return path.join(STORAGE_DIR, `${documentId}_EIR_v${version}.${ext}`);
}

export function getGeneratedFilePath(
  documentId: string,
  version: number,
  format: 'docx' | 'pdf' | 'docx_exec' | 'pdf_exec',
): string {
  const suffix = format.endsWith('_exec') ? '_exec' : '';
  const ext    = format.replace('_exec', '');
  return path.join(STORAGE_DIR, `${documentId}_OIR_v${version}${suffix}.${ext}`);
}

async function renderHtmlToPdf(html: string, outputPath: string): Promise<void> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
      printBackground: true,
      displayHeaderFooter: false,
    });
  } finally {
    await browser.close();
  }
}
