'use client';

import { useState } from 'react';
import type { DocumentStatus } from '@/types/oir';

interface Props {
  documentId: string;
  status: DocumentStatus;
  answeredCount: number;
}

interface GeneratedLinks {
  docxUrl: string;
  pdfUrl:  string;
}

export function GenerateDocumentButton({ documentId, status, answeredCount }: Props) {
  const [generating, setGenerating]   = useState(false);
  const [links, setLinks]             = useState<GeneratedLinks | null>(null);
  const [error, setError]             = useState('');

  const isReady = status === 'aprobado' && answeredCount >= 20;

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    setLinks(null);

    try {
      const res = await fetch(`/api/documents/oir/${documentId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Error al generar el documento');
      }

      const data = await res.json();
      setLinks({
        docxUrl: `/api/documents/oir/${documentId}/download/docx`,
        pdfUrl:  `/api/documents/oir/${documentId}/download/pdf`,
      });
    } catch (e: any) {
      setError(e.message ?? 'Error inesperado');
    } finally {
      setGenerating(false);
    }
  }

  if (!isReady) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
        <strong>Generación de documento no disponible.</strong>{' '}
        {status !== 'aprobado'
          ? 'El documento debe estar en estado Aprobado.'
          : 'Se necesitan al menos 20 respuestas completadas.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!links ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generando Word y PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar documento OIR
            </>
          )}
        </button>
      ) : (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Documento generado correctamente
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={links.docxUrl}
              download
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Word (.docx)
            </a>
            <a
              href={links.pdfUrl}
              download
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PDF
            </a>
            <button
              onClick={() => setLinks(null)}
              className="btn-secondary text-sm py-2"
            >
              Regenerar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
