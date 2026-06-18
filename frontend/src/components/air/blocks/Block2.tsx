'use client';

import { TextField, SelectField, MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const MGMT_OBJECTIVES_OPTIONS = [
  { value: 'Mantenimiento', label: 'Mantenimiento (preventivo y correctivo)' },
  { value: 'Eficiencia energética', label: 'Eficiencia energética' },
  { value: 'Gestión de espacios', label: 'Gestión de espacios' },
  { value: 'Cumplimiento normativo', label: 'Cumplimiento normativo' },
  { value: 'Optimización de costes', label: 'Optimización de costes operativos' },
  { value: 'Sostenibilidad', label: 'Sostenibilidad y emisiones' },
];

const AM_STANDARD_OPTIONS = [
  { value: 'ISO 55000', label: 'ISO 55000' },
  { value: 'PAS 55', label: 'PAS 55' },
  { value: 'Propio', label: 'Estándar propio' },
  { value: 'Otro', label: 'Otro / por definir' },
];

export function Block2({ answers, onChange }: Props) {
  const tieneCafm = answers['AIR-2.3'] === 'Sí';
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Requisitos del gestor del activo</h2>
        <p className="text-sm text-gray-500 mt-1">Objetivos de gestión y sistemas FM (AIR-2.1 a AIR-2.5)</p>
      </div>

      <MultiSelectField id="AIR-2.1" label="AIR-2.1 Objetivos de gestión del activo" required options={MGMT_OBJECTIVES_OPTIONS} answers={answers} onChange={onChange} />

      <SelectField id="AIR-2.2" label="AIR-2.2 Estándar de gestión de activos" options={AM_STANDARD_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="AIR-2.3" label="AIR-2.3 ¿Se integrará la información con un sistema CAFM/CMMS?" required answers={answers} onChange={onChange} />

      {tieneCafm && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <TextField id="AIR-2.4" label="AIR-2.4 Sistema CAFM/CMMS" answers={answers} onChange={onChange} placeholder="Ej.: Archibus, IBM Maximo, Planon..." />
        </div>
      )}

      <TextareaField id="AIR-2.5" label="AIR-2.5 Parámetros CAFM/CMMS requeridos" answers={answers} onChange={onChange} placeholder="Describe los parámetros que deben acompañar a cada activo (identificación, ubicación, fabricante, etc.)..." />
    </div>
  );
}
