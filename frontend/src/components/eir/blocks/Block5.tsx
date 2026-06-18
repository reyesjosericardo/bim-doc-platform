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

// LOIN — EN 17412-1: información geométrica (escala descriptiva, orientada al propósito)
const GEOMETRIC_OPTIONS = [
  { value: 'simbolico', label: 'Simbólica / 2D', description: 'Sin geometría 3D significativa' },
  { value: 'conceptual', label: 'Conceptual', description: 'Masa o volumen aproximado' },
  { value: 'generico', label: 'Genérica', description: 'Forma y dimensiones esquemáticas' },
  { value: 'especifico', label: 'Específica', description: 'Geometría y dimensiones definidas' },
  { value: 'fabricacion', label: 'Detallada para fabricación y montaje', description: 'Geometría de fabricación y ensamblaje' },
  { value: 'construido', label: 'Tal como construido (as-built)', description: 'Condición real verificada en obra' },
];

// LOIN — EN 17412-1: información alfanumérica (datos/atributos)
const ALPHANUMERIC_OPTIONS = [
  { value: 'Identificación y clasificación', label: 'Identificación y clasificación' },
  { value: 'Propiedades técnicas y funcionales', label: 'Propiedades técnicas y funcionales' },
  { value: 'Datos del fabricante y producto', label: 'Datos del fabricante y producto' },
  { value: 'Datos de coste', label: 'Datos de coste' },
  { value: 'Datos de garantía', label: 'Datos de garantía' },
  { value: 'Datos de operación y mantenimiento', label: 'Datos de operación y mantenimiento' },
  { value: 'Datos de sostenibilidad y energía', label: 'Datos de sostenibilidad y energía' },
];

// LOIN — EN 17412-1: documentación asociada
const DOCUMENTATION_OPTIONS = [
  { value: 'Fichas técnicas', label: 'Fichas técnicas' },
  { value: 'Certificados y homologaciones', label: 'Certificados y homologaciones' },
  { value: 'Manuales de operación y mantenimiento', label: 'Manuales de operación y mantenimiento' },
  { value: 'Garantías', label: 'Garantías' },
  { value: 'Planos as-built', label: 'Planos as-built' },
  { value: 'Instrucciones de instalación', label: 'Instrucciones de instalación' },
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
  const loinByDiscipline = answers['EIR-5.4'] === 'Sí';
  const selectedGeom = answers['EIR-5.1'] || '';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Nivel de información necesario (LOIN)</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sus tres componentes según ISO 19650-1 §11.2 y EN 17412-1 (EIR-5.1 a EIR-5.5)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          El detalle requerido debe ser <strong>el necesario para el propósito, sin exceso</strong>.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          EIR-5.1 Información geométrica requerida <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">Grado de detalle geométrico, orientado al propósito (EN 17412-1)</p>
        <div className="space-y-2">
          {GEOMETRIC_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('EIR-5.1', opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedGeom === opt.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 bg-white'
              }`}
            >
              <div className={`text-sm font-medium ${selectedGeom === opt.value ? 'text-brand-700' : 'text-gray-800'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <MultiSelectField id="EIR-5.2" label="EIR-5.2 Información alfanumérica requerida" required options={ALPHANUMERIC_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="EIR-5.3" label="EIR-5.3 Documentación asociada requerida" required options={DOCUMENTATION_OPTIONS} answers={answers} onChange={onChange} />

      <YesNoField id="EIR-5.4" label="EIR-5.4 ¿Se requiere LOIN diferenciado por disciplina?" required answers={answers} onChange={onChange} />

      {loinByDiscipline && (
        <div className="pl-4 border-l-2 border-brand-200">
          <MultiSelectField id="EIR-5.5" label="EIR-5.5 Disciplinas con requisitos LOIN específicos" required options={DISCIPLINES_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
