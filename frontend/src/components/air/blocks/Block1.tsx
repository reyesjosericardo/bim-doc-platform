'use client';

import { TextField, SelectField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const ASSET_TYPE_OPTIONS = [
  { value: 'edificio', label: 'Edificio' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'portafolio', label: 'Portafolio / cartera de activos' },
];

const LIFECYCLE_OPTIONS = [
  { value: 'Operación y mantenimiento', label: 'Operación y mantenimiento' },
  { value: 'Renovación', label: 'Renovación / reforma' },
  { value: 'Ampliación', label: 'Ampliación' },
  { value: 'Fin de vida', label: 'Fin de vida útil' },
];

export function Block1({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 1 — Identificación del activo</h2>
        <p className="text-sm text-gray-500 mt-1">Datos generales del activo objeto del AIR (AIR-1.1 a AIR-1.5)</p>
      </div>

      <TextField id="AIR-1.1" label="AIR-1.1 Nombre del activo / cartera" required answers={answers} onChange={onChange} />

      <SelectField id="AIR-1.2" label="AIR-1.2 Tipo de activo" required options={ASSET_TYPE_OPTIONS} answers={answers} onChange={onChange} />

      <SelectField id="AIR-1.3" label="AIR-1.3 Fase de ciclo de vida objetivo" options={LIFECYCLE_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="AIR-1.4" label="AIR-1.4 OIR de referencia" answers={answers} onChange={onChange} placeholder="Ej.: OIR v1 de la organización" />

      <TextField id="AIR-1.5" label="AIR-1.5 Facility Manager / responsable del activo" required answers={answers} onChange={onChange} placeholder="Nombre y apellidos" />
    </div>
  );
}
