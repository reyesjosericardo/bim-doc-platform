/**
 * Builds styled HTML for PIR → PDF rendering via Puppeteer.
 */

import type { PIREnrichedVars } from './pirLLMEnricher';

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function nar(t: string): string { return t ? `<p class="narrative-text">${esc(t)}</p>` : ''; }
function kv(label: string, value: string): string {
  const empty = !value || value === 'No aplica';
  return `<p><strong>${esc(label)}:</strong> <span class="${empty ? 'na' : ''}">${esc(value || 'No aplica')}</span></p>`;
}
function nl2li(t: string): string {
  if (!t || t === 'No aplica') return '<em class="na">No aplica</em>';
  const lines = t.split('\n').filter(Boolean);
  if (lines.length === 1) return `<span>${esc(lines[0].replace(/^\d+\.\s*/, ''))}</span>`;
  return '<ol>' + lines.map((l) => `<li>${esc(l.replace(/^\d+\.\s*/, ''))}</li>`).join('') + '</ol>';
}
function infoTable(rows: [string, string][]): string {
  return `<table class="info-table"><tbody>${rows.map(([k, v]) => `<tr><td class="key">${esc(k)}</td><td>${esc(v || 'No aplica')}</td></tr>`).join('')}</tbody></table>`;
}

export function buildPirHtml(v: PIREnrichedVars): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111827; line-height: 1.65; }
  .cover { text-align: center; padding: 80px 60px; page-break-after: always; }
  .cover h1 { font-size: 26pt; color: #1D4ED8; margin-bottom: 8px; line-height: 1.2; }
  .cover .subtitle { font-size: 14pt; color: #6B7280; margin-bottom: 60px; font-style: italic; }
  .cover table { margin: 0 auto; border-collapse: collapse; width: 460px; }
  .cover td { padding: 8px 16px; border: 1px solid #E5E7EB; text-align: left; }
  .cover td:first-child { background: #EFF6FF; font-weight: 600; color: #1D4ED8; width: 190px; }
  .doc-header { background: #1D4ED8; color: white; padding: 8px 20px; font-size: 9pt; display: flex; justify-content: space-between; }
  .doc-footer { border-top: 1px solid #E5E7EB; padding: 8px 20px; font-size: 9pt; color: #6B7280; text-align: center; margin-top: 40px; }
  .content { padding: 20px 30px; }
  .section { margin-bottom: 36px; }
  .section > h2 { font-size: 15pt; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; padding-bottom: 6px; margin-bottom: 18px; margin-top: 32px; }
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 28px 0; }
  h3 { font-size: 12pt; color: #374151; border-left: 3px solid #1D4ED8; padding-left: 10px; margin: 20px 0 10px; }
  .narrative-text { color: #111827; margin: 0 0 12px 0; }
  p { margin: 6px 0; } p strong { color: #374151; } .na { color: #9CA3AF; font-style: italic; }
  ol { margin: 6px 0 10px 24px; } li { margin: 3px 0; }
  .info-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .info-table td { padding: 7px 12px; border: 1px solid #E5E7EB; font-size: 10pt; }
  .info-table td.key { background: #EFF6FF; font-weight: 600; color: #1D4ED8; width: 40%; }
  .control-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .control-table th { background: #1D4ED8; color: white; padding: 8px 12px; text-align: left; font-size: 10pt; }
  .control-table td { padding: 7px 12px; border: 1px solid #E5E7EB; font-size: 10pt; }
  .control-table tr:nth-child(even) td { background: #F9FAFB; }
</style>
</head>
<body>
<div class="cover">
  <h1>REQUISITOS DE<br>INFORMACIÓN DEL PROYECTO</h1>
  <p class="subtitle">(PIR) — ISO 19650</p>
  <table>
    <tr><td>Proyecto</td><td>${esc(v.project_name)}</td></tr>
    <tr><td>Sector</td><td>${esc(v.sector)}</td></tr>
    <tr><td>Versión</td><td>v${esc(v.doc_version)}</td></tr>
    <tr><td>Fecha</td><td>${esc(v.doc_date)}</td></tr>
    <tr><td>Estado</td><td>${esc(v.doc_status)}</td></tr>
    <tr><td>Responsable del adjudicador</td><td>${esc(v.client_lead)}</td></tr>
  </table>
</div>

<div class="doc-header">
  <span>PIR — ${esc(v.project_name)}</span>
  <span>ISO 19650 | v${esc(v.doc_version)} | ${esc(v.doc_date)}</span>
</div>

<div class="content">

<div class="section">
  <h2>1. Objeto y alcance del PIR</h2>
  ${nar(v.intro_context)}
  ${kv('Sector', v.sector)}
  ${kv('OIR de referencia', v.oir_reference)}
  ${kv('Responsable del adjudicador', v.client_lead)}
  <p><strong>Alcance de la inversión:</strong></p>
  ${nl2li(v.investment_scope)}
</div>
<hr class="divider"/>

<div class="section">
  <h2>2. Objetivos estratégicos de la inversión</h2>
  ${nar(v.s2_objectives)}
  <p><strong>Objetivos estratégicos:</strong></p>
  ${nl2li(v.strategic_objectives_list)}
  ${infoTable([
    ['Presupuesto objetivo', v.budget_target],
    ['Plazo objetivo', v.schedule_target],
    ['Certificación ambiental', v.has_certification === 'Sí' ? v.certification : v.has_certification],
  ])}
  <p><strong>Objetivos de sostenibilidad / energía:</strong></p>
  ${nl2li(v.sustainability_goals)}
</div>
<hr class="divider"/>

<div class="section">
  <h2>3. Hitos y puntos clave de decisión</h2>
  ${nar(v.s3_decisions)}
  <p><strong>Hitos de decisión clave:</strong></p>
  ${nl2li(v.decision_milestones_list)}
  ${kv('¿Modelos para la toma de decisiones?', v.requires_models)}
  <p><strong>Información para la toma de decisiones:</strong></p>
  ${nl2li(v.decision_info_list)}
  <p><strong>Preguntas clave a responder por hito:</strong></p>
  ${nl2li(v.key_questions)}
</div>
<hr class="divider"/>

<div class="section">
  <h2>4. Nivel de información necesario por decisión (LOIN)</h2>
  <p><em>Referencia normativa: ISO 19650-1 §11.2 · EN 17412-1</em></p>
  ${nar(v.s4_loin)}
  ${kv('¿LOIN definido por punto de decisión?', v.has_loin)}
  ${v.has_loin === 'Sí' ? `
    ${kv('Información geométrica', v.loin_geometric)}
    <p><strong>Información alfanumérica:</strong></p>
    ${nl2li(v.loin_alphanumeric_list)}
    <p><strong>Documentación asociada:</strong></p>
    ${nl2li(v.loin_documentation_list)}
  ` : ''}
</div>
<hr class="divider"/>

<div class="section">
  <h2>5. Requisitos de gestión y entrega</h2>
  ${nar(v.s5_delivery)}
  <p><strong>Usos BIM prioritarios:</strong></p>
  ${nl2li(v.bim_uses_list)}
  <p><strong>Formatos de intercambio:</strong></p>
  ${nl2li(v.exchange_formats_list)}
  ${kv('Plan de transición a operación (AIR/AIM)', v.has_transition)}
  <p><strong>Restricciones / condicionantes:</strong></p>
  ${nl2li(v.constraints)}
</div>
${v.observations && v.observations !== 'No aplica' ? `
<hr class="divider"/>
<div class="section"><h3>Observaciones</h3>${nl2li(v.observations)}</div>` : ''}
<hr class="divider"/>

<div class="section">
  <h2>Control de documento</h2>
  <table class="control-table">
    <thead><tr><th>Versión</th><th>Fecha</th><th>Responsable</th><th>Estado</th><th>Descripción del cambio</th></tr></thead>
    <tbody><tr>
      <td>v${esc(v.doc_version)}</td><td>${esc(v.doc_date)}</td><td>${esc(v.client_lead)}</td><td>${esc(v.doc_status)}</td>
      <td>Versión inicial generada desde BIM Doc Platform</td>
    </tr></tbody>
  </table>
</div>

</div>
<div class="doc-footer">${esc(v.project_name)}  ·  PIR v${esc(v.doc_version)}  ·  ${esc(v.doc_date)}  ·  ISO 19650</div>
</body>
</html>`;
}
