'use client';

import { useState, useCallback } from 'react';
import { RichTextEditor } from '../ui/RichTextEditor';

export interface OIRNarrativesMap {
  intro_context: string;
  s2_1_perfil: string;
  s2_2_estandares: string;
  s2_3_responsable: string;
  s3_1_usos_bim: string;
  s3_2_objetivo: string;
  s3_3_plan_activos: string;
  s3_4_regulatorio: string;
  s4_1_registro: string;
  s4_2_om: string;
  s4_3_riesgos: string;
  s4_4_impactos: string;
  s4_5_eol: string;
  s5_1_formatos: string;
  s5_2_clasificacion: string;
  s5_3_cde: string;
  s5_4_nivel_info: string;
  s6_1_frecuencia: string;
  s6_2_seguridad: string;
  s6_3_retencion: string;
  s7_observaciones: string;
}

const EMPTY_NARRATIVES: OIRNarrativesMap = {
  intro_context: '<p></p>',
  s2_1_perfil: '<p></p>', s2_2_estandares: '<p></p>', s2_3_responsable: '<p></p>',
  s3_1_usos_bim: '<p></p>', s3_2_objetivo: '<p></p>', s3_3_plan_activos: '<p></p>', s3_4_regulatorio: '<p></p>',
  s4_1_registro: '<p></p>', s4_2_om: '<p></p>', s4_3_riesgos: '<p></p>', s4_4_impactos: '<p></p>', s4_5_eol: '<p></p>',
  s5_1_formatos: '<p></p>', s5_2_clasificacion: '<p></p>', s5_3_cde: '<p></p>', s5_4_nivel_info: '<p></p>',
  s6_1_frecuencia: '<p></p>', s6_2_seguridad: '<p></p>', s6_3_retencion: '<p></p>',
  s7_observaciones: '<p></p>',
};

type Section = {
  label: string;
  fields: { key: keyof OIRNarrativesMap; label: string }[];
};

const SECTIONS: Section[] = [
  {
    label: 'Introducción',
    fields: [{ key: 'intro_context', label: 'Contexto y objeto del documento' }],
  },
  {
    label: '2. Identificación de la organización',
    fields: [
      { key: 's2_1_perfil', label: 'Perfil del adjudicador' },
      { key: 's2_2_estandares', label: 'Estándares BIM adoptados' },
      { key: 's2_3_responsable', label: 'Responsable de gestión de información' },
    ],
  },
  {
    label: '3. Objetivos estratégicos',
    fields: [
      { key: 's3_1_usos_bim', label: 'Usos BIM seleccionados' },
      { key: 's3_2_objetivo', label: 'Objetivo estratégico' },
      { key: 's3_3_plan_activos', label: 'Plan de gestión de activos' },
      { key: 's3_4_regulatorio', label: 'Obligaciones regulatorias' },
    ],
  },
  {
    label: '4. Requisitos de información del activo',
    fields: [
      { key: 's4_1_registro', label: 'Registro de activos' },
      { key: 's4_2_om', label: 'Operación y mantenimiento' },
      { key: 's4_3_riesgos', label: 'Gestión de riesgos' },
      { key: 's4_4_impactos', label: 'Impactos a gestionar' },
      { key: 's4_5_eol', label: 'Fin de vida útil' },
    ],
  },
  {
    label: '5. Estándares y formatos',
    fields: [
      { key: 's5_1_formatos', label: 'Formatos de intercambio' },
      { key: 's5_2_clasificacion', label: 'Sistema de clasificación' },
      { key: 's5_3_cde', label: 'Entorno común de datos (CDE)' },
      { key: 's5_4_nivel_info', label: 'Nivel de información necesario' },
    ],
  },
  {
    label: '6. Gobernanza de la información',
    fields: [
      { key: 's6_1_frecuencia', label: 'Frecuencia de actualización' },
      { key: 's6_2_seguridad', label: 'Seguridad y acceso' },
      { key: 's6_3_retencion', label: 'Retención de información' },
    ],
  },
  {
    label: '7. Observaciones adicionales',
    fields: [{ key: 's7_observaciones', label: 'Observaciones del adjudicador' }],
  },
];

interface Props {
  documentId: string;
  initialNarratives: OIRNarrativesMap | null;
}

export function NarrativesEditor({ documentId, initialNarratives }: Props) {
  const [narratives, setNarratives] = useState<OIRNarrativesMap>(
    initialNarratives ?? EMPTY_NARRATIVES
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');
  const [hasNarratives, setHasNarratives] = useState(!!initialNarratives);

  const handleFieldChange = useCallback((key: keyof OIRNarrativesMap, html: string) => {
    setNarratives((prev) => ({ ...prev, [key]: html }));
    setSaveMsg('');
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/documents/oir/${documentId}/narratives/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error al generar narrativas');
      }
      const data = await res.json();
      setNarratives(data.narratives);
      setHasNarratives(true);
      setSaveMsg('Narrativas generadas. Edita y guarda cuando estés listo.');
    } catch (e: any) {
      setError(e.message ?? 'Error inesperado');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    setError('');
    try {
      const res = await fetch(`/api/documents/oir/${documentId}/narratives`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narratives }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSaveMsg('Guardado correctamente');
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Narrativas del documento</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Generadas por IA · puedes editarlas con formato antes de exportar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasNarratives && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary text-xs py-1.5 flex items-center gap-1.5"
          >
            {generating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando narrativas…
              </>
            ) : hasNarratives ? (
              'Regenerar con IA'
            ) : (
              'Generar narrativas con IA'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saveMsg && !error && (
        <p className="text-xs text-green-600">{saveMsg}</p>
      )}

      {!hasNarratives && !generating && (
        <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-400">
          Haz clic en <strong>"Generar narrativas con IA"</strong> para crear el contenido del documento.
          Después podrás editarlo aquí antes de exportar.
        </div>
      )}

      {hasNarratives && (
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-100">
                {section.label}
              </h4>
              <div className="space-y-4">
                {section.fields.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {label}
                    </label>
                    <RichTextEditor
                      value={narratives[key]}
                      onChange={(html) => handleFieldChange(key, html)}
                      disabled={generating}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {saving ? 'Guardando...' : 'Guardar narrativas'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
