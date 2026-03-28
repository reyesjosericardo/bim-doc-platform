'use client';

import { SelectField, MultiSelectField, BooleanField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface NivelOption { value: string; label: string; description: string }

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

const NIVEL_INFO_OPTIONS: NivelOption[] = [
  { value: 'nivel_1', label: 'Nivel 1 — Representación conceptual',   description: 'Masa, volumen aproximado, ubicación genérica' },
  { value: 'nivel_2', label: 'Nivel 2 — Representación genérica',     description: 'Geometría esquemática, sistemas definidos, clasificación básica' },
  { value: 'nivel_3', label: 'Nivel 3 — Representación específica',   description: 'Geometría definida, especificaciones técnicas, datos de producto' },
  { value: 'nivel_4', label: 'Nivel 4 — Representación detallada',    description: 'Geometría de fabricación y ensamblaje, datos completos de instalación' },
  { value: 'nivel_5', label: 'Nivel 5 — Representación construida (as-built)', description: 'Condición real verificada del activo, datos operativos completos' },
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
        label="OIR-4.5 ¿Tiene la organización definido un nivel de información necesario para sus activos según ISO 19650-1 §11.2?"
        required
        answers={answers}
        onChange={onChange}
      />

      {tieneLOD && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <label className="label">
            OIR-4.6 ¿Qué nivel de información necesario (geométrico y alfanumérico) requiere la organización como mínimo?
          </label>
          <div className="space-y-2 mt-2">
            {NIVEL_INFO_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 cursor-pointer group p-2 rounded hover:bg-blue-50"
              >
                <input
                  type="radio"
                  name="OIR-4.6"
                  value={opt.value}
                  checked={answers['OIR-4.6'] === opt.value}
                  onChange={() => onChange('OIR-4.6', opt.value)}
                  className="h-4 w-4 mt-0.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
