import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/projects — list projects for user's organization
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { organization_id: req.user!.organizationId },
      orderBy: { created_at: 'desc' },
    });
    return res.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    return res.status(500).json({ error: 'Failed to list projects' });
  }
});

// POST /api/projects — create a project
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Name is required' });

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        organization_id: req.user!.organizationId,
        status: 'active',
      },
    });
    return res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

export { router as projectRoutes };
