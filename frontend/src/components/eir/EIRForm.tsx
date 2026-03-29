'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { GenerateDocumentButton } from '../oir/GenerateDocumentButton';
import { Block1 } from './blocks/Block1';
import { Block2 } from './blocks/Block2';
import { Block3 } from './blocks/Block3';
import { Block4 } from './blocks/Block4';
import { Block5 } from './blocks/Block5';
import { Block6 } from './blocks/Block6';
import type { AnswersMap, DocumentStatus } from '@/types/oir';

const BLOCKS = ['Identificación', 'Info previa', 'Hitos', 'Estándares', 'LOIN', 'CDE'];

const REQUIRED_BY_BLOCK: Record<number, string[]> = {
  0: ['EIR-1.1', 'EIR-1.2', 'EIR-1.3', 'EIR-1.4', 'EIR-1.5'],
  1: [],
  2: ['EIR-3.1', 'EIR-3.2', 'EIR-3.3', 'EIR-3.5'],
  3: ['EIR-4.1', 'EIR-4.2', 'EIR-4.3', 'EIR-4.4', 'EIR-4.6'],
  4: ['EIR-5.1', 'EIR-5.2', 'EIR-5.3'],
  5: ['EIR-6.1', 'EIR-6.3', 'EIR-6.4', 'EIR-6.5'],
};

const CONDITIONAL_TRIGGERS: Record<string, string> = {
  'EIR-3.4': 'EIR-3.3',
  'EIR-4.5': 'EIR-4.4',
  'EIR-5.4': 'EIR-5.3',
  'EIR-6.2': 'EIR-6.1',
  'EIR-6.6': 'EIR-6.5',
};

const BASE_COUNT = 26;

function inferAnswerType(questionId: string): string {
  const textarea = ['EIR-1.2', 'EIR-2.5', 'EIR-4.5', 'EIR-6.6'];
  const boolean = ['EIR-2.1', 'EIR-2.2', 'EIR-2.3', 'EIR-2.4', 'EIR-3.2', 'EIR-3.3', 'EIR-4.4', 'EIR-4.6', 'EIR-5.3', 'EIR-6.1', 'EIR-6.4', 'EIR-6.5'];
  const multi = ['EIR-1.4', 'EIR-3.1', 'EIR-4.3', 'EIR-5.2', 'EIR-5.4', 'EIR-6.3'];
  const select = ['EIR-1.3', 'EIR-3.4', 'EIR-3.5', 'EIR-4.1', 'EIR-4.2', 'EIR-5.1', 'EIR-6.2'];
  if (textarea.includes(questionId)) return 'textarea';
  if (boolean.includes(questionId)) return 'boolean';
  if (multi.includes(questionId)) return 'multi_select';
  if (select.includes(questionId)) return 'select';
  return 'text';
}

interface EIRFormProps {
  documentId?: string;
  projectId: string;
  initialAnswers?: AnswersMap;
  initialStatus?: DocumentStatus;
}

export function EIRForm({ documentId, projectId, initialAnswers = {}, initialStatus = 'borrador' }: EIRFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeBlock, setActiveBlock] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers);
  const [status, setStatus] = useState<DocumentStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const docIdRef = useRef<string | undefined>(documentId);

  const activeConditionals = Object.entries(CONDITIONAL_TRIGGERS)
    .filter(([, trigger]) => answers[trigger] === 'Sí').length;
  const totalQuestions = BASE_COUNT + activeConditionals;

  const CONDITIONAL_IDS = new Set(Object.keys(CONDITIONAL_TRIGGERS));
  const totalAnswered = Object.entries(answers).filter(([id, v]) => {
    if (!v) return false;
    if (CONDITIONAL_IDS.has(id)) return answers[CONDITIONAL_TRIGGERS[id]] === 'Sí';
    return true;
  }).length;

  function handleChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors([]);
    setSaveMsg('');
  }

  async function saveBlock() {
    setSaving(true);
    setSaveMsg('');
    const allAnswers = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([question_id, answer_value]) => ({
        question_id,
        answer_value,
        answer_type: inferAnswerType(question_id),
      }));

    try {
      if (!docIdRef.current) {
        const res = await fetch('/api/documents/eir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, answers: allAnswers }),
        });
        if (!res.ok) throw new Error('Error al crear el documento');
        const doc = await res.json();
        docIdRef.current = doc.id;
      } else {
        const res = await fetch(`/api/documents/eir/${docIdRef.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: allAnswers }),
        });
        if (!res.ok) throw new Error('Error al guardar');
      }
      setSaveMsg('Guardado automáticamente');
    } catch {
      setSaveMsg('Error al guardar — intenta de nuevo');
    } finally {
      setSaving(false);
    }
  }

  function validateBlock(blockIndex: number): string[] {
    return (REQUIRED_BY_BLOCK[blockIndex] ?? []).filter((id) => !answers[id]);
  }

  async function handleNext() {
    const missing = validateBlock(activeBlock);
    if (missing.length > 0) {
      setErrors(missing.map((id) => `Campo obligatorio sin respuesta: ${id}`));
      return;
    }
    await saveBlock();
    setActiveBlock((p) => Math.min(p + 1, BLOCKS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setActiveBlock((p) => Math.max(p - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSaveAndExit() {
    await saveBlock();
    router.push('/dashboard');
  }

  async function handleFinish() {
    const missing = validateBlock(activeBlock);
    if (missing.length > 0) {
      setErrors(missing.map((id) => `Campo obligatorio sin respuesta: ${id}`));
      return;
    }
    await saveBlock();
    router.push('/dashboard');
  }

  const canApprove = session?.user.role === 'adjudicador' || session?.user.role === 'adj_principal';

  async function handleStatusChange(newStatus: DocumentStatus) {
    if (!docIdRef.current) return;
    try {
      const res = await fetch(`/api/documents/eir/${docIdRef.current}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
    } catch {
      alert('Error al cambiar el estado del documento');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">EIR — Requisitos de Intercambio de Información</h1>
            <p className="text-xs text-gray-500">ISO 19650-2 — Pliego BIM</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            {canApprove && status === 'en_revision' && (
              <button onClick={() => handleStatusChange('aprobado')} className="btn-primary text-xs py-1">Aprobar</button>
            )}
            {docIdRef.current && status === 'borrador' && (
              <button onClick={() => handleStatusChange('en_revision')} className="btn-secondary text-xs py-1">Enviar a revisión</button>
            )}
            {status === 'en_revision' && !canApprove && (
              <span className="text-xs text-amber-600 font-medium">Pendiente de aprobación</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProgressBar current={totalAnswered} total={totalQuestions} blocks={BLOCKS} activeBlock={activeBlock} onBlockClick={(i) => { if (i < activeBlock) setActiveBlock(i); }} />

        <div className="card mb-6">
          {activeBlock === 0 && <Block1 answers={answers} onChange={handleChange} />}
          {activeBlock === 1 && <Block2 answers={answers} onChange={handleChange} />}
          {activeBlock === 2 && <Block3 answers={answers} onChange={handleChange} />}
          {activeBlock === 3 && <Block4 answers={answers} onChange={handleChange} />}
          {activeBlock === 4 && <Block5 answers={answers} onChange={handleChange} />}
          {activeBlock === 5 && <Block6 answers={answers} onChange={handleChange} />}
        </div>

        {activeBlock === BLOCKS.length - 1 && docIdRef.current && (
          <div className="card mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar documento EIR
            </h3>
            <GenerateDocumentButton documentId={docIdRef.current} status={status} answeredCount={totalAnswered} docType="EIR" />
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-medium text-red-700 mb-1">Por favor completa los campos obligatorios:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((e, i) => <li key={i} className="text-sm text-red-600">{e}</li>)}
            </ul>
          </div>
        )}

        {saveMsg && (
          <p className={`text-xs text-center mb-4 ${saveMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {saving ? 'Guardando...' : saveMsg}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={handleBack} disabled={activeBlock === 0} className="btn-secondary">Anterior</button>
            <button onClick={handleSaveAndExit} className="btn-secondary">Guardar y salir</button>
          </div>
          {activeBlock < BLOCKS.length - 1 ? (
            <button onClick={handleNext} disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Siguiente bloque'}</button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Finalizar EIR'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
