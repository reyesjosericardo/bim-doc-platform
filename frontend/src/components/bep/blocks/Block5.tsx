'use client';

import { TextField, MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const CDE_STATES_OPTIONS = [
  { value: 'WIP', label: 'Trabajo en curso (WIP)' },
  { value: 'Compartido', label: 'Compartido (Shared)' },
  { value: 'Publicado', label: 'Publicado (Published)' },
  { value: 'Archivado', label: 'Archivado (Archived)' },
];

export function Block5({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 5 — Entorno común de datos (CDE)</h2>
        <p className="text-sm text-gray-500 mt-1">Plataforma, estados y gobernanza de la información (BEP-5.1 a BEP-5.5)</p>
      </div>

      <TextField id="BEP-5.1" label="BEP-5.1 Plataforma CDE utilizada" required answers={answers} onChange={onChange} placeholder="Ej.: Autodesk Construction Cloud, Trimble Connect, BIMcollab..." />

      <MultiSelectField id="BEP-5.2" label="BEP-5.2 Estados del CDE implementados" required options={CDE_STATES_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="BEP-5.3" label="BEP-5.3 ¿Se aplicará la estructura de carpetas ISO 19650?" required answers={answers} onChange={onChange} />

      <TextareaField id="BEP-5.4" label="BEP-5.4 Procedimiento de aprobación / transición de estados" answers={answers} onChange={onChange} placeholder="Describe cómo se aprueba y promueve la información entre estados (WIP → Compartido → Publicado)..." />

      <TextareaField id="BEP-5.5" label="BEP-5.5 Política de seguridad y permisos de acceso" answers={answers} onChange={onChange} placeholder="Describe los permisos por rol/disciplina y la política de seguridad de la información..." />
    </div>
  );
}
