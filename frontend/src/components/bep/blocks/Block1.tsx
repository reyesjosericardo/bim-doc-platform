'use client';

import { TextField, SelectField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const PHASE_OPTIONS = [
  { value: 'precontractual', label: 'Precontractual (PRE-BEP) — fase de licitación' },
  { value: 'contractual', label: 'Contractual — tras adjudicación' },
];

export function Block1({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 1 — Identificación del BEP</h2>
        <p className="text-sm text-gray-500 mt-1">Datos generales del Plan de Ejecución BIM (BEP-1.1 a BEP-1.5)</p>
      </div>

      <TextField id="BEP-1.1" label="BEP-1.1 Nombre del proyecto" required answers={answers} onChange={onChange} />

      <TextField id="BEP-1.2" label="BEP-1.2 Adjudicatario principal / empresa redactora" required answers={answers} onChange={onChange} placeholder="Nombre de la empresa que redacta el BEP" />

      <SelectField id="BEP-1.3" label="BEP-1.3 Fase del BEP" required options={PHASE_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="BEP-1.4" label="BEP-1.4 EIR / documento de referencia" answers={answers} onChange={onChange} placeholder="Ej.: EIR v2 del adjudicador" />

      <TextareaField id="BEP-1.5" label="BEP-1.5 Objetivos BIM del proyecto" required answers={answers} onChange={onChange} placeholder="Describe los objetivos BIM que persigue el equipo de desarrollo en este proyecto..." />
    </div>
  );
}
