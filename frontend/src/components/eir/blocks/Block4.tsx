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

const NAMING_OPTIONS = [
  { value: 'ISO 19650', label: 'ISO 19650 — Nomenclatura internacional' },
  { value: 'BS 1192', label: 'BS 1192 — British Standard' },
  { value: 'Propio', label: 'Sistema propio de la organización' },
  { value: 'Sin especificar', label: 'Sin especificar (a criterio del adjudicatario)' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'Uniformat', label: 'Uniformat' },
  { value: 'Omniclass', label: 'Omniclass' },
  { value: 'Uniclass 2015', label: 'Uniclass 2015' },
  { value: 'Propio', label: 'Sistema propio' },
  { value: 'Sin especificar', label: 'Sin especificar' },
];

const FORMATS_OPTIONS = [
  { value: 'IFC 2x3', label: 'IFC 2x3' },
  { value: 'IFC 4', label: 'IFC 4' },
  { value: 'RVT', label: 'RVT — Revit nativo' },
  { value: 'NWD', label: 'NWD — Navisworks' },
  { value: 'DWG', label: 'DWG — AutoCAD' },
  { value: 'PDF', label: 'PDF' },
  { value: 'XLS/XLSX', label: 'XLS/XLSX — Excel' },
  { value: 'COBie', label: 'COBie' },
];

export function Block4({ answers, onChange }: Props) {
  const requiresSoftware = answers['EIR-4.4'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 4 — Estándares de información</h2>
        <p className="text-sm text-gray-500 mt-1">Nomenclaturas, formatos y software requeridos (EIR-4.1 a EIR-4.6)</p>
      </div>

      <SelectField id="EIR-4.1" label="EIR-4.1 Sistema de nomenclatura de archivos" required options={NAMING_OPTIONS} answers={answers} onChange={onChange} />

      <SelectField id="EIR-4.2" label="EIR-4.2 Sistema de clasificación de elementos" required options={CLASSIFICATION_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="EIR-4.3" label="EIR-4.3 Formatos de intercambio requeridos" required options={FORMATS_OPTIONS} answers={answers} onChange={onChange} />

      <YesNoField id="EIR-4.4" label="EIR-4.4 ¿Se requiere versión de software específica?" required answers={answers} onChange={onChange} />

      {requiresSoftware && (
        <div className="pl-4 border-l-2 border-brand-200">
          <TextareaField id="EIR-4.5" label="EIR-4.5 Versiones de software requeridas" required answers={answers} onChange={onChange} placeholder="Ej: Revit 2024 o superior, Navisworks 2024, AutoCAD 2023..." />
        </div>
      )}

      <YesNoField id="EIR-4.6" label="EIR-4.6 ¿Se requiere COBie para operación y mantenimiento (O&M)?" required answers={answers} onChange={onChange} />
    </div>
  );
}
