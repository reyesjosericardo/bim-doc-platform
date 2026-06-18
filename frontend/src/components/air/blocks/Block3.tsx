'use client';

import { TextField, MultiSelectField, BooleanField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const AIM_CONTENTS_OPTIONS = [
  { value: 'Fichas técnicas', label: 'Fichas técnicas' },
  { value: 'Manuales O&M', label: 'Manuales de operación y mantenimiento' },
  { value: 'Garantías', label: 'Garantías' },
  { value: 'Certificados', label: 'Certificados y homologaciones' },
  { value: 'Vida útil de componentes', label: 'Vida útil de componentes' },
  { value: 'Costos de reemplazo', label: 'Costos de reemplazo' },
  { value: 'Datos de fabricante', label: 'Datos de fabricante y producto' },
];

export function Block3({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 3 — Contenidos del AIM</h2>
        <p className="text-sm text-gray-500 mt-1">Información que debe contener el modelo del activo (AIR-3.1 a AIR-3.5)</p>
      </div>

      <MultiSelectField id="AIR-3.1" label="AIR-3.1 Información a incluir en el AIM" required options={AIM_CONTENTS_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="AIR-3.2" label="AIR-3.2 Nomenclatura de espacios" answers={answers} onChange={onChange} placeholder="Ej.: código planta-zona-uso" />

      <TextField id="AIR-3.3" label="AIR-3.3 Nomenclatura de sistemas / MEP" answers={answers} onChange={onChange} placeholder="Ej.: por sistema y disciplina" />

      <BooleanField id="AIR-3.4" label="AIR-3.4 ¿Se requiere plan de puesta en marcha (commissioning)?" answers={answers} onChange={onChange} />

      <BooleanField id="AIR-3.5" label="AIR-3.5 ¿Se requieren costos de reemplazo de componentes?" answers={answers} onChange={onChange} />
    </div>
  );
}
