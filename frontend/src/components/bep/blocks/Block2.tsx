'use client';

import { TextField, MultiSelectField, BooleanField, TextareaField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const ROLES_OPTIONS = [
  { value: 'Adjudicador', label: 'Adjudicador' },
  { value: 'Adjudicatario principal', label: 'Adjudicatario principal' },
  { value: 'BIM Manager', label: 'BIM Manager' },
  { value: 'BIM Coordinator', label: 'BIM Coordinator' },
  { value: 'Equipo de tareas', label: 'Equipo de tareas (Task Team)' },
  { value: 'Information Manager', label: 'Information Manager' },
];

const DISCIPLINES_OPTIONS = [
  { value: 'Arquitectura', label: 'Arquitectura (ARQ)' },
  { value: 'Estructuras', label: 'Estructuras (EST)' },
  { value: 'Instalaciones MEP', label: 'Instalaciones MEP (climatización, fontanería, saneamiento)' },
  { value: 'Instalaciones eléctricas', label: 'Instalaciones eléctricas y telecomunicaciones' },
  { value: 'Urbanización', label: 'Urbanización / obra civil' },
  { value: 'Mediciones y presupuesto', label: 'Mediciones y presupuesto' },
];

export function Block2({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Gestión del proyecto BIM</h2>
        <p className="text-sm text-gray-500 mt-1">Equipo, roles y responsabilidades (BEP-2.1 a BEP-2.6)</p>
      </div>

      <TextField id="BEP-2.1" label="BEP-2.1 BIM Manager (responsable BIM del adjudicatario)" required answers={answers} onChange={onChange} placeholder="Nombre y apellidos" />

      <TextField id="BEP-2.2" label="BEP-2.2 BIM Coordinator(es)" answers={answers} onChange={onChange} placeholder="Nombre(s) del/los coordinador(es) BIM" />

      <MultiSelectField id="BEP-2.3" label="BEP-2.3 Roles ISO 19650 presentes en el equipo" required options={ROLES_OPTIONS} answers={answers} onChange={onChange} />

      <MultiSelectField id="BEP-2.4" label="BEP-2.4 Disciplinas / equipos de tareas participantes" required options={DISCIPLINES_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="BEP-2.5" label="BEP-2.5 ¿Se ha definido una matriz de responsabilidades?" required answers={answers} onChange={onChange} />

      <TextareaField id="BEP-2.6" label="BEP-2.6 Cuadro de riesgos BIM identificados" answers={answers} onChange={onChange} placeholder="Describe los principales riesgos BIM y sus medidas de mitigación..." />
    </div>
  );
}
