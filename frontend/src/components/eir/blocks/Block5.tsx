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

const LOIN_OPTIONS = [
  { value: 'nivel_1', label: 'Nivel 1 — Representación conceptual', description: 'Forma genérica, sin dimensiones exactas' },
  { value: 'nivel_2', label: 'Nivel 2 — Representación genérica', description: 'Forma aproximada con dimensiones globales' },
  { value: 'nivel_3', label: 'Nivel 3 — Representación específica', description: 'Geometría detallada, atributos técnicos específicos' },
  { value: 'nivel_4', label: 'Nivel 4 — Representación detallada', description: 'Información completa de fabricación y montaje' },
  { value: 'nivel_5', label: 'Nivel 5 — Representación construida', description: 'Condición as-built verificada en obra' },
];

const COMPONENTS_OPTIONS = [
  { value: 'Geométrico', label: 'Geométrico — Forma, dimensiones, posición y precisión' },
  { value: 'Datos alfanuméricos', label: 'Datos alfanuméricos — Parámetros, especificaciones técnicas' },
  { value: 'Fichas técnicas y documentos', label: 'Fichas técnicas y documentos — URLs, PDFs vinculados al modelo' },
];

const DISCIPLINES_OPTIONS = [
  { value: 'Arquitectura', label: 'Arquitectura' },
  { value: 'Estructura', label: 'Estructura' },
  { value: 'HVAC / Climatización', label: 'HVAC / Climatización' },
  { value: 'Fontanería y Saneamiento', label: 'Fontanería y Saneamiento' },
  { value: 'Electricidad', label: 'Electricidad' },
  { value: 'Telecomunicaciones', label: 'Telecomunicaciones' },
  { value: 'Urbanización', label: 'Urbanización' },
];

export function Block5({ answers, onChange }: Props) {
  const loinByDiscipline = answers['EIR-5.3'] === 'Sí';
  const selectedLoin = answers['EIR-5.1'] || '';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Nivel de información necesario (LOIN)</h2>
        <p className="text-sm text-gray-500 mt-1">
          Requisitos de información según ISO 19650-1 §11.2 y EN17412-1 (EIR-5.1 a EIR-5.4)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          EIR-5.1 Nivel mínimo de información necesario requerido <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">Referencia: ISO 19650-1 §11.2 — Nivel de información necesario</p>
        <div className="space-y-2">
          {LOIN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('EIR-5.1', opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedLoin === opt.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 bg-white'
              }`}
            >
              <div className={`text-sm font-medium ${selectedLoin === opt.value ? 'text-brand-700' : 'text-gray-800'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <MultiSelectField id="EIR-5.2" label="EIR-5.2 Componentes de información requeridos (LOIN)" required options={COMPONENTS_OPTIONS} answers={answers} onChange={onChange} />

      <YesNoField id="EIR-5.3" label="EIR-5.3 ¿Se requiere LOIN diferenciado por disciplina?" required answers={answers} onChange={onChange} />

      {loinByDiscipline && (
        <div className="pl-4 border-l-2 border-brand-200">
          <MultiSelectField id="EIR-5.4" label="EIR-5.4 Disciplinas con requisitos LOIN específicos" required options={DISCIPLINES_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
