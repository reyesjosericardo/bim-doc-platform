import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  generateOirDocuments,
  getGeneratedFilePath,
  generateEirDocuments,
  getEirGeneratedFilePath,
  generateBepDocuments,
  getBepGeneratedFilePath,
  generateAirDocuments,
  getAirGeneratedFilePath,
  generatePirDocuments,
  getPirGeneratedFilePath,
} from '../services/documentGenerator';

const router = Router();
const prisma = new PrismaClient();

// ─── Shared schemas ───────────────────────────────────────────────────────────

const answerSchema = z.object({
  question_id: z.string(),
  answer_value: z.string(),
  answer_type: z.enum(['text', 'textarea', 'select', 'multi_select', 'boolean']),
});

const createDocumentSchema = z.object({
  project_id: z.string(),
  answers: z.array(answerSchema),
});

const updateAnswersSchema = z.object({
  answers: z.array(answerSchema),
});

const statusSchema = z.object({
  status: z.enum(['borrador', 'en_revision', 'aprobado']),
});

const MIME_TYPES: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
};

// ─── Document type configuration ──────────────────────────────────────────────

type DocumentType = 'OIR' | 'EIR' | 'BEP' | 'AIR' | 'PIR';

interface DocTypeConfig {
  /** Prisma document_type value, e.g. 'OIR' */
  type: DocumentType;
  /** URL segment, e.g. 'oir' */
  slug: string;
  /** Total questions in the questionnaire (for progress %) */
  totalQuestions: number;
  /** Allowed values for the :format download param */
  downloadFormats: string[];
  /** Runs Word + PDF generation; returns the JSON payload for the response */
  generate: (id: string, body: unknown) => Promise<Record<string, unknown>>;
  /** Resolves the on-disk path of a generated file */
  getFilePath: (id: string, version: number, format: string) => string;
  /** Filename offered to the browser on download */
  downloadFilename: (version: number, format: string) => string;
}

const DOC_TYPES: DocTypeConfig[] = [
  {
    type: 'OIR',
    slug: 'oir',
    totalQuestions: 27,
    downloadFormats: ['docx', 'pdf', 'docx_exec', 'pdf_exec'],
    generate: async (id, body) => {
      const mode: 'complete' | 'narrative_only' =
        (body as { mode?: string } | undefined)?.mode === 'narrative_only' ? 'narrative_only' : 'complete';
      const files = await generateOirDocuments(id, mode);
      return { message: 'Documents generated successfully', mode, docxUrl: files.docxUrl, pdfUrl: files.pdfUrl };
    },
    getFilePath: (id, version, format) =>
      getGeneratedFilePath(id, version, format as 'docx' | 'pdf' | 'docx_exec' | 'pdf_exec'),
    downloadFilename: (version, format) => {
      const ext = format.startsWith('docx') ? 'docx' : 'pdf';
      const suffix = format.endsWith('_exec') ? '_ejecutivo' : '';
      return `OIR_v${version}${suffix}.${ext}`;
    },
  },
  {
    type: 'EIR',
    slug: 'eir',
    totalQuestions: 32,
    downloadFormats: ['docx', 'pdf'],
    generate: async (id) => {
      const files = await generateEirDocuments(id);
      return { message: 'EIR documents generated successfully', docxUrl: files.docxUrl, pdfUrl: files.pdfUrl };
    },
    getFilePath: (id, version, format) => getEirGeneratedFilePath(id, version, format as 'docx' | 'pdf'),
    downloadFilename: (version, format) => `EIR_v${version}.${format}`,
  },
  {
    type: 'BEP',
    slug: 'bep',
    totalQuestions: 36,
    downloadFormats: ['docx', 'pdf'],
    generate: async (id) => {
      const files = await generateBepDocuments(id);
      return { message: 'BEP documents generated successfully', docxUrl: files.docxUrl, pdfUrl: files.pdfUrl };
    },
    getFilePath: (id, version, format) => getBepGeneratedFilePath(id, version, format as 'docx' | 'pdf'),
    downloadFilename: (version, format) => `BEP_v${version}.${format}`,
  },
  {
    type: 'AIR',
    slug: 'air',
    totalQuestions: 29,
    downloadFormats: ['docx', 'pdf'],
    generate: async (id) => {
      const files = await generateAirDocuments(id);
      return { message: 'AIR documents generated successfully', docxUrl: files.docxUrl, pdfUrl: files.pdfUrl };
    },
    getFilePath: (id, version, format) => getAirGeneratedFilePath(id, version, format as 'docx' | 'pdf'),
    downloadFilename: (version, format) => `AIR_v${version}.${format}`,
  },
  {
    type: 'PIR',
    slug: 'pir',
    totalQuestions: 24,
    downloadFormats: ['docx', 'pdf'],
    generate: async (id) => {
      const files = await generatePirDocuments(id);
      return { message: 'PIR documents generated successfully', docxUrl: files.docxUrl, pdfUrl: files.pdfUrl };
    },
    getFilePath: (id, version, format) => getPirGeneratedFilePath(id, version, format as 'docx' | 'pdf'),
    downloadFilename: (version, format) => `PIR_v${version}.${format}`,
  },
];

// ─── Generic CRUD + generation routes per document type ───────────────────────

function registerDocumentRoutes(cfg: DocTypeConfig) {
  const { type, slug } = cfg;

  // POST /api/documents/:slug — create document with initial answers
  router.post(`/${slug}`, requireAuth, async (req: AuthRequest, res: Response) => {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    }
    const { project_id, answers } = parsed.data;
    try {
      const document = await prisma.bimDocument.create({
        data: {
          project_id,
          document_type: type,
          status: 'borrador',
          version: 1,
          created_by: req.user!.id,
          questionnaire_answers: {
            createMany: {
              data: answers.map((a) => ({
                question_id: a.question_id,
                answer_value: a.answer_value,
                answer_type: a.answer_type,
              })),
              skipDuplicates: true,
            },
          },
        },
        include: { questionnaire_answers: true },
      });
      return res.status(201).json(document);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      return res.status(500).json({ error: `Failed to create ${type} document` });
    }
  });

  // GET /api/documents/:slug/:id — retrieve document with all answers
  router.get(`/${slug}/:id`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      const document = await prisma.bimDocument.findUnique({
        where: { id, document_type: type },
        include: {
          questionnaire_answers: { orderBy: { question_id: 'asc' } },
          project: { select: { id: true, name: true, organization_id: true } },
          creator: { select: { id: true, email: true, role: true } },
          approver: { select: { id: true, email: true, role: true } },
        },
      });
      if (!document) return res.status(404).json({ error: `${type} document not found` });
      return res.json(document);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return res.status(500).json({ error: `Failed to fetch ${type} document` });
    }
  });

  // PATCH /api/documents/:slug/:id — upsert answers (autosave)
  router.patch(`/${slug}/:id`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const parsed = updateAnswersSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    }
    const { answers } = parsed.data;
    try {
      const document = await prisma.bimDocument.findUnique({ where: { id, document_type: type } });
      if (!document) return res.status(404).json({ error: `${type} document not found` });

      await Promise.all(
        answers.map((a) =>
          prisma.questionnaireAnswer.upsert({
            where: { document_id_question_id: { document_id: id, question_id: a.question_id } },
            update: { answer_value: a.answer_value, answer_type: a.answer_type },
            create: {
              document_id: id,
              question_id: a.question_id,
              answer_value: a.answer_value,
              answer_type: a.answer_type,
            },
          })
        )
      );

      await prisma.bimDocument.update({ where: { id }, data: { updated_at: new Date() } });

      const updated = await prisma.bimDocument.findUnique({
        where: { id },
        include: { questionnaire_answers: { orderBy: { question_id: 'asc' } } },
      });
      return res.json(updated);
    } catch (error) {
      console.error(`Error updating ${type} answers:`, error);
      return res.status(500).json({ error: `Failed to update ${type} answers` });
    }
  });

  // PATCH /api/documents/:slug/:id/status — change document status
  router.patch(`/${slug}/:id/status`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status value' });
    try {
      const document = await prisma.bimDocument.findUnique({ where: { id, document_type: type } });
      if (!document) return res.status(404).json({ error: `${type} document not found` });

      if (parsed.data.status === 'aprobado' && !['adjudicador', 'adj_principal'].includes(req.user!.role)) {
        return res.status(403).json({ error: 'Only adjudicador or adj_principal can approve documents' });
      }

      const updated = await prisma.bimDocument.update({
        where: { id },
        data: {
          status: parsed.data.status,
          approved_by: parsed.data.status === 'aprobado' ? req.user!.id : undefined,
        },
      });
      return res.json(updated);
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      return res.status(500).json({ error: `Failed to update ${type} status` });
    }
  });

  // GET /api/documents/projects/:projectId/:slug — list documents for a project
  router.get(`/projects/:projectId/${slug}`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    try {
      const documents = await prisma.bimDocument.findMany({
        where: { project_id: projectId, document_type: type },
        include: {
          questionnaire_answers: { select: { question_id: true } },
          creator: { select: { email: true, role: true } },
        },
        orderBy: { created_at: 'desc' },
      });
      const withProgress = documents.map((doc) => ({
        ...doc,
        answered_count: doc.questionnaire_answers.length,
        total_questions: cfg.totalQuestions,
        progress_pct: Math.round((doc.questionnaire_answers.length / cfg.totalQuestions) * 100),
      }));
      return res.json(withProgress);
    } catch (error) {
      console.error(`Error listing ${type}s:`, error);
      return res.status(500).json({ error: `Failed to list ${type} documents` });
    }
  });

  // POST /api/documents/:slug/:id/generate — generate Word + PDF
  router.post(`/${slug}/:id/generate`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      const document = await prisma.bimDocument.findUnique({ where: { id, document_type: type } });
      if (!document) return res.status(404).json({ error: `${type} document not found` });
      const payload = await cfg.generate(id, req.body);
      return res.json(payload);
    } catch (error) {
      console.error(`Error generating ${type} documents:`, error);
      return res.status(500).json({ error: `Failed to generate ${type} documents`, detail: String(error) });
    }
  });

  // GET /api/documents/:slug/:id/download/:format — download a generated file
  router.get(`/${slug}/:id/download/:format`, requireAuth, async (req: AuthRequest, res: Response) => {
    const { id, format } = req.params;
    if (!cfg.downloadFormats.includes(format)) {
      return res.status(400).json({ error: `Format must be one of: ${cfg.downloadFormats.join(', ')}` });
    }
    try {
      const document = await prisma.bimDocument.findUnique({ where: { id, document_type: type } });
      if (!document) return res.status(404).json({ error: `${type} document not found` });

      const filePath = cfg.getFilePath(id, document.version, format);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not generated yet. Call POST /generate first.' });
      }

      const ext = format.startsWith('docx') ? 'docx' : 'pdf';
      res.setHeader('Content-Type', MIME_TYPES[ext]);
      res.setHeader('Content-Disposition', `attachment; filename="${cfg.downloadFilename(document.version, format)}"`);
      fs.createReadStream(filePath).pipe(res);
      return;
    } catch (error) {
      console.error(`Error downloading ${type} file:`, error);
      return res.status(500).json({ error: 'Failed to download file' });
    }
  });
}

DOC_TYPES.forEach(registerDocumentRoutes);

// ─── OIR Narratives (OIR-only feature) ────────────────────────────────────────

const narrativesSchema = z.record(z.string());

// POST /api/documents/oir/:id/narratives/generate — call LLM and save narratives
router.post('/oir/:id/narratives/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
      include: {
        questionnaire_answers: true,
        project: { select: { name: true } },
      },
    });
    if (!document) return res.status(404).json({ error: 'OIR document not found' });

    const { mapAnswersToVars } = await import('../services/oirMapper');
    const { enrichOirWithLLM } = await import('../services/oirLLMEnricher');

    const baseVars = mapAnswersToVars(document.questionnaire_answers, {
      project_name: document.project.name,
      version: document.version,
      status: document.status,
    });

    const enriched = await enrichOirWithLLM(baseVars);

    // Extract only narrative keys
    const narrativeKeys = [
      'intro_context',
      's2_1_perfil', 's2_2_estandares', 's2_3_responsable',
      's3_1_usos_bim', 's3_2_objetivo', 's3_3_plan_activos', 's3_4_regulatorio',
      's4_1_registro', 's4_2_om', 's4_3_riesgos', 's4_4_impactos', 's4_5_eol',
      's5_1_formatos', 's5_2_clasificacion', 's5_3_cde', 's5_4_nivel_info',
      's6_1_frecuencia', 's6_2_seguridad', 's6_3_retencion',
      's7_observaciones',
    ] as const;

    // Wrap each narrative as HTML paragraph for the rich text editor
    const narrativesHtml: Record<string, string> = {};
    for (const key of narrativeKeys) {
      const val = enriched[key] ?? '';
      narrativesHtml[key] = val ? `<p>${val}</p>` : '<p></p>';
    }

    await prisma.bimDocument.update({
      where: { id },
      data: { narratives: narrativesHtml },
    });

    return res.json({ narratives: narrativesHtml });
  } catch (error) {
    console.error('Error generating narratives:', error);
    return res.status(500).json({ error: 'Failed to generate narratives', detail: String(error) });
  }
});

// GET /api/documents/oir/:id/narratives — return saved narratives
router.get('/oir/:id/narratives', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
      select: { narratives: true },
    });
    if (!document) return res.status(404).json({ error: 'OIR document not found' });
    return res.json({ narratives: document.narratives ?? null });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch narratives' });
  }
});

// PATCH /api/documents/oir/:id/narratives — save edited narratives
router.patch('/oir/:id/narratives', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = narrativesSchema.safeParse(req.body?.narratives);
  if (!parsed.success) {
    return res.status(400).json({ error: 'narratives must be an object of strings' });
  }
  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
      select: { id: true },
    });
    if (!document) return res.status(404).json({ error: 'OIR document not found' });
    await prisma.bimDocument.update({
      where: { id },
      data: { narratives: parsed.data },
    });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save narratives' });
  }
});

export { router as documentRoutes };
