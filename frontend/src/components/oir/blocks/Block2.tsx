'use client';

import { TextField, SelectField, MultiSelectField, BooleanField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

const USOS_BIM_OPTIONS = [
  { value: 'Gestión de activos', label: 'Gestión de activos' },
  { value: 'Análisis costos ciclo de vida', label: 'Análisis costos ciclo de vida' },
  { value: 'Planificación de cartera', label: 'Planificación de cartera' },
  { value: 'Cumplimiento regulatorio', label: 'Cumplimiento regulatorio' },
  { value: 'Gestión de riesgos', label: 'Gestión de riesgos' },
  { value: 'Desarrollo de políticas', label: 'Desarrollo de políticas' },
  { value: 'Seguridad y vigilancia', label: 'Seguridad y vigilancia' },
  { value: 'Gestión energética', label: 'Gestión energética' },
];

const NORMA_PLAN_OPTIONS = [
  { value: 'ISO 55000', label: 'ISO 55000' },
  { value: 'PAS 55', label: 'PAS 55' },
  { value: 'Propio', label: 'Propio' },
  { value: 'Otro', label: 'Otro' },
];

export function Block2({ answers, onChange }: Props) {
  const tienePlanActivos = answers['OIR-2.3'] === 'Sí';
  const tieneObligaciones = answers['OIR-2.5'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Objetivos estratégicos</h2>
        <p className="text-sm text-gray-500 mt-1">Usos BIM y alineación estratégica (OIR-2.1 a OIR-2.6)</p>
      </div>

      <MultiSelectField
        id="OIR-2.1"
        label="OIR-2.1 Usos BIM requeridos"
        required
        options={USOS_BIM_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

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
