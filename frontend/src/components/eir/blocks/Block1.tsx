'use client';

import { TextField, SelectField, MultiSelectField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const SECTOR_OPTIONS = [
  { value: 'Edificación', label: 'Edificación' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Rehabilitación', label: 'Rehabilitación' },
  { value: 'Urbanización', label: 'Urbanización' },
];

const FASES_OPTIONS = [
  { value: 'Anteproyecto', label: 'Anteproyecto' },
  { value: 'Proyecto Básico', label: 'Proyecto Básico' },
  { value: 'Proyecto de Ejecución', label: 'Proyecto de Ejecución' },
  { value: 'Construcción', label: 'Construcción' },
  { value: 'As Built', label: 'As Built' },
  { value: 'Operación y mantenimiento', label: 'Operación y mantenimiento (O&M)' },
];

export function Block1({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 1 — Identificación del proyecto</h2>
        <p className="text-sm text-gray-500 mt-1">Datos generales del proyecto objeto del EIR (EIR-1.1 a EIR-1.5)</p>
      </div>

      <TextField id="EIR-1.1" label="EIR-1.1 Nombre del proyecto" required answers={answers} onChange={onChange} />

      <TextareaField id="EIR-1.2" label="EIR-1.2 Descripción / alcance del proyecto" required answers={answers} onChange={onChange} placeholder="Describe el objeto del proyecto, su alcance y principales características..." />

      <SelectField id="EIR-1.3" label="EIR-1.3 Sector de actividad" required options={SECTOR_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="EIR-1.4" label="EIR-1.4 Fases del proyecto cubiertas por este EIR" required options={FASES_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="EIR-1.5" label="EIR-1.5 BIM Manager del adjudicador (nombre del responsable)" required answers={answers} onChange={onChange} placeholder="Nombre y apellidos del BIM Manager" />
    </div>
  );
}
