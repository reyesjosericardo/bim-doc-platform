'use client';

import type { AnswersMap } from '@/types/oir';
import { TextareaField } from '../../oir/FormField';

interface Props { answers: AnswersMap; onChange: (id: string, value: string) => void; }

function YesNoRow({ id, label, answers, onChange }: { id: string; label: string; answers: AnswersMap; onChange: (id: string, value: string) => void }) {
  const value = answers[id] || '';
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex gap-2 flex-shrink-0">
        {['Sí', 'No'].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(id, opt)}
            className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
              value === opt
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Block2({ answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bloque 2 — Información previa disponible</h2>
        <p className="text-sm text-gray-500 mt-1">Documentación que el adjudicador pone a disposición del equipo de desarrollo (EIR-2.1 a EIR-2.5)</p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">EIR-2.1 a EIR-2.4 — Documentación de referencia disponible</p>
        <p className="text-xs text-gray-500 mb-3">Indica qué documentos previos están disponibles para el equipo de desarrollo.</p>
        <div className="bg-gray-50 rounded-lg px-4">
          <YesNoRow id="EIR-2.1" label="Levantamiento topográfico" answers={answers} onChange={onChange} />
          <YesNoRow id="EIR-2.2" label="Estudio geotécnico" answers={answers} onChange={onChange} />
          <YesNoRow id="EIR-2.3" label="Modelo de estado actual (AIM o nube de puntos)" answers={answers} onChange={onChange} />
          <YesNoRow id="EIR-2.4" label="Libro de estilo / fichas de necesidades técnicas del cliente" answers={answers} onChange={onChange} />
        </div>
      </div>

      <TextareaField
        id="EIR-2.5"
        label="EIR-2.5 Otros documentos de referencia disponibles"
        answers={answers}
        onChange={onChange}
        placeholder="Indica cualquier otra documentación previa disponible (informes, memorias, estudios previos, etc.)"
      />
    </div>
  );
}
