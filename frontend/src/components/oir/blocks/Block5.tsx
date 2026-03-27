'use client';

import { SelectField, MultiSelectField, BooleanField, TextField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

const FRECUENCIA_OPTIONS = [
  { value: 'Por hito', label: 'Por hito' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Trimestral', label: 'Trimestral' },
  { value: 'Semestral', label: 'Semestral' },
  { value: 'Anual', label: 'Anual' },
  { value: 'Por evento desencadenante', label: 'Por evento desencadenante' },
];

const RESTRICCIONES_OPTIONS = [
  { value: 'Información clasificada', label: 'Información clasificada' },
  { value: 'Acceso restringido por disciplina', label: 'Acceso restringido por disciplina' },
  { value: 'Restricción distribución externa', label: 'Restricción distribución externa' },
  { value: 'Infraestructura crítica', label: 'Infraestructura crítica' },
];

const RETENCION_OPTIONS = [
  { value: 'Durante el proyecto', label: 'Durante el proyecto' },
  { value: '5 años post-entrega', label: '5 años post-entrega' },
  { value: '10 años', label: '10 años' },
  { value: 'Vida útil del activo', label: 'Vida útil del activo' },
  { value: 'Sin definir', label: 'Sin definir' },
];

export function Block5({ answers, onChange }: Props) {
  const tieneRestricciones = answers['OIR-5.2'] === 'Sí';
  const incluirObservaciones = answers['OIR-5.5'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Gobernanza</h2>
        <p className="text-sm text-gray-500 mt-1">Políticas de actualización, seguridad y retención (OIR-5.1 a OIR-5.6)</p>
      </div>

      <SelectField
        id="OIR-5.1"
        label="OIR-5.1 Frecuencia de actualización del modelo"
        required
        options={FRECUENCIA_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <BooleanField
        id="OIR-5.2"
        label="OIR-5.2 ¿Existen restricciones de seguridad de la información?"
        required
        answers={answers}
        onChange={onChange}
      />

      {tieneRestricciones && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <MultiSelectField
            id="OIR-5.3"
            label="OIR-5.3 Tipos de restricciones"
            options={RESTRICCIONES_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}

      <SelectField
        id="OIR-5.4"
        label="OIR-5.4 Política de retención de información"
        required
        options={RETENCION_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <BooleanField
        id="OIR-5.5"
        label="OIR-5.5 ¿Incluir apartado de observaciones adicionales?"
        answers={answers}
        onChange={onChange}
      />

      {incluirObservaciones && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <TextField
            id="OIR-5.6"
            label="OIR-5.6 Observaciones adicionales"
            type="textarea"
            maxLength={800}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
