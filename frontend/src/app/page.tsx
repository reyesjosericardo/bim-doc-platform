import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

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

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#141B16] text-[#EEE9DB] overflow-x-hidden">
      {/* Brand dot-grid background */}
      <div className="brand-grid fixed inset-0 pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-[#EEE9DB]/[0.06] bg-[#141B16]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logotype */}
          <div className="flex items-center gap-3">
            <CubeMark className="w-8 h-8 flex-shrink-0" />
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[15px] tracking-[0.13em] text-[#EEE9DB]">INCOESTRUCTURA</span>
              <span className="hidden sm:block h-4 w-px bg-[#EEE9DB]/15" />
              <span className="hidden sm:inline font-code text-[10px] text-[#8FA88E]/70 tracking-[0.22em] uppercase">
                BIM·Doc
              </span>
            </div>
          </div>

          {/* Nav right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 font-code text-[11px] text-[#8FA88E]/70 border border-[#8FA88E]/25 px-3 py-1.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA88E] animate-pulse" />
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
        <div className="absolute top-16 left-6 w-10 h-10 border-l-2 border-t-2 border-[#8FA88E]/20 pointer-events-none" />
        <div className="absolute top-16 right-6 w-10 h-10 border-r-2 border-t-2 border-[#8FA88E]/20 pointer-events-none" />

        {/* Vertical accent lines */}
        <div className="absolute top-0 left-[22%] h-36 w-px bg-gradient-to-b from-transparent via-[#8FA88E]/10 to-transparent hidden xl:block pointer-events-none" />
        <div className="absolute top-0 right-[22%] h-36 w-px bg-gradient-to-b from-transparent via-[#8FA88E]/10 to-transparent hidden xl:block pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Pre-heading */}
          <div className="inline-flex items-center gap-3 mb-8 fade-up" style={{ animationDelay: '0ms' }}>
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#8FA88E]/40" />
            <span className="font-code text-[11px] text-[#8FA88E]/80 tracking-[0.3em] uppercase">
              Plataforma documental BIM
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#8FA88E]/40" />
          </div>

          {/* Main heading */}
          <h1 className="fade-up" style={{ animationDelay: '80ms' }}>
            <span className="block font-display text-[clamp(3rem,9vw,88px)] font-bold leading-none tracking-tight text-[#EEE9DB]">
              Gestión BIM
            </span>
            <span className="block font-display text-[clamp(2.25rem,7vw,68px)] font-light leading-tight mt-3 text-transparent bg-clip-text bg-gradient-to-r from-[#EEE9DB] via-[#A9C3A6] to-[#8FA88E]">
              conforme a norma
            </span>
          </h1>

          {/* Reference annotation */}
          <div className="flex items-center justify-center gap-4 mt-7 mb-8 fade-up" style={{ animationDelay: '160ms' }}>
            <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-[#EEE9DB]/20" />
            <span className="font-code text-[11px] text-[#EEE9DB]/45 tracking-wider">
              REF: ISO 19650–1 · ISO 19650–2
            </span>
            <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-[#EEE9DB]/20" />
          </div>

          {/* Description */}
          <p className="text-[#EEE9DB]/55 text-lg max-w-2xl mx-auto leading-relaxed mb-10 fade-up" style={{ animationDelay: '240ms' }}>
            Genera, gestiona y exporta los documentos clave del proceso BIM —{' '}
            <span className="font-code text-base text-[#A9C3A6]">OIR</span>,{' '}
            <span className="font-code text-base text-[#A9C3A6]">EIR</span>,{' '}
            <span className="font-code text-base text-[#A9C3A6]">BEP</span>{' '}
            — con narrativas técnicas asistidas por IA y exportación Word + PDF.
          </p>

          {/* CTA */}
          <div className="fade-up" style={{ animationDelay: '320ms' }}>
            <Link href="/auth/signin" className="btn-cta-lg group">
              <span>Acceder a la plataforma</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-[#EEE9DB]/[0.05] bg-[#EEE9DB]/[0.015]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-[#EEE9DB]/[0.05]">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4">
              <div className="font-display text-4xl font-bold text-[#EEE9DB] leading-none mb-1.5">{s.n}</div>
              <div className="text-xs text-[#EEE9DB]/45">{s.label}</div>
              <div className="font-code text-[10px] text-[#8FA88E]/55 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature grid ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-code text-[11px] text-[#8FA88E]/60 tracking-[0.3em] uppercase mb-3">
              — módulos implementados —
            </p>
            <h2 className="font-display text-3xl font-bold text-[#EEE9DB]">Funcionalidades del sistema</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${f.accent}b3, ${f.accent}33 40%, transparent)` }} />
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4" style={{ background: `${f.accent}1a`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#EEE9DB] text-sm mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-[#EEE9DB]/45 leading-relaxed">{f.description}</p>
                {f.badge && (
                  <span className="inline-block mt-3 font-code text-[11px] px-2 py-0.5 rounded-sm border" style={{ color: f.accent, background: `${f.accent}1a`, borderColor: `${f.accent}33` }}>
                    {f.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Document pipeline ── */}
      <section className="py-16 px-6 border-t border-[#EEE9DB]/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-code text-[11px] text-[#8FA88E]/60 tracking-[0.3em] uppercase mb-3">
              — jerarquía documental —
            </p>
            <h2 className="font-display text-2xl font-bold text-[#EEE9DB] mb-2">Flujo ISO 19650</h2>
            <p className="text-[#EEE9DB]/45 text-sm">Del adjudicador al adjudicatario</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">
            {PIPELINE.map((item, i) => (
              <div key={item.label} className="flex flex-col sm:flex-row items-center">
                {i > 0 && (
                  <div className={`pipeline-connector ${item.active || PIPELINE[i - 1].active ? 'opacity-50' : 'opacity-15'}`}>
                    <svg className="w-5 h-5 text-[#8FA88E] rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
                <div className={`pipeline-node ${item.active ? 'pipeline-node-active' : 'pipeline-node-inactive'}`}>
                  <span className={`font-code text-[10px] font-medium tracking-widest mb-1 ${item.active ? 'text-[#A9C3A6]/80' : 'text-[#EEE9DB]/30'}`}>
                    {item.tag}
                  </span>
                  <span className={`font-display text-2xl font-bold ${item.active ? 'text-[#EEE9DB]' : 'text-[#EEE9DB]/30'}`}>
                    {item.label}
                  </span>
                  {item.active && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
                      <span className="absolute inset-0 rounded-full bg-[#8FA88E] animate-ping opacity-60" />
                      <span className="relative block w-2.5 h-2.5 rounded-full bg-[#8FA88E]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center font-code text-[11px] text-[#EEE9DB]/30 mt-8 tracking-wide">
            nodos activos = documentos habilitados en la plataforma
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#EEE9DB]/[0.05] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CubeMark className="w-5 h-5" />
            <span className="font-code text-xs text-[#EEE9DB]/50 tracking-wide">
              INCOESTRUCTURA · BIM·Doc
            </span>
            <span className="text-[#EEE9DB]/20">·</span>
            <span className="font-code text-xs text-[#EEE9DB]/40">ISO 19650-1 / 19650-2</span>
          </div>
          <span className="font-code text-xs text-[#8FA88E]/40">Sprint 5 — módulo BEP</span>
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

// Natural-materials palette: sage · wheat · soft-green · clay · stone · sage-light
const FEATURES = [
  {
    title: 'OIR — Requisitos de la Organización',
    description:
      'Define los requisitos de información de la organización: usos BIM, estándares, activos y gobernanza. Exporta en Word y PDF.',
    badge: 'Implementado',
    accent: '#8FA88E',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    accent: '#C9A86A',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'BEP — Plan de Ejecución BIM',
    description:
      'La respuesta del adjudicatario al EIR: gestión, planificación, estándares, CDE, software y hardware. Narrativas y export.',
    badge: 'Implementado',
    accent: '#9CBE93',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Narrativas LLM por sección',
    description:
      'Cada sección se enriquece con párrafos técnicos ejecutivos generados por IA, con terminología ISO 19650 estricta.',
    badge: 'Claude Haiku',
    accent: '#B5805E',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    accent: '#B0A98F',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    accent: '#A9C3A6',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const PIPELINE = [
  { tag: 'Organización',  label: 'OIR', active: true },
  { tag: 'Proyecto',      label: 'PIR', active: false },
  { tag: 'Activo',        label: 'AIR', active: false },
  { tag: 'Intercambio',   label: 'EIR', active: true },
  { tag: 'Adjudicatario', label: 'BEP', active: true },
];
