'use client';

import { SelectField, MultiSelectField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

function YesNoField({ id, label, required, answers, onChange }: { id: string; label: string; required?: boolean; answers: AnswersMap; onChange: (id: string, value: string) => void }) {
  const value = answers[id] || '';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-3">
        {['Sí', 'No'].map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(id, opt)}
            className={`px-5 py-2 text-sm rounded-lg border transition-colors ${value === opt ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const ENTREGABLES_OPTIONS = [
  { value: 'Modelos BIM', label: 'Modelos BIM' },
  { value: 'Planos 2D', label: 'Planos 2D' },
  { value: 'Presupuesto y mediciones', label: 'Presupuesto y mediciones' },
  { value: 'Memoria descriptiva', label: 'Memoria descriptiva' },
  { value: 'Plan de mantenimiento', label: 'Plan de mantenimiento' },
  { value: 'Manual O&M', label: 'Manual de operación y mantenimiento (O&M)' },
  { value: 'As Built', label: 'Modelo As Built' },
];

const CLASH_FREQ_OPTIONS = [
  { value: 'Por hito de fase', label: 'Por hito de fase' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Quincenal', label: 'Quincenal' },
  { value: 'Semanal', label: 'Semanal' },
];

const BEP_TIMING_OPTIONS = [
  { value: 'Antes de licitación', label: 'Antes de licitación (PRE-BEP)' },
  { value: 'Al adjudicar contrato', label: 'Al adjudicar el contrato (BEP contractual)' },
  { value: 'En las primeras 2 semanas del proyecto', label: 'En las primeras 2 semanas del proyecto' },
];

export function Block3({ answers, onChange }: Props) {
  const hasClash = answers['EIR-3.3'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 3 — Hitos y entregables de información</h2>
        <p className="text-sm text-gray-500 mt-1">Qué debe entregar el equipo de desarrollo y cuándo (EIR-3.1 a EIR-3.5)</p>
      </div>

      <MultiSelectField id="EIR-3.1" label="EIR-3.1 Entregables mínimos requeridos en cada hito" required options={ENTREGABLES_OPTIONS} answers={answers} onChange={onChange} />

      <YesNoField id="EIR-3.2" label="EIR-3.2 ¿Se requiere entrega en formato IFC en cada hito?" required answers={answers} onChange={onChange} />

      <YesNoField id="EIR-3.3" label="EIR-3.3 ¿Se requiere detección de conflictos (clash detection)?" required answers={answers} onChange={onChange} />

      {hasClash && (
        <div className="pl-4 border-l-2 border-brand-200">
          <SelectField id="EIR-3.4" label="EIR-3.4 Frecuencia de clash detection" required options={CLASH_FREQ_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}

      <SelectField id="EIR-3.5" label="EIR-3.5 Momento de entrega del Plan de Ejecución BIM (BEP)" required options={BEP_TIMING_OPTIONS} answers={answers} onChange={onChange} />
    </div>
  );
}
