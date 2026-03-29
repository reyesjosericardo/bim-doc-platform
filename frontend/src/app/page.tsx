import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#060D1A] text-white overflow-x-hidden">
      {/* Blueprint dot-grid background */}
      <div className="blueprint-grid fixed inset-0 pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#060D1A]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logotype */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
              <div
                className="absolute inset-0 border border-cyan-400/25 rounded"
                style={{ transform: 'rotate(45deg) scale(0.72)' }}
              />
              <svg
                className="w-[18px] h-[18px] text-cyan-400 relative z-10"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-code text-sm font-semibold text-white tracking-wider">
                BIM<span className="text-cyan-400">·</span>DOC
              </span>
              <span className="hidden sm:inline font-code text-xs text-slate-600 tracking-widest uppercase">
                Platform
              </span>
            </div>
          </div>

          {/* Nav right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 font-code text-[11px] text-cyan-400/65 border border-cyan-400/20 px-3 py-1.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              ISO 19650
            </div>
            <Link href="/auth/signin" className="btn-cta">
              Iniciar sesión
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 px-6">
        {/* Corner bracket decorations */}
        <div className="absolute top-16 left-6 w-10 h-10 border-l-2 border-t-2 border-cyan-400/15 pointer-events-none" />
        <div className="absolute top-16 right-6 w-10 h-10 border-r-2 border-t-2 border-cyan-400/15 pointer-events-none" />

        {/* Vertical accent lines */}
        <div className="absolute top-0 left-[22%] h-36 w-px bg-gradient-to-b from-transparent via-cyan-400/8 to-transparent hidden xl:block pointer-events-none" />
        <div className="absolute top-0 right-[22%] h-36 w-px bg-gradient-to-b from-transparent via-cyan-400/8 to-transparent hidden xl:block pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Pre-heading */}
          <div className="inline-flex items-center gap-3 mb-8 fade-up" style={{ animationDelay: '0ms' }}>
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400/35" />
            <span className="font-code text-[11px] text-cyan-400/75 tracking-[0.3em] uppercase">
              Plataforma documental BIM
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/35" />
          </div>

          {/* Main heading */}
          <h1 className="fade-up" style={{ animationDelay: '80ms' }}>
            <span className="block font-display text-[clamp(3rem,9vw,88px)] font-bold leading-none tracking-tight text-white">
              Gestión BIM
            </span>
            <span className="block font-display text-[clamp(2.25rem,7vw,68px)] font-light leading-tight mt-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400">
              conforme a norma
            </span>
          </h1>

          {/* Reference annotation */}
          <div
            className="flex items-center justify-center gap-4 mt-7 mb-8 fade-up"
            style={{ animationDelay: '160ms' }}
          >
            <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-slate-700" />
            <span className="font-code text-[11px] text-slate-500 tracking-wider">
              REF: ISO 19650–1 · ISO 19650–2
            </span>
            <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-slate-700" />
          </div>

          {/* Description */}
          <p
            className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10 fade-up"
            style={{ animationDelay: '240ms' }}
          >
            Genera, gestiona y exporta los documentos clave del proceso BIM —{' '}
            <span className="font-code text-base text-cyan-300/90">OIR</span>,{' '}
            <span className="font-code text-base text-cyan-300/90">EIR</span>,{' '}
            <span className="font-code text-base text-cyan-300/90">BEP</span>{' '}
            — con narrativas técnicas asistidas por IA y exportación Word + PDF.
          </p>

          {/* CTA */}
          <div className="fade-up" style={{ animationDelay: '320ms' }}>
            <Link href="/auth/signin" className="btn-cta-lg group">
              <span>Acceder a la plataforma</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-white/[0.045] bg-white/[0.018]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-white/[0.04]">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4">
              <div className="font-display text-4xl font-bold text-white leading-none mb-1.5">
                {s.n}
              </div>
              <div className="text-xs text-slate-400">{s.label}</div>
              <div className="font-code text-[10px] text-cyan-400/45 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature grid ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-code text-[11px] text-cyan-400/55 tracking-[0.3em] uppercase mb-3">
              — módulos implementados —
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              Funcionalidades del sistema
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card fade-up"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* Coloured top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${f.topLine}`} />

                {/* Icon */}
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-4 ${f.iconBg}`}>
                  {f.icon}
                </div>

                <h3 className="font-semibold text-slate-100 text-sm mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>

                {f.badge && (
                  <span className={`inline-block mt-3 font-code text-[11px] px-2 py-0.5 rounded-sm border ${f.badgeClass}`}>
                    {f.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Document pipeline ── */}
      <section className="py-16 px-6 border-t border-white/[0.045]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-code text-[11px] text-cyan-400/55 tracking-[0.3em] uppercase mb-3">
              — jerarquía documental —
            </p>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Flujo ISO 19650
            </h2>
            <p className="text-slate-500 text-sm">Del adjudicador al adjudicatario</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">
            {PIPELINE.map((item, i) => (
              <div key={item.label} className="flex flex-col sm:flex-row items-center">
                {i > 0 && (
                  <div className={`pipeline-connector ${item.active || PIPELINE[i - 1].active ? 'opacity-50' : 'opacity-15'}`}>
                    <svg
                      className="w-5 h-5 text-cyan-400 rotate-90 sm:rotate-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
                <div className={`pipeline-node ${item.active ? 'pipeline-node-active' : 'pipeline-node-inactive'}`}>
                  <span className={`font-code text-[10px] font-medium tracking-widest mb-1 ${item.active ? 'text-cyan-300/80' : 'text-slate-600'}`}>
                    {item.tag}
                  </span>
                  <span className={`font-display text-2xl font-bold ${item.active ? 'text-white' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  {item.active && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
                      <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-60" />
                      <span className="relative block w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center font-code text-[11px] text-slate-700 mt-8 tracking-wide">
            nodos activos = documentos habilitados en la plataforma
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.045] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-code text-xs text-slate-700">
            <span>BIM·DOC PLATFORM</span>
            <span className="text-slate-800">·</span>
            <span>ISO 19650-1 / ISO 19650-2</span>
          </div>
          <span className="font-code text-xs text-cyan-400/25">
            v4.0 · Sprint 4 — EIR module
          </span>
        </div>
      </footer>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { n: '5',  label: 'Bloques OIR',     sub: 'B1 → B5' },
  { n: '6',  label: 'Bloques EIR',     sub: 'B1 → B6' },
  { n: 'AI', label: 'Narrativas LLM',  sub: 'claude-haiku' },
  { n: '2×', label: 'Formatos export', sub: '.docx + .pdf' },
];

const FEATURES = [
  {
    title: 'OIR — Requisitos de la Organización',
    description:
      'Define los requisitos de información de la organización: usos BIM, estándares, activos y gobernanza. Exporta en Word y PDF.',
    badge: 'Implementado',
    topLine: 'bg-gradient-to-r from-blue-500/70 via-blue-500/20 to-transparent',
    iconBg: 'bg-blue-500/10',
    badgeClass: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'EIR — Requisitos de Intercambio',
    description:
      'El "Pliego BIM" contractual: hitos de entrega, LOIN, estándares de información, CDE y gobernanza. Conforme a ISO 19650-2.',
    badge: 'Implementado',
    topLine: 'bg-gradient-to-r from-cyan-500/70 via-cyan-500/20 to-transparent',
    iconBg: 'bg-cyan-500/10',
    badgeClass: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
    icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Narrativas LLM por sección',
    description:
      'Cada sección se enriquece con párrafos técnicos ejecutivos generados por IA, con terminología ISO 19650 estricta.',
    badge: 'Claude Haiku',
    topLine: 'bg-gradient-to-r from-emerald-500/70 via-emerald-500/20 to-transparent',
    iconBg: 'bg-emerald-500/10',
    badgeClass: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Exportación Word y PDF',
    description:
      'Genera documentos .docx con estilos profesionales (Heading 2/3, tablas, header/footer) y PDF renderizado vía Puppeteer.',
    badge: '',
    topLine: 'bg-gradient-to-r from-amber-500/70 via-amber-500/20 to-transparent',
    iconBg: 'bg-amber-500/10',
    badgeClass: '',
    icon: (
      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: 'Roles y flujo de aprobación',
    description:
      'Tres roles ISO 19650: adjudicador, adjudicatario principal y adjudicatario. Flujo borrador → revisión → aprobado.',
    badge: '',
    topLine: 'bg-gradient-to-r from-rose-500/70 via-rose-500/20 to-transparent',
    iconBg: 'bg-rose-500/10',
    badgeClass: '',
    icon: (
      <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Autosave y progreso por bloque',
    description:
      'Guardado automático al avanzar entre bloques. Barra de progreso con conteo de preguntas respondidas, incluyendo condicionales.',
    badge: '',
    topLine: 'bg-gradient-to-r from-sky-500/70 via-sky-500/20 to-transparent',
    iconBg: 'bg-sky-500/10',
    badgeClass: '',
    icon: (
      <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
  },
];

const PIPELINE = [
  { tag: 'Organización',  label: 'OIR', active: true },
  { tag: 'Proyecto',      label: 'PIR', active: false },
  { tag: 'Activo',        label: 'AIR', active: false },
  { tag: 'Intercambio',   label: 'EIR', active: true },
  { tag: 'Adjudicatario', label: 'BEP', active: false },
];
