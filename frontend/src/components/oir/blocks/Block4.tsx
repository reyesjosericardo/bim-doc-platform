'use client';

import { SelectField, MultiSelectField, BooleanField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

const FORMATOS_OPTIONS = [
  { value: 'IFC', label: 'IFC' },
  { value: 'COBie', label: 'COBie' },
  { value: 'DWG', label: 'DWG' },
  { value: 'RVT', label: 'RVT' },
  { value: 'NWD', label: 'NWD' },
  { value: 'PDF', label: 'PDF' },
  { value: 'Propietario propio', label: 'Propietario propio' },
];

const CLASIFICACION_OPTIONS = [
  { value: 'UniClass 2015', label: 'UniClass 2015' },
  { value: 'OmniClass', label: 'OmniClass' },
  { value: 'MasterFormat', label: 'MasterFormat' },
  { value: 'Sistema propio', label: 'Sistema propio' },
  { value: 'Sin definir', label: 'Sin definir' },
];

const CDE_OPTIONS = [
  { value: 'Sí', label: 'Sí' },
  { value: 'No', label: 'No' },
  { value: 'En evaluación', label: 'En evaluación' },
];

const PLATAFORMA_CDE_OPTIONS = [
  { value: 'ACC', label: 'ACC (Autodesk Construction Cloud)' },
  { value: 'BIM 360', label: 'BIM 360' },
  { value: 'Trimble Connect', label: 'Trimble Connect' },
  { value: 'Aconex', label: 'Aconex' },
  { value: 'Procore', label: 'Procore' },
  { value: 'SharePoint', label: 'SharePoint' },
  { value: 'Otra', label: 'Otra' },
];

const LOD_OPTIONS = [
  { value: 'LOG 1 conceptual', label: 'LOG 1 — Conceptual' },
  { value: 'LOG 2 esquemático', label: 'LOG 2 — Esquemático' },
  { value: 'LOG 3 definido', label: 'LOG 3 — Definido' },
  { value: 'LOG 4 detallado', label: 'LOG 4 — Detallado' },
  { value: 'LOG 5 construido', label: 'LOG 5 — Construido (As-built)' },
];

export function Block4({ answers, onChange }: Props) {
  const usaCDE = answers['OIR-4.3'] === 'Sí';
  const tieneLOD = answers['OIR-4.5'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 4 — Estándares y formatos</h2>
        <p className="text-sm text-gray-500 mt-1">Interoperabilidad y herramientas (OIR-4.1 a OIR-4.6)</p>
      </div>

      <MultiSelectField
        id="OIR-4.1"
        label="OIR-4.1 Formatos de intercambio aceptados"
        required
        options={FORMATOS_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <SelectField
        id="OIR-4.2"
        label="OIR-4.2 Sistema de clasificación"
        required
        options={CLASIFICACION_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <SelectField
        id="OIR-4.3"
        label="OIR-4.3 ¿Usa o planea usar CDE (Common Data Environment)?"
        required
        options={CDE_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      {usaCDE && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <SelectField
            id="OIR-4.4"
            label="OIR-4.4 Plataforma CDE actual"
            options={PLATAFORMA_CDE_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}

      <BooleanField
        id="OIR-4.5"
        label="OIR-4.5 ¿Tiene definido LOD/LOI para sus activos?"
        required
        answers={answers}
        onChange={onChange}
      />

      {tieneLOD && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <SelectField
            id="OIR-4.6"
            label="OIR-4.6 Nivel de información geométrica mínimo"
            options={LOD_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
