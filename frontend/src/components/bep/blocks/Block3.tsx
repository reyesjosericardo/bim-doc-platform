'use client';

import { TextareaField, MultiSelectField, BooleanField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const FEDERATED_OPTIONS = [
  { value: 'ARQ', label: 'Arquitectura (ARQ)' },
  { value: 'EST', label: 'Estructuras (EST)' },
  { value: 'MEP', label: 'Instalaciones (MEP)' },
  { value: 'URB', label: 'Urbanización / emplazamiento' },
  { value: 'Por edificios/zonas', label: 'Subdivisión por edificios / zonas' },
  { value: 'Por plantas tipo', label: 'Subdivisión por plantas tipo' },
];

const MILESTONES_OPTIONS = [
  { value: 'Anteproyecto', label: 'Anteproyecto' },
  { value: 'Proyecto Básico', label: 'Proyecto Básico' },
  { value: 'Proyecto de Ejecución', label: 'Proyecto de Ejecución' },
  { value: 'Construcción', label: 'Construcción' },
  { value: 'As Built', label: 'As Built' },
  { value: 'Entrega para O&M', label: 'Entrega para O&M' },
];

const DELIVERABLES_OPTIONS = [
  { value: 'Modelos', label: 'Modelos de información (PIM)' },
  { value: 'Planos', label: 'Planos' },
  { value: 'Mediciones', label: 'Mediciones y presupuesto' },
  { value: 'Memorias', label: 'Memorias técnicas' },
  { value: 'Informes de coordinación', label: 'Informes de coordinación / clash' },
  { value: 'COBie', label: 'Datos COBie' },
];

export function Block3({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 3 — Planificación y documentación</h2>
        <p className="text-sm text-gray-500 mt-1">Federación, hitos y planes de entrega (BEP-3.1 a BEP-3.6)</p>
      </div>

      <TextareaField id="BEP-3.1" label="BEP-3.1 Estrategia de federación del modelo" required answers={answers} onChange={onChange} placeholder="Describe cómo se federará el modelo de información del proyecto (PIM): modelo central, vínculos, etc." />

      <MultiSelectField id="BEP-3.2" label="BEP-3.2 Estructura del modelo federado" required options={FEDERATED_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="BEP-3.3" label="BEP-3.3 Hitos de entrega de información" required options={MILESTONES_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="BEP-3.4" label="BEP-3.4 Entregables comprometidos" required options={DELIVERABLES_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="BEP-3.5" label="BEP-3.5 ¿Se elaborará el MIDP (Master Information Delivery Plan)?" required answers={answers} onChange={onChange} />

      <BooleanField id="BEP-3.6" label="BEP-3.6 ¿Se elaborarán TIDP (Task Information Delivery Plan) por equipo?" required answers={answers} onChange={onChange} />
    </div>
  );
}
