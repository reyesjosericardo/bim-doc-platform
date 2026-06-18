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

// LOIN — EN 17412-1: información geométrica (escala descriptiva, orientada al propósito)
const LOIN_GEOMETRIC_OPTIONS = [
  { value: 'simbolico',   label: 'Simbólica / 2D (sin geometría 3D significativa)' },
  { value: 'conceptual',  label: 'Conceptual (masa o volumen aproximado)' },
  { value: 'generico',    label: 'Genérica (forma y dimensiones esquemáticas)' },
  { value: 'especifico',  label: 'Específica (geometría y dimensiones definidas)' },
  { value: 'fabricacion', label: 'Detallada para fabricación y montaje' },
  { value: 'construido',  label: 'Tal como construido (as-built verificado)' },
];

// LOIN — EN 17412-1: información alfanumérica (datos/atributos)
const LOIN_ALPHANUMERIC_OPTIONS = [
  { value: 'Identificación y clasificación', label: 'Identificación y clasificación' },
  { value: 'Propiedades técnicas y funcionales', label: 'Propiedades técnicas y funcionales' },
  { value: 'Datos del fabricante y producto', label: 'Datos del fabricante y producto' },
  { value: 'Datos de coste', label: 'Datos de coste' },
  { value: 'Datos de garantía', label: 'Datos de garantía' },
  { value: 'Datos de operación y mantenimiento', label: 'Datos de operación y mantenimiento' },
  { value: 'Datos de sostenibilidad y energía', label: 'Datos de sostenibilidad y energía' },
];

// LOIN — EN 17412-1: documentación asociada
const LOIN_DOCUMENTATION_OPTIONS = [
  { value: 'Fichas técnicas', label: 'Fichas técnicas' },
  { value: 'Certificados y homologaciones', label: 'Certificados y homologaciones' },
  { value: 'Manuales de operación y mantenimiento', label: 'Manuales de operación y mantenimiento' },
  { value: 'Garantías', label: 'Garantías' },
  { value: 'Planos as-built', label: 'Planos as-built' },
  { value: 'Instrucciones de instalación', label: 'Instrucciones de instalación' },
];

export function Block4({ answers, onChange }: Props) {
  const usaCDE = answers['OIR-4.3'] === 'Sí';
  const tieneLOIN = answers['OIR-4.5'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 4 — Estándares y formatos</h2>
        <p className="text-sm text-gray-500 mt-1">Interoperabilidad, herramientas y LOIN (OIR-4.1 a OIR-4.8)</p>
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
        label="OIR-4.3 ¿Usa o planea usar un entorno común de datos (CDE)?"
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
        label="OIR-4.5 ¿Define la organización un nivel de información necesario (LOIN) para sus activos? (ISO 19650-1 §11.2 · EN 17412-1)"
        required
        answers={answers}
        onChange={onChange}
      />

      {tieneLOIN && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4 space-y-5">
          <p className="text-xs text-gray-600">
            El LOIN se define por sus tres componentes (EN 17412-1). El detalle debe ser
            <strong> el necesario para el propósito, sin exceso</strong>.
          </p>

          <SelectField
            id="OIR-4.6"
            label="OIR-4.6 Información geométrica requerida"
            options={LOIN_GEOMETRIC_OPTIONS}
            answers={answers}
            onChange={onChange}
          />

          <MultiSelectField
            id="OIR-4.7"
            label="OIR-4.7 Información alfanumérica requerida"
            options={LOIN_ALPHANUMERIC_OPTIONS}
            answers={answers}
            onChange={onChange}
          />

          <MultiSelectField
            id="OIR-4.8"
            label="OIR-4.8 Documentación asociada requerida"
            options={LOIN_DOCUMENTATION_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
