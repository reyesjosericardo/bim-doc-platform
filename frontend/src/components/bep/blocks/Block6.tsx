'use client';

import { TextField, MultiSelectField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const AUTHORING_OPTIONS = [
  { value: 'Revit', label: 'Autodesk Revit' },
  { value: 'Civil 3D', label: 'Autodesk Civil 3D' },
  { value: 'ArchiCAD', label: 'Graphisoft ArchiCAD' },
  { value: 'Tekla', label: 'Tekla Structures' },
  { value: 'AllPlan', label: 'AllPlan' },
  { value: 'Otro', label: 'Otro' },
];

export function Block6({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 6 — Software y hardware</h2>
        <p className="text-sm text-gray-500 mt-1">Propuesta tecnológica del equipo de desarrollo (BEP-6.1 a BEP-6.5)</p>
      </div>

      <MultiSelectField id="BEP-6.1" label="BEP-6.1 Software de autoría BIM" required options={AUTHORING_OPTIONS} answers={answers} onChange={onChange} />

      <TextField id="BEP-6.2" label="BEP-6.2 Software de coordinación / federación" required answers={answers} onChange={onChange} placeholder="Ej.: Navisworks, Solibri, BIMcollab..." />

      <TextareaField id="BEP-6.3" label="BEP-6.3 Versiones de software comprometidas" answers={answers} onChange={onChange} placeholder="Ej.: Revit 2024, Navisworks 2024, IFC 4..." />

      <TextareaField id="BEP-6.4" label="BEP-6.4 Recursos de hardware / infraestructura" answers={answers} onChange={onChange} placeholder="Describe las estaciones de trabajo, servidores y conectividad disponibles..." />

      <TextareaField id="BEP-6.5" label="BEP-6.5 Observaciones y anexos" answers={answers} onChange={onChange} placeholder="Notas adicionales, anexos o documentación complementaria..." />
    </div>
  );
}
