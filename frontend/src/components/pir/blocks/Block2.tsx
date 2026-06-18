'use client';

import { TextField, SelectField, MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const OBJECTIVES_OPTIONS = [
  { value: 'Coste', label: 'Coste / presupuesto' },
  { value: 'Plazo', label: 'Plazo' },
  { value: 'Calidad', label: 'Calidad / prestaciones' },
  { value: 'Sostenibilidad', label: 'Sostenibilidad y energía' },
  { value: 'Funcionalidad', label: 'Funcionalidad / uso' },
  { value: 'Retorno de inversión', label: 'Retorno de la inversión' },
];

const CERTIFICATION_OPTIONS = [
  { value: 'LEED', label: 'LEED' },
  { value: 'BREEAM', label: 'BREEAM' },
  { value: 'VERDE', label: 'VERDE (GBCe)' },
  { value: 'WELL', label: 'WELL' },
  { value: 'Otra', label: 'Otra' },
];

export function Block2({ answers, onChange }: Props) {
  const tieneCert = answers['PIR-2.5'] === 'Sí';
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Objetivos estratégicos de la inversión</h2>
        <p className="text-sm text-gray-500 mt-1">Qué persigue el adjudicador con esta inversión (PIR-2.1 a PIR-2.6)</p>
      </div>

      <MultiSelectField id="PIR-2.1" label="PIR-2.1 Objetivos estratégicos" required options={OBJECTIVES_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="PIR-2.2" label="PIR-2.2 Presupuesto objetivo / restricción de coste" answers={answers} onChange={onChange} placeholder="Ej.: 20 M€" />

      <TextField id="PIR-2.3" label="PIR-2.3 Plazo objetivo" answers={answers} onChange={onChange} placeholder="Ej.: 30 meses" />

      <TextareaField id="PIR-2.4" label="PIR-2.4 Objetivos de sostenibilidad / energía" answers={answers} onChange={onChange} placeholder="Ej.: edificio de consumo casi nulo (nZEB), reducción de emisiones..." />

      <BooleanField id="PIR-2.5" label="PIR-2.5 ¿Se persigue una certificación ambiental?" required answers={answers} onChange={onChange} />

      {tieneCert && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <SelectField id="PIR-2.6" label="PIR-2.6 Certificación objetivo" options={CERTIFICATION_OPTIONS} answers={answers} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
