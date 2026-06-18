'use client';

import { SelectField, MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const AIM_FORMATS_OPTIONS = [
  { value: 'IFC', label: 'IFC' },
  { value: 'COBie', label: 'COBie' },
  { value: 'PDF', label: 'PDF' },
  { value: 'RVT', label: 'RVT (Revit)' },
  { value: 'DWG', label: 'DWG' },
  { value: 'XLSX', label: 'XLSX (hojas de datos)' },
];

const HANDOVER_TIMING_OPTIONS = [
  { value: 'A la entrega del proyecto', label: 'A la entrega del proyecto' },
  { value: 'Por hitos de entrega', label: 'Por hitos de entrega' },
  { value: 'Progresivo durante la obra', label: 'Progresivo durante la obra' },
  { value: 'Tras la puesta en marcha', label: 'Tras la puesta en marcha' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'GuBIMclass', label: 'GuBIMclass' },
  { value: 'Uniclass 2015', label: 'Uniclass 2015' },
  { value: 'Omniclass', label: 'Omniclass' },
  { value: 'Uniformat', label: 'Uniformat' },
  { value: 'Otro', label: 'Otro / por definir' },
];

export function Block5({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Formatos y traspaso PIM → AIM</h2>
        <p className="text-sm text-gray-500 mt-1">Entrega e incorporación al modelo del activo (AIR-5.1 a AIR-5.5)</p>
      </div>

      <MultiSelectField id="AIR-5.1" label="AIR-5.1 Formatos de entrega del AIM" required options={AIM_FORMATS_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="AIR-5.2" label="AIR-5.2 ¿Se requieren datos COBie?" answers={answers} onChange={onChange} />

      <SelectField id="AIR-5.3" label="AIR-5.3 Momento de traspaso PIM → AIM" required options={HANDOVER_TIMING_OPTIONS} answers={answers} onChange={onChange} />

      <TextareaField id="AIR-5.4" label="AIR-5.4 Procedimiento de traspaso" answers={answers} onChange={onChange} placeholder="Describe cómo se valida y acepta la información antes de incorporarla al AIM..." />

      <SelectField id="AIR-5.5" label="AIR-5.5 Sistema de clasificación" required options={CLASSIFICATION_OPTIONS} answers={answers} onChange={onChange} />
    </div>
  );
}
