'use client';

import { SelectField, MultiSelectField, TextareaField } from '../../oir/FormField';
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

const CDE_OPTIONS = [
  { value: 'ACC', label: 'ACC — Autodesk Construction Cloud' },
  { value: 'BIM 360', label: 'BIM 360' },
  { value: 'SharePoint', label: 'Microsoft SharePoint' },
  { value: 'Procore', label: 'Procore' },
  { value: 'Altro', label: 'Otra plataforma' },
];

const STATES_OPTIONS = [
  { value: 'WIP', label: 'WIP — Trabajo en progreso (Work in Progress)' },
  { value: 'Compartido', label: 'Compartido (Shared) — Para coordinación multidisciplinaria' },
  { value: 'Publicado', label: 'Publicado (Published) — Aprobado por el adjudicador' },
  { value: 'Archivado', label: 'Archivado (Archived) — Contenedores finales en AIM' },
];

export function Block6({ answers, onChange }: Props) {
  const clientProvidesCde = answers['EIR-6.1'] === 'Sí';
  const hasRestrictions = answers['EIR-6.5'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 6 — CDE y gobernanza</h2>
        <p className="text-sm text-gray-500 mt-1">Entorno Común de Datos y requisitos de gobernanza (EIR-6.1 a EIR-6.6)</p>
      </div>

      <YesNoField id="EIR-6.1" label="EIR-6.1 ¿El adjudicador provee el Entorno Común de Datos (CDE)?" required answers={answers} onChange={onChange} />

      {clientProvidesCde && (
        <div className="pl-4 border-l-2 border-brand-200">
          <SelectField id="EIR-6.2" label="EIR-6.2 Plataforma CDE provista por el adjudicador" required options={CDE_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}

      <MultiSelectField id="EIR-6.3" label="EIR-6.3 Estados de flujo de información requeridos en el CDE" required options={STATES_OPTIONS} answers={answers} onChange={onChange} />

      <YesNoField id="EIR-6.4" label="EIR-6.4 ¿Se requiere estructura de carpetas conforme a ISO 19650?" required answers={answers} onChange={onChange} />

      <YesNoField id="EIR-6.5" label="EIR-6.5 ¿Existen restricciones de acceso a información sensible?" required answers={answers} onChange={onChange} />

      {hasRestrictions && (
        <div className="pl-4 border-l-2 border-brand-200">
          <TextareaField id="EIR-6.6" label="EIR-6.6 Descripción de restricciones de acceso" required answers={answers} onChange={onChange} placeholder="Describe las restricciones: tipos de información restringida, roles con acceso, procedimiento de solicitud de acceso..." />
        </div>
      )}
    </div>
  );
}
