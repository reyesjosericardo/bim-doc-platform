import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateOirDocuments, getGeneratedFilePath, generateEirDocuments, getEirGeneratedFilePath } from '../services/documentGenerator';

const router = Router();
const prisma = new PrismaClient();

const answerSchema = z.object({
  question_id: z.string(),
  answer_value: z.string(),
  answer_type: z.enum(['text', 'textarea', 'select', 'multi_select', 'boolean']),
});

const createOirSchema = z.object({
  project_id: z.string(),
  answers: z.array(answerSchema),
});

const updateAnswersSchema = z.object({
  answers: z.array(answerSchema),
});

// POST /api/documents/oir — create OIR and save answers
router.post('/oir', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = createOirSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }

  const { project_id, answers } = parsed.data;
  const userId = req.user!.id;

  try {
    const document = await prisma.bimDocument.create({
      data: {
        project_id,
        document_type: 'OIR',
        status: 'borrador',
        version: 1,
        created_by: userId,
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
      include: {
        questionnaire_answers: true,
      },
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error('Error creating OIR:', error);
    return res.status(500).json({ error: 'Failed to create OIR document' });
  }
});

// GET /api/documents/oir/:id — retrieve OIR with all answers
router.get('/oir/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
      include: {
        questionnaire_answers: {
          orderBy: { question_id: 'asc' },
        },
        project: {
          select: { id: true, name: true, organization_id: true },
        },
        creator: {
          select: { id: true, email: true, role: true },
        },
        approver: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'OIR document not found' });
    }

    return res.json(document);
  } catch (error) {
    console.error('Error fetching OIR:', error);
    return res.status(500).json({ error: 'Failed to fetch OIR document' });
  }
});

// PATCH /api/documents/oir/:id — upsert answers (autosave)
router.patch('/oir/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAnswersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }

  const { answers } = parsed.data;

  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
    });

    if (!document) {
      return res.status(404).json({ error: 'OIR document not found' });
    }

    // Upsert each answer (insert or update on conflict)
    await Promise.all(
      answers.map((a) =>
        prisma.questionnaireAnswer.upsert({
          where: {
            document_id_question_id: {
              document_id: id,
              question_id: a.question_id,
            },
          },
          update: {
            answer_value: a.answer_value,
            answer_type: a.answer_type,
          },
          create: {
            document_id: id,
            question_id: a.question_id,
            answer_value: a.answer_value,
            answer_type: a.answer_type,
          },
        })
      )
    );

    // Touch updated_at on the document
    await prisma.bimDocument.update({
      where: { id },
      data: { updated_at: new Date() },
    });

    const updated = await prisma.bimDocument.findUnique({
      where: { id },
      include: { questionnaire_answers: { orderBy: { question_id: 'asc' } } },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating OIR answers:', error);
    return res.status(500).json({ error: 'Failed to update OIR answers' });
  }
});

// PATCH /api/documents/oir/:id/status — change document status
router.patch('/oir/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const statusSchema = z.object({
    status: z.enum(['borrador', 'en_revision', 'aprobado']),
  });

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
    });

    if (!document) {
      return res.status(404).json({ error: 'OIR document not found' });
    }

    // Only adjudicador and adj_principal can approve
    if (parsed.data.status === 'aprobado') {
      if (!['adjudicador', 'adj_principal'].includes(req.user!.role)) {
        return res.status(403).json({ error: 'Only adjudicador or adj_principal can approve documents' });
      }
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
    console.error('Error updating OIR status:', error);
    return res.status(500).json({ error: 'Failed to update OIR status' });
  }
});

// GET /api/documents/projects/:projectId/oir — list OIRs for a project
router.get('/projects/:projectId/oir', requireAuth, async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;

  try {
    const documents = await prisma.bimDocument.findMany({
      where: { project_id: projectId, document_type: 'OIR' },
      include: {
        questionnaire_answers: { select: { question_id: true } },
        creator: { select: { email: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const withProgress = documents.map((doc) => ({
      ...doc,
      answered_count: doc.questionnaire_answers.length,
      total_questions: 27,
      progress_pct: Math.round((doc.questionnaire_answers.length / 27) * 100),
    }));

    return res.json(withProgress);
  } catch (error) {
    console.error('Error listing OIRs:', error);
    return res.status(500).json({ error: 'Failed to list OIR documents' });
  }
});

// POST /api/documents/oir/:id/generate — generate Word + PDF
// Body: { mode?: 'complete' | 'narrative_only' }
router.post('/oir/:id/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const mode: 'complete' | 'narrative_only' =
    req.body?.mode === 'narrative_only' ? 'narrative_only' : 'complete';

  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
    });

    if (!document) {
      return res.status(404).json({ error: 'OIR document not found' });
    }

    const files = await generateOirDocuments(id, mode);

    return res.json({
      message: 'Documents generated successfully',
      mode,
      docxUrl: files.docxUrl,
      pdfUrl:  files.pdfUrl,
    });
  } catch (error) {
    console.error('Error generating OIR documents:', error);
    return res.status(500).json({ error: 'Failed to generate documents', detail: String(error) });
  }
});

// GET /api/documents/oir/:id/download/:format — download docx, pdf, docx_exec, or pdf_exec
router.get('/oir/:id/download/:format', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id, format } = req.params;

  if (!['docx', 'pdf', 'docx_exec', 'pdf_exec'].includes(format)) {
    return res.status(400).json({ error: 'Format must be docx, pdf, docx_exec, or pdf_exec' });
  }

  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'OIR' },
    });

    if (!document) {
      return res.status(404).json({ error: 'OIR document not found' });
    }

    const filePath = getGeneratedFilePath(
      id,
      document.version,
      format as 'docx' | 'pdf' | 'docx_exec' | 'pdf_exec',
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not generated yet. Call POST /generate first.',
      });
    }

    const mimeTypes: Record<string, string> = {
      docx:      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf:       'application/pdf',
      docx_exec: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf_exec:  'application/pdf',
    };

    const ext      = format.startsWith('docx') ? 'docx' : 'pdf';
    const suffix   = format.endsWith('_exec') ? '_ejecutivo' : '';
    const filename = `OIR_v${document.version}${suffix}.${ext}`;

    res.setHeader('Content-Type', mimeTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({ error: 'Failed to download file' });
  }
});

// ─── EIR Routes ───────────────────────────────────────────────────────────────

const createEirSchema = z.object({
  project_id: z.string(),
  answers: z.array(answerSchema),
});

// POST /api/documents/eir
router.post('/eir', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = createEirSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }
  const { project_id, answers } = parsed.data;
  const userId = req.user!.id;
  try {
    const document = await prisma.bimDocument.create({
      data: {
        project_id,
        document_type: 'EIR',
        status: 'borrador',
        version: 1,
        created_by: userId,
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
    console.error('Error creating EIR:', error);
    return res.status(500).json({ error: 'Failed to create EIR document' });
  }
});

// GET /api/documents/eir/:id
router.get('/eir/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const document = await prisma.bimDocument.findUnique({
      where: { id, document_type: 'EIR' },
      include: {
        questionnaire_answers: { orderBy: { question_id: 'asc' } },
        project: { select: { id: true, name: true, organization_id: true } },
        creator: { select: { id: true, email: true, role: true } },
        approver: { select: { id: true, email: true, role: true } },
      },
    });
    if (!document) return res.status(404).json({ error: 'EIR document not found' });
    return res.json(document);
  } catch (error) {
    console.error('Error fetching EIR:', error);
    return res.status(500).json({ error: 'Failed to fetch EIR document' });
  }
});

// PATCH /api/documents/eir/:id
router.patch('/eir/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateAnswersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }
  const { answers } = parsed.data;
  try {
    const document = await prisma.bimDocument.findUnique({ where: { id, document_type: 'EIR' } });
    if (!document) return res.status(404).json({ error: 'EIR document not found' });
    await Promise.all(
      answers.map((a) =>
        prisma.questionnaireAnswer.upsert({
          where: { document_id_question_id: { document_id: id, question_id: a.question_id } },
          update: { answer_value: a.answer_value, answer_type: a.answer_type },
          create: { document_id: id, question_id: a.question_id, answer_value: a.answer_value, answer_type: a.answer_type },
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
    console.error('Error updating EIR answers:', error);
    return res.status(500).json({ error: 'Failed to update EIR answers' });
  }
});

// PATCH /api/documents/eir/:id/status
router.patch('/eir/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const statusSchema = z.object({ status: z.enum(['borrador', 'en_revision', 'aprobado']) });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status value' });
  try {
    const document = await prisma.bimDocument.findUnique({ where: { id, document_type: 'EIR' } });
    if (!document) return res.status(404).json({ error: 'EIR document not found' });
    if (parsed.data.status === 'aprobado') {
      if (!['adjudicador', 'adj_principal'].includes(req.user!.role)) {
        return res.status(403).json({ error: 'Only adjudicador or adj_principal can approve documents' });
      }
    }
    const updated = await prisma.bimDocument.update({
      where: { id },
      data: { status: parsed.data.status, approved_by: parsed.data.status === 'aprobado' ? req.user!.id : undefined },
    });
    return res.json(updated);
  } catch (error) {
    console.error('Error updating EIR status:', error);
    return res.status(500).json({ error: 'Failed to update EIR status' });
  }
});

// GET /api/documents/projects/:projectId/eir
router.get('/projects/:projectId/eir', requireAuth, async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const documents = await prisma.bimDocument.findMany({
      where: { project_id: projectId, document_type: 'EIR' },
      include: {
        questionnaire_answers: { select: { question_id: true } },
        creator: { select: { email: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    const TOTAL_EIR = 31;
    const withProgress = documents.map((doc) => ({
      ...doc,
      answered_count: doc.questionnaire_answers.length,
      total_questions: TOTAL_EIR,
      progress_pct: Math.round((doc.questionnaire_answers.length / TOTAL_EIR) * 100),
    }));
    return res.json(withProgress);
  } catch (error) {
    console.error('Error listing EIRs:', error);
    return res.status(500).json({ error: 'Failed to list EIR documents' });
  }
});

// POST /api/documents/eir/:id/generate
router.post('/eir/:id/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const document = await prisma.bimDocument.findUnique({ where: { id, document_type: 'EIR' } });
    if (!document) return res.status(404).json({ error: 'EIR document not found' });
    const files = await generateEirDocuments(id);
    return res.json({ message: 'EIR documents generated successfully', docxUrl: files.docxUrl, pdfUrl: files.pdfUrl });
  } catch (error) {
    console.error('Error generating EIR documents:', error);
    return res.status(500).json({ error: 'Failed to generate EIR documents', detail: String(error) });
  }
});

// GET /api/documents/eir/:id/download/:format
router.get('/eir/:id/download/:format', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id, format } = req.params;
  if (!['docx', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'Format must be docx or pdf' });
  }
  try {
    const document = await prisma.bimDocument.findUnique({ where: { id, document_type: 'EIR' } });
    if (!document) return res.status(404).json({ error: 'EIR document not found' });
    const filePath = getEirGeneratedFilePath(id, document.version, format as 'docx' | 'pdf');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not generated yet. Call POST /generate first.' });
    }
    const mimeTypes: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf:  'application/pdf',
    };
    const filename = `EIR_v${document.version}.${format}`;
    res.setHeader('Content-Type', mimeTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  } catch (error) {
    console.error('Error downloading EIR file:', error);
    return res.status(500).json({ error: 'Failed to download file' });
  }
});

export { router as documentRoutes };
