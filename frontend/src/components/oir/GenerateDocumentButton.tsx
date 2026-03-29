'use client';

import { useState } from 'react';
import type { DocumentStatus } from '@/types/oir';

interface Props {
  documentId: string;
  status: DocumentStatus;
  answeredCount: number;
  docType?: 'OIR' | 'EIR';
}

type DocMode = 'complete' | 'narrative_only';

interface GeneratedLinks {
  docxUrl: string;
  pdfUrl:  string;
}

const DOWNLOAD_ICON = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DOC_ICON = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export function GenerateDocumentButton({ documentId, status, answeredCount, docType = 'OIR' }: Props) {
  const [generating, setGenerating] = useState<DocMode | null>(null);
  const [completeLinks, setCompleteLinks] = useState<GeneratedLinks | null>(null);
  const [execLinks, setExecLinks]         = useState<GeneratedLinks | null>(null);
  const [error, setError] = useState('');

  const docTypeLower = docType.toLowerCase();
  const minAnswers = docType === 'EIR' ? 20 : 20;
  const isReady = status === 'aprobado' && answeredCount >= minAnswers;
  const isEIR = docType === 'EIR';

  async function handleGenerate(mode: DocMode) {
    setGenerating(mode);
    setError('');

    try {
      const res = await fetch(`/api/documents/${docTypeLower}/${documentId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEIR ? {} : { mode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Error al generar el documento');
      }

      if (isEIR) {
        const links: GeneratedLinks = {
          docxUrl: `/api/documents/${docTypeLower}/${documentId}/download/docx`,
          pdfUrl:  `/api/documents/${docTypeLower}/${documentId}/download/pdf`,
        };
        setCompleteLinks(links);
      } else {
        const downloadDocx = mode === 'narrative_only'
          ? `/api/documents/${docTypeLower}/${documentId}/download/docx_exec`
          : `/api/documents/${docTypeLower}/${documentId}/download/docx`;
        const downloadPdf = mode === 'narrative_only'
          ? `/api/documents/${docTypeLower}/${documentId}/download/pdf_exec`
          : `/api/documents/${docTypeLower}/${documentId}/download/pdf`;

        const links: GeneratedLinks = { docxUrl: downloadDocx, pdfUrl: downloadPdf };
        if (mode === 'complete') {
          setCompleteLinks(links);
        } else {
          setExecLinks(links);
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Error inesperado');
    } finally {
      setGenerating(null);
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

  // EIR: single generate button (no executive version)
  if (isEIR) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Documento EIR completo</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pliego BIM con todas las secciones ISO 19650-2 y narrativas contractuales.
            </p>
          </div>
          {!completeLinks ? (
            <button
              onClick={() => handleGenerate('complete')}
              disabled={generating !== null}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {generating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>{DOC_ICON} Generar documento EIR</>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-green-700 flex items-center gap-1.5">
                {CHECK_ICON} Documento EIR generado
              </p>
              <div className="flex gap-2 flex-wrap">
                <a href={completeLinks.docxUrl} download className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                  {DOWNLOAD_ICON} Word (.docx)
                </a>
                <a href={completeLinks.pdfUrl} download className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
                  {DOWNLOAD_ICON} PDF
                </a>
                <button onClick={() => setCompleteLinks(null)} className="btn-secondary text-xs py-1.5">
                  Regenerar
                </button>
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Documento completo ──────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Documento completo</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Todas las secciones con narrativas LLM + datos estructurados + control de documento.
          </p>
        </div>

        {!completeLinks ? (
          <button
            onClick={() => handleGenerate('complete')}
            disabled={generating !== null}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            {generating === 'complete' ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>{DOC_ICON} Generar documento completo</>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-700 flex items-center gap-1.5">
              {CHECK_ICON} Documento completo generado
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href={completeLinks.docxUrl} download className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                {DOWNLOAD_ICON} Word (.docx)
              </a>
              <a href={completeLinks.pdfUrl} download className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
                {DOWNLOAD_ICON} PDF
              </a>
              <button onClick={() => setCompleteLinks(null)} className="btn-secondary text-xs py-1.5">
                Regenerar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Versión ejecutiva ────────────────────────────────────────── */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Versión ejecutiva</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Solo narrativas ISO 19650 por sub-sección, sin datos estructurados. Ideal para presentaciones a directivos.
          </p>
        </div>

        {!execLinks ? (
          <button
            onClick={() => handleGenerate('narrative_only')}
            disabled={generating !== null}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            {generating === 'narrative_only' ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>{DOC_ICON} Generar versión ejecutiva</>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-700 flex items-center gap-1.5">
              {CHECK_ICON} Versión ejecutiva generada
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href={execLinks.docxUrl} download className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                {DOWNLOAD_ICON} Word ejecutivo
              </a>
              <a href={execLinks.pdfUrl} download className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
                {DOWNLOAD_ICON} PDF ejecutivo
              </a>
              <button onClick={() => setExecLinks(null)} className="btn-secondary text-xs py-1.5">
                Regenerar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
