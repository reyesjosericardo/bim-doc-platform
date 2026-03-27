'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import type { OIRWithProgress, Project } from '@/types/oir';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props { session: Session }

export function DashboardClient({ session }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [oirsByProject, setOirsByProject] = useState<Record<string, OIRWithProgress[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data: Project[] = await res.json();
          setProjects(data);

          const oirMap: Record<string, OIRWithProgress[]> = {};
          await Promise.all(
            data.map(async (p) => {
              const r = await fetch(`/api/projects/${p.id}/oir`);
              if (r.ok) oirMap[p.id] = await r.json();
            })
          );
          setOirsByProject(oirMap);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const roleLabel: Record<string, string> = {
    adjudicador: 'Adjudicador',
    adj_principal: 'Adj. Principal',
    adj: 'Adjudicatario',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">BIM Doc Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
              <p className="text-xs text-gray-500">
                {roleLabel[session.user.role] ?? session.user.role} · {session.user.organizationName}
              </p>
            </div>
            <button onClick={() => signOut()} className="btn-secondary text-sm py-1.5">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Sprint 1 — Módulo OIR</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Cargando proyectos...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const oirs = oirsByProject[project.id] ?? [];
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  oirs={oirs}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, oirs }: { project: Project; oirs: OIRWithProgress[] }) {
  const hasOIR = oirs.length > 0;
  const mainOIR = oirs[0];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Proyecto · {new Date(project.created_at).toLocaleDateString('es-ES')}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {project.status === 'active' ? 'Activo' : project.status}
        </span>
      </div>

      {/* OIR section */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">OIR — Requisitos de Información Organizacional</h3>
          {!hasOIR && (
            <Link
              href={`/documents/oir/new?projectId=${project.id}`}
              className="btn-primary text-xs py-1.5"
            >
              Iniciar OIR
            </Link>
          )}
        </div>

        {hasOIR ? (
          <div className="space-y-3">
            {oirs.map((oir) => (
              <OIRRow key={oir.id} oir={oir} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No hay OIR iniciado para este proyecto.</p>
        )}
      </div>
    </div>
  );
}

function OIRRow({ oir }: { oir: OIRWithProgress }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      {/* Progress ring */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14" fill="none"
            stroke="#2563eb" strokeWidth="3"
            strokeDasharray={`${(oir.progress_pct / 100) * 87.96} 87.96`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-700">
          {oir.progress_pct}%
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">OIR v{oir.version}</span>
          <StatusBadge status={oir.status} />
        </div>
        <p className="text-xs text-gray-500">
          {oir.answered_count}/{oir.total_questions} preguntas respondidas ·
          Actualizado {new Date(oir.updated_at).toLocaleDateString('es-ES')}
        </p>
      </div>

      <Link
        href={`/documents/oir/${oir.id}`}
        className="btn-secondary text-xs py-1.5 flex-shrink-0"
      >
        {oir.progress_pct < 100 ? 'Continuar' : 'Ver / Editar'}
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 mb-4">
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin proyectos aún</h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        Los proyectos asignados a tu organización aparecerán aquí.
        Contacta a tu administrador para crear el primer proyecto.
      </p>
    </div>
  );
}
