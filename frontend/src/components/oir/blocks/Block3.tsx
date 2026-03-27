'use client';

import { MultiSelectField, BooleanField } from '../FormField';
import type { AnswersMap } from '@/types/oir';

interface Props {
  answers: AnswersMap;
  onChange: (id: string, value: string) => void;
}

const REGISTRO_ACTIVOS_OPTIONS = [
  { value: 'Inventario de espacios', label: 'Inventario de espacios' },
  { value: 'Activos físicos y agrupaciones', label: 'Activos físicos y agrupaciones' },
  { value: 'Auditorías e informes', label: 'Auditorías e informes' },
  { value: 'Datos de ocupación', label: 'Datos de ocupación' },
  { value: 'Capacidad estructural', label: 'Capacidad estructural' },
];

const OPERACION_MANT_OPTIONS = [
  { value: 'Plan mantenimiento preventivo', label: 'Plan mantenimiento preventivo' },
  { value: 'Historial de mantenimiento', label: 'Historial de mantenimiento' },
  { value: 'Fechas de instalación', label: 'Fechas de instalación' },
  { value: 'Tarifas acumuladas', label: 'Tarifas acumuladas' },
  { value: 'Vida útil componentes', label: 'Vida útil componentes' },
  { value: 'Requisitos de sustitución', label: 'Requisitos de sustitución' },
];

const TIPOS_RIESGO_OPTIONS = [
  { value: 'Desastres naturales', label: 'Desastres naturales' },
  { value: 'Incendio', label: 'Incendio' },
  { value: 'Seguridad estructural', label: 'Seguridad estructural' },
  { value: 'Riesgos ambientales', label: 'Riesgos ambientales' },
  { value: 'Riesgos de seguridad', label: 'Riesgos de seguridad' },
];

const IMPACTOS_OPTIONS = [
  { value: 'Costos operativos', label: 'Costos operativos' },
  { value: 'Emisiones CO2e', label: 'Emisiones CO2e' },
  { value: 'Consumo energético', label: 'Consumo energético' },
  { value: 'Consumo de agua', label: 'Consumo de agua' },
  { value: 'Residuos', label: 'Residuos' },
  { value: 'Ninguno', label: 'Ninguno' },
];

const DEMOLICION_OPTIONS = [
  { value: 'Costos demolición', label: 'Costos demolición' },
  { value: 'Reciclaje materiales', label: 'Reciclaje materiales' },
  { value: 'Plazos estimados', label: 'Plazos estimados' },
  { value: 'Plan evacuación', label: 'Plan evacuación' },
];

export function Block3({ answers, onChange }: Props) {
  const requiereRiesgos = answers['OIR-3.3'] === 'Sí';
  const requiereFinVida = answers['OIR-3.6'] === 'Sí';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 3 — Requisitos del activo</h2>
        <p className="text-sm text-gray-500 mt-1">Información para gestión del ciclo de vida (OIR-3.1 a OIR-3.7)</p>
      </div>

      <MultiSelectField
        id="OIR-3.1"
        label="OIR-3.1 Información para registro de activos"
        required
        options={REGISTRO_ACTIVOS_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <MultiSelectField
        id="OIR-3.2"
        label="OIR-3.2 Información para operación y mantenimiento"
        required
        options={OPERACION_MANT_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <BooleanField
        id="OIR-3.3"
        label="OIR-3.3 ¿Requiere información para gestión de riesgos?"
        required
        answers={answers}
        onChange={onChange}
      />

      {requiereRiesgos && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <MultiSelectField
            id="OIR-3.4"
            label="OIR-3.4 Tipos de riesgo a gestionar"
            options={TIPOS_RIESGO_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}

      <MultiSelectField
        id="OIR-3.5"
        label="OIR-3.5 Impactos a gestionar"
        required
        options={IMPACTOS_OPTIONS}
        answers={answers}
        onChange={onChange}
      />

      <BooleanField
        id="OIR-3.6"
        label="OIR-3.6 ¿Requiere información para fin de vida útil?"
        required
        answers={answers}
        onChange={onChange}
      />

      {requiereFinVida && (
        <div className="pl-4 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg p-4">
          <MultiSelectField
            id="OIR-3.7"
            label="OIR-3.7 Información requerida para demolición"
            options={DEMOLICION_OPTIONS}
            answers={answers}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
