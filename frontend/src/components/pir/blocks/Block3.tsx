'use client';

import { MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const MILESTONES_OPTIONS = [
  { value: 'Viabilidad', label: 'Estudio de viabilidad' },
  { value: 'Anteproyecto', label: 'Anteproyecto' },
  { value: 'Proyecto básico', label: 'Proyecto básico' },
  { value: 'Proyecto de ejecución', label: 'Proyecto de ejecución' },
  { value: 'Licitación', label: 'Licitación' },
  { value: 'Construcción', label: 'Construcción' },
  { value: 'Entrega', label: 'Entrega / recepción' },
];

const DECISION_INFO_OPTIONS = [
  { value: 'Coste', label: 'Coste / mediciones' },
  { value: 'Energía', label: 'Energía / sostenibilidad' },
  { value: 'Alternativas de diseño', label: 'Alternativas de diseño' },
  { value: 'Planificación 4D', label: 'Planificación 4D' },
  { value: 'Análisis estructural', label: 'Análisis estructural' },
];

export function Block3({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 3 — Hitos y puntos clave de decisión</h2>
        <p className="text-sm text-gray-500 mt-1">Cuándo y con qué información decide el adjudicador (PIR-3.1 a PIR-3.4)</p>
      </div>

      <MultiSelectField id="PIR-3.1" label="PIR-3.1 Hitos de decisión clave del proyecto" required options={MILESTONES_OPTIONS} answers={answers} onChange={onChange} />

      <TextareaField id="PIR-3.2" label="PIR-3.2 Preguntas clave a responder en cada hito" answers={answers} onChange={onChange} placeholder="Ej.: ¿Cumple el presupuesto objetivo? ¿Alcanza el nivel energético?" />

      <BooleanField id="PIR-3.3" label="PIR-3.3 ¿Se requieren modelos para la toma de decisiones?" required answers={answers} onChange={onChange} />

      <MultiSelectField id="PIR-3.4" label="PIR-3.4 Información necesaria para la toma de decisiones" options={DECISION_INFO_OPTIONS} answers={answers} onChange={onChange} />
    </div>
  );
}
