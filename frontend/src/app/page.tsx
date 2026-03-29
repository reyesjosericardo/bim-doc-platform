import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Navbar ── */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm">BIM Doc Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              ISO 19650
            </span>
            <Link href="/auth/signin" className="btn-primary text-sm py-2">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Plataforma de gestión documental BIM
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-3xl leading-tight mb-5">
          Gestión de documentos BIM
          <span className="text-brand-600"> conforme a ISO 19650</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-8 leading-relaxed">
          Genera, gestiona y exporta los documentos clave del proceso BIM — OIR, EIR, BEP —
          con narrativas técnicas asistidas por IA y exportación Word + PDF.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signin" className="btn-primary px-6 py-2.5 text-sm gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Acceder a la plataforma
          </Link>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-brand-200 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              {f.badge && (
                <span className="inline-block mt-3 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Document pipeline ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flujo documental ISO 19650</h2>
          <p className="text-gray-500 text-sm">Jerarquía de documentos del adjudicador al adjudicatario</p>
        </div>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          {PIPELINE.map((item, i) => (
            <div key={item.label} className="flex sm:flex-col items-center gap-3 sm:gap-2">
              {i > 0 && (
                <svg className="w-5 h-5 text-gray-300 sm:rotate-90 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
              <div className={`rounded-xl border px-5 py-3 text-center flex-shrink-0 ${item.active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
                <p className={`text-xs font-bold mb-0.5 ${item.active ? 'text-brand-100' : 'text-gray-400'}`}>{item.tag}</p>
                <p className={`text-sm font-semibold ${item.active ? 'text-white' : 'text-gray-800'}`}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <p className="text-xs text-gray-400">
          BIM Doc Platform · ISO 19650-1 / ISO 19650-2 ·{' '}
          <span className="text-gray-500 font-medium">Sprint 4 — EIR</span>
        </p>
      </footer>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'OIR — Requisitos de la Organización',
    description: 'Define los requisitos de información de la organización: usos BIM, estándares, activos y gobernanza. Exporta en Word y PDF.',
    badge: 'Implementado',
    iconBg: 'bg-brand-50',
    icon: (
      <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'EIR — Requisitos de Intercambio',
    description: 'El "Pliego BIM" contractual: hitos de entrega, LOIN, estándares de información, CDE y gobernanza. Conforme a ISO 19650-2.',
    badge: 'Implementado',
    iconBg: 'bg-purple-50',
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Narrativas LLM por sección',
    description: 'Cada sección del documento se enriquece con párrafos técnicos ejecutivos generados por IA, con terminología ISO 19650 estricta.',
    badge: 'Claude Haiku',
    iconBg: 'bg-emerald-50',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Exportación Word y PDF',
    description: 'Genera documentos .docx con estilos profesionales (Heading 2/3, tablas, header/footer) y PDF renderizado vía Puppeteer.',
    iconBg: 'bg-amber-50',
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: 'Roles y flujo de aprobación',
    description: 'Tres roles ISO 19650: adjudicador, adjudicatario principal y adjudicatario. Flujo borrador → revisión → aprobado.',
    iconBg: 'bg-rose-50',
    icon: (
      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Autosave y progreso por bloque',
    description: 'Guardado automático al avanzar entre bloques. Barra de progreso con conteo de preguntas respondidas, incluyendo condicionales.',
    iconBg: 'bg-sky-50',
    icon: (
      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
  },
];

const PIPELINE = [
  { tag: 'Organización', label: 'OIR', active: true },
  { tag: 'Proyecto', label: 'PIR', active: false },
  { tag: 'Activo', label: 'AIR', active: false },
  { tag: 'Intercambio', label: 'EIR', active: true },
  { tag: 'Adjudicatario', label: 'BEP', active: false },
];
