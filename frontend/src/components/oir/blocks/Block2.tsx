'use client';

import { TextField, SelectField, BooleanField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

interface BimUse {
  code: string;
  en: string;
  es: string;
  fase: string;
}

const BIM_USES: BimUse[] = [
  // Planificación
  { code: 'BU-01', en: 'Existing Conditions Modeling',    es: 'Modelado de condiciones existentes',           fase: 'Planificación' },
  { code: 'BU-02', en: 'Cost Estimation',                 es: 'Estimación de costos',                         fase: 'Planificación' },
  { code: 'BU-03', en: 'Phase Planning (4D Modeling)',    es: 'Planificación de fases — modelado 4D',         fase: 'Planificación' },
  { code: 'BU-04', en: 'Programming',                     es: 'Programación de usos del espacio',             fase: 'Planificación' },
  { code: 'BU-05', en: 'Site Analysis',                   es: 'Análisis de sitio',                            fase: 'Planificación' },
  // Diseño
  { code: 'BU-06', en: 'Design Authoring',                es: 'Autoría del diseño',                           fase: 'Diseño' },
  { code: 'BU-07', en: 'Design Reviews',                  es: 'Revisiones de diseño',                         fase: 'Diseño' },
  { code: 'BU-08', en: '3D Coordination',                 es: 'Coordinación 3D — detección de interferencias', fase: 'Diseño' },
  { code: 'BU-09', en: 'Structural Analysis',             es: 'Análisis estructural',                         fase: 'Diseño' },
  { code: 'BU-10', en: 'Lighting Analysis',               es: 'Análisis de iluminación',                      fase: 'Diseño' },
  { code: 'BU-11', en: 'Energy Analysis',                 es: 'Análisis energético',                          fase: 'Diseño' },
  { code: 'BU-12', en: 'Mechanical Analysis',             es: 'Análisis de sistemas mecánicos',               fase: 'Diseño' },
  { code: 'BU-13', en: 'Other Engineering Analysis',      es: 'Otros análisis de ingeniería',                 fase: 'Diseño' },
  { code: 'BU-14', en: 'Sustainability Evaluation',       es: 'Evaluación de sostenibilidad',                 fase: 'Diseño' },
  { code: 'BU-15', en: 'Code Validation',                 es: 'Validación normativa y regulatoria',           fase: 'Diseño' },
  // Construcción
  { code: 'BU-16', en: 'Site Utilization Planning',       es: 'Planificación de uso del sitio en obra',       fase: 'Construcción' },
  { code: 'BU-17', en: 'Construction System Design',      es: 'Diseño de sistemas constructivos',             fase: 'Construcción' },
  { code: 'BU-18', en: 'Digital Fabrication',             es: 'Fabricación digital',                          fase: 'Construcción' },
  { code: 'BU-19', en: '3D Control and Planning',         es: 'Control y planificación 3D en obra',           fase: 'Construcción' },
  // Operación
  { code: 'BU-20', en: 'Record Modeling (As-Built)',      es: 'Modelado as-built — condición construida',     fase: 'Operación' },
  { code: 'BU-21', en: 'Maintenance Scheduling',          es: 'Programación de mantenimiento preventivo',     fase: 'Operación' },
  { code: 'BU-22', en: 'Building System Analysis',        es: 'Análisis de sistemas del edificio',            fase: 'Operación' },
  { code: 'BU-23', en: 'Asset Management',                es: 'Gestión de activos',                           fase: 'Operación' },
  { code: 'BU-24', en: 'Space Management and Tracking',   es: 'Gestión y seguimiento de espacios',            fase: 'Operación' },
  { code: 'BU-25', en: 'Disaster Planning',               es: 'Planificación ante emergencias y desastres',   fase: 'Operación' },
];

const PHASES = ['Planificación', 'Diseño', 'Construcción', 'Operación'];

const PHASE_COLORS: Record<string, string> = {
  'Planificación': 'bg-violet-50 border-violet-200 text-violet-700',
  'Diseño':        'bg-blue-50 border-blue-200 text-blue-700',
  'Construcción':  'bg-amber-50 border-amber-200 text-amber-700',
  'Operación':     'bg-green-50 border-green-200 text-green-700',
};

const NORMA_PLAN_OPTIONS = [
  { value: 'ISO 55000', label: 'ISO 55000' },
  { value: 'PAS 55', label: 'PAS 55' },
  { value: 'Propio', label: 'Propio' },
  { value: 'Otro', label: 'Otro' },
];

export function Block2({ answers, onChange }: Props) {
  const tienePlanActivos = answers['OIR-2.3'] === 'Sí';
  const tieneObligaciones = answers['OIR-2.5'] === 'Sí';

  const rawValue = answers['OIR-2.1'] ?? '';
  const selected = rawValue ? rawValue.split('|') : [];

  function toggle(code: string) {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    onChange('OIR-2.1', next.join('|'));
  }

  const totalSelected = selected.length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Objetivos estratégicos</h2>
        <p className="text-sm text-gray-500 mt-1">Usos BIM y alineación estratégica (OIR-2.1 a OIR-2.6)</p>
      </div>

      {/* OIR-2.1 — BIM Uses (Penn State framework) */}
      <div>
        <label className="label">
          OIR-2.1 Usos BIM requeridos <span className="text-red-500 ml-0.5">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-1">
          Según el framework BIM Uses de Penn State. Pasa el cursor sobre cada uso para ver el nombre en inglés.
        </p>
        {totalSelected > 0 && (
          <p className="text-xs font-medium text-brand-700 mb-3">
            {totalSelected} uso{totalSelected !== 1 ? 's' : ''} seleccionado{totalSelected !== 1 ? 's' : ''} en total
          </p>
        )}

        <div className="space-y-4">
          {PHASES.map((fase) => {
            const phaseUses = BIM_USES.filter((u) => u.fase === fase);
            const selectedInPhase = phaseUses.filter((u) => selected.includes(u.code)).length;
            const colorClass = PHASE_COLORS[fase];

            return (
              <div key={fase} className={`rounded-lg border p-3 ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${colorClass.split(' ')[2]}`}>
                    {fase}
                  </span>
                  <span className="text-xs text-gray-500">
                    {selectedInPhase} de {phaseUses.length} seleccionados
                  </span>
                </div>
                <div className="space-y-1">
                  {phaseUses.map((use) => (
                    <label
                      key={use.code}
                      title={use.en}
                      className="flex items-center gap-3 cursor-pointer group rounded px-2 py-1 hover:bg-white/60"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(use.code)}
                        onChange={() => toggle(use.code)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 shrink-0"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        <span className="font-mono text-xs text-gray-400 mr-1">{use.code}</span>
                        {use.es}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TextField
        id="OIR-2.2"
        label="OIR-2.2 Objetivo estratégico principal"
        required
        type="textarea"
        maxLength={500}
        answers={answers}
        onChange={onChange}
      />

      <BooleanField
        id="OIR-2.3"
        label="OIR-2.3 ¿Tiene plan de gestión de activos vigente?"
        required
        answers={answers}
        onChange={onChange}
      />

      {tienePlanActivos && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <SelectField
            id="OIR-2.4"
            label="OIR-2.4 Norma del plan de gestión"
            options={NORMA_PLAN_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}

      <BooleanField
        id="OIR-2.5"
        label="OIR-2.5 ¿Existen obligaciones regulatorias?"
        required
        answers={answers}
        onChange={onChange}
      />

      {tieneObligaciones && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <TextField
            id="OIR-2.6"
            label="OIR-2.6 Describe las obligaciones regulatorias"
            type="textarea"
            maxLength={400}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
