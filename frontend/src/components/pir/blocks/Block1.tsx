'use client';

import { TextField, SelectField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const SECTOR_OPTIONS = [
  { value: 'Edificación', label: 'Edificación' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Rehabilitación', label: 'Rehabilitación' },
  { value: 'Urbanización', label: 'Urbanización' },
];

export function Block1({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 1 — Identificación del proyecto</h2>
        <p className="text-sm text-gray-500 mt-1">Datos generales de la inversión (PIR-1.1 a PIR-1.5)</p>
      </div>

      <TextField id="PIR-1.1" label="PIR-1.1 Nombre del proyecto" required answers={answers} onChange={onChange} />

      <SelectField id="PIR-1.2" label="PIR-1.2 Sector / tipo de proyecto" required options={SECTOR_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="PIR-1.3" label="PIR-1.3 OIR de referencia" answers={answers} onChange={onChange} placeholder="Ej.: OIR v1 de la organización" />

      <TextField id="PIR-1.4" label="PIR-1.4 Responsable por parte del adjudicador" required answers={answers} onChange={onChange} placeholder="Nombre o área responsable" />

      <TextareaField id="PIR-1.5" label="PIR-1.5 Descripción / alcance de la inversión" required answers={answers} onChange={onChange} placeholder="Describe el objeto y alcance de la inversión..." />
    </div>
  );
}
