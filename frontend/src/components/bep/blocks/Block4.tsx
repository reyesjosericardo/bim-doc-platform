'use client';

import { SelectField, MultiSelectField, BooleanField } from '../../oir/FormField';
import type { AnswersMap } from '@/types/oir';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

const NAMING_OPTIONS = [
  { value: 'ISO 19650', label: 'ISO 19650 (estándar de nomenclatura)' },
  { value: 'ISO 19650 + código propio', label: 'ISO 19650 con código de proyecto propio' },
  { value: 'BS 1192', label: 'BS 1192' },
  { value: 'Propio del adjudicador', label: 'Sistema propio del adjudicador' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'GuBIMclass', label: 'GuBIMclass' },
  { value: 'Uniclass 2015', label: 'Uniclass 2015' },
  { value: 'Omniclass', label: 'Omniclass' },
  { value: 'Uniformat', label: 'Uniformat' },
  { value: 'Otro', label: 'Otro / por definir' },
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

const FORMATS_OPTIONS = [
  { value: 'IFC', label: 'IFC' },
  { value: 'RVT', label: 'RVT (Revit)' },
  { value: 'NWD/NWC', label: 'NWD / NWC (Navisworks)' },
  { value: 'DWG', label: 'DWG' },
  { value: 'PDF', label: 'PDF' },
  { value: 'BCF', label: 'BCF (comentarios de coordinación)' },
  { value: 'COBie', label: 'COBie' },
];

const CLASH_FREQ_OPTIONS = [
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Quincenal', label: 'Quincenal' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Por hito', label: 'Por hito de entrega (50% / 70% / 90% modelado)' },
];

export function Block4({ answers, onChange }: Props) {
  const showClashFreq = answers['BEP-4.7'] === 'Sí';
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 4 — Estándares y procedimientos</h2>
        <p className="text-sm text-gray-500 mt-1">Nomenclatura, LOIN y coordinación (BEP-4.1 a BEP-4.9)</p>
      </div>

      <SelectField id="BEP-4.1" label="BEP-4.1 Sistema de nomenclatura" required options={NAMING_OPTIONS} answers={answers} onChange={onChange} />

      <SelectField id="BEP-4.2" label="BEP-4.2 Sistema de clasificación" required options={CLASSIFICATION_OPTIONS} answers={answers} onChange={onChange} />

      <div className="rounded-lg border border-gray-200 p-4 space-y-5">
        <p className="text-xs text-gray-600">
          <strong>Nivel de información necesario (LOIN)</strong> — sus tres componentes según EN 17412-1.
          El detalle será <strong>el necesario para el propósito, sin exceso</strong>.
        </p>

        <SelectField id="BEP-4.3" label="BEP-4.3 Información geométrica" required options={LOIN_GEOMETRIC_OPTIONS} answers={answers} onChange={onChange} />

        <MultiSelectField id="BEP-4.4" label="BEP-4.4 Información alfanumérica" required options={LOIN_ALPHANUMERIC_OPTIONS} answers={answers} onChange={onChange} />

        <MultiSelectField id="BEP-4.5" label="BEP-4.5 Documentación asociada" required options={LOIN_DOCUMENTATION_OPTIONS} answers={answers} onChange={onChange} />
      </div>

      <MultiSelectField id="BEP-4.6" label="BEP-4.6 Formatos de intercambio" required options={FORMATS_OPTIONS} answers={answers} onChange={onChange} />

      <BooleanField id="BEP-4.7" label="BEP-4.7 ¿Se ejecutará detección de conflictos (clash detection)?" required answers={answers} onChange={onChange} />

      {showClashFreq && (
        <SelectField id="BEP-4.8" label="BEP-4.8 Frecuencia / hitos de clash detection" options={CLASH_FREQ_OPTIONS} answers={answers} onChange={onChange} />
      )}

      <BooleanField id="BEP-4.9" label="BEP-4.9 ¿Se entregarán datos COBie para O&M?" answers={answers} onChange={onChange} />
    </div>
  );
}
