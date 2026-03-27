/**
 * Sprint 2 — Document generation service.
 * Orchestrates: DB read → variable mapping → Word build → PDF render → DB write.
 */

import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { mapAnswersToVars } from './oirMapper';
import { enrichOirWithLLM } from './oirLLMEnricher';
import { buildOirDocx } from './oirWordBuilder';
import { buildOirHtml } from './oirHtmlBuilder';

const prisma = new PrismaClient();

const STORAGE_DIR = path.resolve(__dirname, '../../storage/generated');

export interface GeneratedFiles {
  docxUrl: string;
  pdfUrl:  string;
  docxPath: string;
  pdfPath:  string;
}

export async function generateOirDocuments(documentId: string): Promise<GeneratedFiles> {
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

  // 2b. Enrich with LLM-generated professional narratives (Sprint 3)
  const vars = await enrichOirWithLLM(baseVars);

  // 3. Ensure storage directory exists
  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const baseName = `${documentId}_OIR_v${doc.version}`;
  const docxPath = path.join(STORAGE_DIR, `${baseName}.docx`);
  const pdfPath  = path.join(STORAGE_DIR, `${baseName}.pdf`);

  // 4. Generate Word document
  const docxBuffer = await buildOirDocx(vars);
  await fs.writeFile(docxPath, docxBuffer);

  // 5. Generate PDF via Puppeteer
  const html = buildOirHtml(vars);
  await renderHtmlToPdf(html, pdfPath);

  // 6. Register files in DB (upsert by format)
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';

  await prisma.$transaction([
    prisma.generatedFile.upsert({
      where: {
        // Use a synthetic unique check via raw upsert on document_id+file_format
        id: `${documentId}-docx`,
      },
      update: { file_url: `${baseUrl}/api/documents/oir/${documentId}/download/docx`, generated_at: new Date() },
      create: {
        id: `${documentId}-docx`,
        document_id: documentId,
        file_format: 'docx',
        file_url: `${baseUrl}/api/documents/oir/${documentId}/download/docx`,
      },
    }),
    prisma.generatedFile.upsert({
      where: { id: `${documentId}-pdf` },
      update: { file_url: `${baseUrl}/api/documents/oir/${documentId}/download/pdf`, generated_at: new Date() },
      create: {
        id: `${documentId}-pdf`,
        document_id: documentId,
        file_format: 'pdf',
        file_url: `${baseUrl}/api/documents/oir/${documentId}/download/pdf`,
      },
    }),
  ]);

  return {
    docxUrl:  `${baseUrl}/api/documents/oir/${documentId}/download/docx`,
    pdfUrl:   `${baseUrl}/api/documents/oir/${documentId}/download/pdf`,
    docxPath,
    pdfPath,
  };
}

export function getGeneratedFilePath(documentId: string, version: number, format: 'docx' | 'pdf'): string {
  return path.join(STORAGE_DIR, `${documentId}_OIR_v${version}.${format}`);
}

async function renderHtmlToPdf(html: string, outputPath: string): Promise<void> {
  // Dynamic import to avoid top-level puppeteer load on every request
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
