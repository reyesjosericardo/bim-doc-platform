'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import type { OIRWithProgress, EIRWithProgress, BEPWithProgress, Project, DocumentStatus } from '@/types/oir';

interface Props { session: Session }

// ── Incoestructura isotype — isometric cube ──
function CubeMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden role="img">
      <path d="M 100 30 L 160 65 L 100 100 L 40 65 Z" fill="#EEE9DB" />
      <path d="M 40 65 L 100 100 L 100 170 L 40 135 Z" fill="#8FA88E" />
      <path d="M 100 100 L 160 65 L 160 135 L 100 170 Z" fill="#6B8068" />
    </svg>
  );
}

// ── Per-document identity. Natural-materials triad on-brand with forest + cream:
//    sage (OIR) · wheat (EIR) · clay (BEP). Accent encodes which ISO 19650 document. ──
type DocKind = 'OIR' | 'EIR' | 'BEP';
const DOC_META: Record<DocKind, { accent: string; full: string; slug: string }> = {
  OIR: { accent: '#8FA88E', full: 'Información organizacional', slug: 'oir' },
  EIR: { accent: '#C9A86A', full: 'Intercambio de información', slug: 'eir' },
  BEP: { accent: '#B5805E', full: 'Plan de ejecución BIM',      slug: 'bep' },
};

const STATUS_META: Record<DocumentStatus, { label: string; color: string }> = {
  borrador:    { label: 'Borrador',    color: '#8A968A' },
  en_revision: { label: 'En revisión', color: '#C9A86A' },
  aprobado:    { label: 'Aprobado',    color: '#9CBE93' },
};

interface AnyDoc { id: string; version: number; status: DocumentStatus; progress_pct: number; answered_count: number; total_questions: number; updated_at: string }

export function DashboardClient({ session }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [oirsByProject, setOirsByProject] = useState<Record<string, OIRWithProgress[]>>({});
  const [eirsByProject, setEirsByProject] = useState<Record<string, EIRWithProgress[]>>({});
  const [bepsByProject, setBepsByProject] = useState<Record<string, BEPWithProgress[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data: Project[] = await res.json();
          setProjects(data);

          const oirMap: Record<string, OIRWithProgress[]> = {};
          const eirMap: Record<string, EIRWithProgress[]> = {};
          const bepMap: Record<string, BEPWithProgress[]> = {};
          await Promise.all(
            data.map(async (p) => {
              const [oirRes, eirRes, bepRes] = await Promise.all([
                fetch(`/api/projects/${p.id}/oir`),
                fetch(`/api/projects/${p.id}/eir`),
                fetch(`/api/projects/${p.id}/bep`),
              ]);
              if (oirRes.ok) oirMap[p.id] = await oirRes.json();
              if (eirRes.ok) eirMap[p.id] = await eirRes.json();
              if (bepRes.ok) bepMap[p.id] = await bepRes.json();
            })
          );
          setOirsByProject(oirMap);
          setEirsByProject(eirMap);
          setBepsByProject(bepMap);
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
    <div className="bp-canvas min-h-screen relative">
      <div className="brand-grid fixed inset-0 pointer-events-none" />

      {/* ── Control bar ── */}
      <nav className="sticky top-0 z-50 border-b border-[#EEE9DB]/[0.07] bg-[#141B16]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CubeMark className="w-8 h-8 flex-shrink-0" />
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[15px] tracking-[0.13em] text-[#EEE9DB]">INCOESTRUCTURA</span>
              <span className="hidden md:block h-4 w-px bg-[#EEE9DB]/15" />
              <span className="hidden md:inline font-code text-[10px] tracking-[0.22em] text-[#8FA88E]/70 uppercase">BIM·Doc</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bp-chip" style={{ borderColor: 'rgba(143,168,142,0.28)', color: 'rgba(143,168,142,0.9)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA88E] animate-pulse" />
              ISO 19650
            </div>
            <div className="text-right hidden sm:block leading-tight">
              <p className="font-code text-xs text-[#EEE9DB]/80">{session.user.email}</p>
              <p className="font-code text-[10px] text-[#8FA88E]/55 tracking-wider uppercase">
                {roleLabel[session.user.role] ?? session.user.role}
                {session.user.organizationName ? ` · ${session.user.organizationName}` : ''}
              </p>
            </div>
            <button onClick={() => signOut()} className="bp-btn-ghost">Cerrar sesión</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* ── Masthead ── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#8FA88E]/50" />
            <span className="bp-eyebrow">Panel de control documental</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display text-[clamp(2.2rem,5vw,3.25rem)] font-light leading-none text-[#EEE9DB]">
              Proyectos
            </h1>
            <p className="font-code text-xs text-[#EEE9DB]/45 tracking-wide pb-1">
              {loading ? '— cargando —' : `${projects.length} ${projects.length === 1 ? 'proyecto' : 'proyectos'} · flujo OIR → EIR → BEP`}
            </p>
          </div>
          <div className="bp-rule mt-5" />
        </header>

        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {projects.map((project, i) => (
              <ProjectDossier
                key={project.id}
                index={i}
                project={project}
                oirs={oirsByProject[project.id] ?? []}
                eirs={eirsByProject[project.id] ?? []}
                beps={bepsByProject[project.id] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDossier({ index, project, oirs, eirs, beps }: {
  index: number; project: Project; oirs: OIRWithProgress[]; eirs: EIRWithProgress[]; beps: BEPWithProgress[];
}) {
  const code = `P-${String(index + 1).padStart(2, '0')}`;
  const isActive = project.status === 'active';

  return (
    <article className="bp-panel p-6 fade-up" style={{ animationDelay: `${index * 70}ms` }}>
      {/* dossier header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-code text-xs text-[#8FA88E]/60 tracking-widest pt-1">{code}</span>
          <div className="min-w-0">
            <h2 className="font-display text-[1.55rem] leading-tight text-[#EEE9DB] truncate">{project.name}</h2>
            <p className="font-code text-[11px] text-[#EEE9DB]/40 tracking-wide mt-1">
              Iniciado {new Date(project.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className="bp-chip" style={{
          borderColor: isActive ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.12)',
          color: isActive ? '#34D399' : '#94A3B8',
          background: isActive ? 'rgba(52,211,153,0.06)' : 'transparent',
        }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#34D399' : '#64748B' }} />
          {isActive ? 'Activo' : project.status}
        </span>
      </div>

      {/* ── Document pipeline (signature) ── */}
      <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
        <DocNode kind="OIR" projectId={project.id} docs={oirs} />
        <Connector />
        <DocNode kind="EIR" projectId={project.id} docs={eirs} />
        <Connector />
        <DocNode kind="BEP" projectId={project.id} docs={beps} />
      </div>
    </article>
  );
}

function Connector() {
  return (
    <div className="hidden md:flex items-center px-3 self-center" aria-hidden>
      <span className="bp-connector" />
      <svg className="w-3 h-3 text-[#8FA88E]/45 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

function DocNode({ kind, projectId, docs }: { kind: DocKind; projectId: string; docs: AnyDoc[] }) {
  const meta = DOC_META[kind];
  const doc = docs[0];
  const hasDoc = !!doc;

  return (
    <div className="flex-1 bp-node" data-state={hasDoc ? 'active' : 'empty'}>
      {/* accent header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-[2px]" style={{ background: meta.accent, boxShadow: hasDoc ? `0 0 8px ${meta.accent}80` : 'none', opacity: hasDoc ? 1 : 0.4 }} />
          <span className="font-code text-[13px] font-semibold tracking-wider" style={{ color: hasDoc ? meta.accent : '#475569' }}>{kind}</span>
        </div>
        {hasDoc && (
          <span className="bp-chip !px-2 !py-[2px]" style={{ borderColor: `${STATUS_META[doc.status].color}40`, color: STATUS_META[doc.status].color }}>
            {STATUS_META[doc.status].label}
          </span>
        )}
      </div>

      <p className="font-body text-[11px] text-[#EEE9DB]/45 mb-4 leading-snug">{meta.full}</p>

      {hasDoc ? (
        <>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-code text-[10px] text-[#EEE9DB]/40 tracking-wider uppercase">v{doc.version} · avance</span>
            <span className="font-code text-base font-semibold" style={{ color: meta.accent }}>{doc.progress_pct}<span className="text-[11px] text-[#EEE9DB]/45">%</span></span>
          </div>
          <div className="bp-gauge mb-4">
            <span style={{ width: `${doc.progress_pct}%`, background: `linear-gradient(90deg, ${meta.accent}99, ${meta.accent})` }} />
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="font-code text-[10px] text-[#EEE9DB]/40">{doc.answered_count}/{doc.total_questions} resp.</span>
            <Link href={`/documents/${meta.slug}/${doc.id}`} className="bp-btn">
              {doc.progress_pct < 100 ? 'Continuar' : 'Ver'}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3 mt-auto">
          <span className="font-code text-[10px] text-[#EEE9DB]/40 tracking-wide">Sin iniciar</span>
          <Link href={`/documents/${meta.slug}/new?projectId=${projectId}`} className="bp-btn">
            Iniciar {kind}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border border-[#8FA88E]/20 rounded" style={{ transform: 'rotate(45deg)' }} />
        <div className="absolute inset-0 border-t border-[#8FA88E] rounded animate-spin" style={{ transform: 'rotate(45deg)' }} />
      </div>
      <p className="bp-eyebrow">Cargando proyectos</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bp-panel py-24 px-6 text-center fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
        <CubeMark className="w-12 h-12 opacity-90" />
      </div>
      <h3 className="font-display text-xl text-[#EEE9DB] mb-2">Sin proyectos asignados</h3>
      <p className="font-body text-sm text-[#EEE9DB]/45 max-w-sm mx-auto">
        Los proyectos de tu organización aparecerán aquí. Contacta al administrador para crear el primero.
      </p>
    </div>
  );
}
