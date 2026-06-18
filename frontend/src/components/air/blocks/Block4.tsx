'use client';

import { SelectField, MultiSelectField, BooleanField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

// LOIN — EN 17412-1
const LOIN_GEOMETRIC_OPTIONS = [
  { value: 'simbolico',   label: 'Simbólica / 2D (sin geometría 3D significativa)' },
  { value: 'conceptual',  label: 'Conceptual (masa o volumen aproximado)' },
  { value: 'generico',    label: 'Genérica (forma y dimensiones esquemáticas)' },
  { value: 'especifico',  label: 'Específica (geometría y dimensiones definidas)' },
  { value: 'fabricacion', label: 'Detallada para fabricación y montaje' },
  { value: 'construido',  label: 'Tal como construido (as-built verificado)' },
];

const LOIN_ALPHANUMERIC_OPTIONS = [
  { value: 'Identificación y clasificación', label: 'Identificación y clasificación' },
  { value: 'Propiedades técnicas y funcionales', label: 'Propiedades técnicas y funcionales' },
  { value: 'Datos del fabricante y producto', label: 'Datos del fabricante y producto' },
  { value: 'Datos de coste', label: 'Datos de coste' },
  { value: 'Datos de garantía', label: 'Datos de garantía' },
  { value: 'Datos de operación y mantenimiento', label: 'Datos de operación y mantenimiento' },
  { value: 'Datos de sostenibilidad y energía', label: 'Datos de sostenibilidad y energía' },
];

const LOIN_DOCUMENTATION_OPTIONS = [
  { value: 'Fichas técnicas', label: 'Fichas técnicas' },
  { value: 'Certificados y homologaciones', label: 'Certificados y homologaciones' },
  { value: 'Manuales de operación y mantenimiento', label: 'Manuales de operación y mantenimiento' },
  { value: 'Garantías', label: 'Garantías' },
  { value: 'Planos as-built', label: 'Planos as-built' },
  { value: 'Instrucciones de instalación', label: 'Instrucciones de instalación' },
];

export function Block4({ answers, onChange }: Props) {
  const tieneLOIN = answers['AIR-4.1'] === 'Sí';
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 4 — Nivel de información necesario del AIM (LOIN)</h2>
        <p className="text-sm text-gray-500 mt-1">Sus tres componentes según EN 17412-1 (AIR-4.1 a AIR-4.4)</p>
      </div>

      <BooleanField id="AIR-4.1" label="AIR-4.1 ¿Define un LOIN para el AIM? (ISO 19650-1 §11.2 · EN 17412-1)" required answers={answers} onChange={onChange} />

      {tieneLOIN && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4 space-y-5">
          <p className="text-xs text-gray-600">
            El detalle requerido será <strong>el necesario para la gestión del activo, sin exceso</strong>.
          </p>
          <SelectField id="AIR-4.2" label="AIR-4.2 Información geométrica" options={LOIN_GEOMETRIC_OPTIONS} answers={answers} onChange={onChange} />
          <MultiSelectField id="AIR-4.3" label="AIR-4.3 Información alfanumérica" options={LOIN_ALPHANUMERIC_OPTIONS} answers={answers} onChange={onChange} />
          <MultiSelectField id="AIR-4.4" label="AIR-4.4 Documentación asociada" options={LOIN_DOCUMENTATION_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
