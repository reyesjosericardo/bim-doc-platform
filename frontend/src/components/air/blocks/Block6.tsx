'use client';

import { TextField, SelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const UPDATE_FREQ_OPTIONS = [
  { value: 'Continua', label: 'Continua (en tiempo real)' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Trimestral', label: 'Trimestral' },
  { value: 'Semestral', label: 'Semestral' },
  { value: 'Anual', label: 'Anual' },
  { value: 'Por evento', label: 'Por evento desencadenante' },
];

const RETENTION_OPTIONS = [
  { value: 'Durante la operación', label: 'Durante la operación' },
  { value: '5 años', label: '5 años' },
  { value: '10 años', label: '10 años' },
  { value: 'Vida útil del activo', label: 'Vida útil del activo' },
  { value: 'Sin definir', label: 'Sin definir' },
];

export function Block6({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 6 — Gobernanza del activo</h2>
        <p className="text-sm text-gray-500 mt-1">Plataforma, actualización y retención del AIM (AIR-6.1 a AIR-6.5)</p>
      </div>

      <TextField id="AIR-6.1" label="AIR-6.1 Plataforma de gestión del AIM / CDE" required answers={answers} onChange={onChange} placeholder="Ej.: plataforma CDE/FM utilizada" />

      <SelectField id="AIR-6.2" label="AIR-6.2 Frecuencia de actualización del AIM" required options={UPDATE_FREQ_OPTIONS} answers={answers} onChange={onChange} />

      <SelectField id="AIR-6.3" label="AIR-6.3 Política de retención de información" required options={RETENTION_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="AIR-6.4" label="AIR-6.4 ¿Existen restricciones de seguridad de la información?" answers={answers} onChange={onChange} />

      <TextareaField id="AIR-6.5" label="AIR-6.5 Observaciones" answers={answers} onChange={onChange} placeholder="Notas adicionales o anexos..." />
    </div>
  );
}
