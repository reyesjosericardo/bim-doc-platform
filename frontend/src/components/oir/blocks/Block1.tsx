'use client';

import { TextField, SelectField, MultiSelectField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

const TIPO_OPTIONS = [
  { value: 'Promotor', label: 'Promotor' },
  { value: 'Propietario de activo', label: 'Propietario de activo' },
  { value: 'Operador', label: 'Operador' },
  { value: 'Cliente público', label: 'Cliente público' },
  { value: 'Cliente privado', label: 'Cliente privado' },
];

const SECTOR_OPTIONS = [
  { value: 'Edificación', label: 'Edificación' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Mixto', label: 'Mixto' },
];

const ESTANDARES_OPTIONS = [
  { value: 'ISO 19650', label: 'ISO 19650' },
  { value: 'BIM Level 2', label: 'BIM Level 2' },
  { value: 'VDI 2552', label: 'VDI 2552' },
  { value: 'NF BIM', label: 'NF BIM' },
  { value: 'Estándar propio', label: 'Estándar propio' },
  { value: 'Ninguno', label: 'Ninguno' },
];

export function Block1({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 1 — Identificación</h2>
        <p className="text-sm text-gray-500 mt-1">Información básica sobre la organización (OIR-1.1 a OIR-1.6)</p>
      </div>

      <TextField
        id="OIR-1.1"
        label="OIR-1.1 Nombre oficial de la organización"
        required
        answers={answers}
        onChange={onChange}
      />

      <SelectField
        id="OIR-1.2"
        label="OIR-1.2 Tipo de organización"
        required
        options={TIPO_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <SelectField
        id="OIR-1.3"
        label="OIR-1.3 Sector principal"
        required
        options={SECTOR_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <TextField
        id="OIR-1.4"
        label="OIR-1.4 País y región de operación"
        required
        answers={answers}
        onChange={onChange}
      />

      <MultiSelectField
        id="OIR-1.5"
        label="OIR-1.5 Estándares BIM reconocidos"
        required
        options={ESTANDARES_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <TextField
        id="OIR-1.6"
        label="OIR-1.6 Responsable de gestión de información"
        required
        answers={answers}
        onChange={onChange}
      />
    </div>
  );
}
