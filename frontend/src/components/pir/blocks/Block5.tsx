'use client';

import { MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const BIM_USES_OPTIONS = [
  { value: 'Modelado de condiciones existentes', label: 'Modelado de condiciones existentes' },
  { value: 'Estimación de costos', label: 'Estimación de costos' },
  { value: 'Coordinación 3D', label: 'Coordinación 3D' },
  { value: 'Análisis energético', label: 'Análisis energético' },
  { value: 'Planificación de fases (4D)', label: 'Planificación de fases (4D)' },
  { value: 'Modelado as-built', label: 'Modelado as-built' },
  { value: 'Gestión de activos', label: 'Gestión de activos' },
];

const FORMATS_OPTIONS = [
  { value: 'IFC', label: 'IFC' },
  { value: 'RVT', label: 'RVT (Revit)' },
  { value: 'DWG', label: 'DWG' },
  { value: 'PDF', label: 'PDF' },
  { value: 'COBie', label: 'COBie' },
];

export function Block5({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Requisitos de gestión y entrega</h2>
        <p className="text-sm text-gray-500 mt-1">Se concretarán en el EIR (PIR-5.1 a PIR-5.5)</p>
      </div>

      <MultiSelectField id="PIR-5.1" label="PIR-5.1 Usos BIM prioritarios para el proyecto" required options={BIM_USES_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="PIR-5.2" label="PIR-5.2 Formatos de intercambio" required options={FORMATS_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="PIR-5.3" label="PIR-5.3 ¿Se prevé un plan de transición a operación (AIR/AIM)?" answers={answers} onChange={onChange} />

      <TextareaField id="PIR-5.4" label="PIR-5.4 Restricciones o condicionantes" answers={answers} onChange={onChange} placeholder="Ej.: condicionantes del solar, normativa específica, plazos críticos..." />

      <TextareaField id="PIR-5.5" label="PIR-5.5 Observaciones" answers={answers} onChange={onChange} placeholder="Notas adicionales o anexos..." />
    </div>
  );
}
