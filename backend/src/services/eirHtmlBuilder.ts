/**
 * Sprint 4 — Builds styled HTML for EIR → PDF rendering via Puppeteer.
 */

import type { EIREnrichedVars } from './eirLLMEnricher';

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nar(text: string): string {
  if (!text) return '';
  return `<p class="narrative-text">${esc(text)}</p>`;
}

function kv(label: string, value: string): string {
  const empty = !value || value === 'No aplica';
  return `<p><strong>${esc(label)}:</strong> <span class="${empty ? 'na' : ''}">${esc(value || 'No aplica')}</span></p>`;
}

function nl2li(text: string): string {
  if (!text || text === 'No aplica') return '<em class="na">No aplica</em>';
  const lines = text.split('\n').filter(Boolean);
  if (lines.length === 1) return `<span>${esc(lines[0])}</span>`;
  return '<ol>' + lines.map((l) => `<li>${esc(l.replace(/^\d+\.\s*/, ''))}</li>`).join('') + '</ol>';
}

function infoTable(rows: [string, string][]): string {
  return `<table class="info-table"><tbody>${rows.map(([k, v]) => `<tr><td class="key">${esc(k)}</td><td>${esc(v || 'No aplica')}</td></tr>`).join('')}</tbody></table>`;
}

export function buildEirHtml(vars: EIREnrichedVars): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111827; line-height: 1.65; }

  .cover { text-align: center; padding: 80px 60px; page-break-after: always; }
  .cover h1 { font-size: 28pt; color: #1D4ED8; margin-bottom: 8px; line-height: 1.2; }
  .cover .subtitle { font-size: 14pt; color: #6B7280; margin-bottom: 60px; font-style: italic; }
  .cover table { margin: 0 auto; border-collapse: collapse; width: 420px; }
  .cover td { padding: 8px 16px; border: 1px solid #E5E7EB; }
  .cover td:first-child { background: #EFF6FF; font-weight: 600; color: #1D4ED8; width: 150px; }

  .doc-header { background: #1D4ED8; color: white; padding: 8px 20px; font-size: 9pt; display: flex; justify-content: space-between; }
  .doc-footer { border-top: 1px solid #E5E7EB; padding: 8px 20px; font-size: 9pt; color: #6B7280; text-align: center; margin-top: 40px; }
  .content { padding: 20px 30px; }

  .section { margin-bottom: 36px; }
  .section > h2 { font-size: 15pt; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; padding-bottom: 6px; margin-bottom: 18px; margin-top: 32px; }
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 28px 0; }

  h3 { font-size: 12pt; color: #374151; border-left: 3px solid #1D4ED8; padding-left: 10px; margin: 20px 0 10px; }

  .narrative-text { color: #111827; margin: 0 0 12px 0; }

  p { margin: 6px 0; }
  p strong { color: #374151; }
  .na { color: #9CA3AF; font-style: italic; }

  ol { margin: 6px 0 10px 24px; }
  li { margin: 3px 0; }

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

<!-- Cover -->
<div class="cover">
  <h1>REQUISITOS DE<br>INTERCAMBIO DE<br>INFORMACIÓN</h1>
  <p class="subtitle">(EIR) — ISO 19650-2</p>
  <table>
    <tr><td>Proyecto</td><td>${esc(vars.project_name)}</td></tr>
    <tr><td>Versión</td><td>v${esc(vars.doc_version)}</td></tr>
    <tr><td>Fecha</td><td>${esc(vars.doc_date)}</td></tr>
    <tr><td>Estado</td><td>${esc(vars.doc_status)}</td></tr>
    <tr><td>BIM Manager</td><td>${esc(vars.bim_manager)}</td></tr>
  </table>
</div>

<!-- Header -->
<div class="doc-header">
  <span>EIR — ${esc(vars.project_name)}</span>
  <span>ISO 19650-2 | v${esc(vars.doc_version)} | ${esc(vars.doc_date)}</span>
</div>

<div class="content">

<!-- Section 1 -->
<div class="section">
  <h2>1. Objeto y campo de aplicación</h2>
  ${nar(vars.intro_context)}
  ${kv('Sector de actividad', vars.sector)}
  ${kv('Fases del proyecto cubiertas', '')}
  ${nl2li(vars.phases_list)}
  ${kv('BIM Manager del adjudicador', vars.bim_manager)}
</div>
<hr class="divider"/>

<!-- Section 2 -->
<div class="section">
  <h2>2. Información previa disponible</h2>
  ${nar(vars.s2_info_previa)}
  ${infoTable([
    ['Levantamiento topográfico', vars.has_topo],
    ['Estudio geotécnico', vars.has_geo],
    ['Modelo de estado actual (AIM / nube de puntos)', vars.has_aim],
    ['Libro de estilo / fichas técnicas del cliente', vars.has_style_book],
    ['Otros documentos de referencia', vars.other_docs],
  ])}
</div>
<hr class="divider"/>

<!-- Section 3 -->
<div class="section">
  <h2>3. Hitos y entregables de información</h2>

  <h3>3.1 Entregables mínimos requeridos</h3>
  ${nar(vars.s3_1_entregables)}
  <p><strong>Entregables mínimos:</strong></p>
  ${nl2li(vars.deliverables_list)}
  ${kv('IFC obligatorio en cada hito', vars.requires_ifc)}

  <h3>3.2 Detección de conflictos (Clash Detection)</h3>
  ${nar(vars.s3_2_clash)}
  ${kv('¿Se requiere clash detection?', vars.has_clash)}
  ${vars.has_clash === 'Sí' ? kv('Frecuencia de clash detection', vars.clash_frequency) : ''}

  <h3>3.3 Plan de Ejecución BIM (BEP)</h3>
  ${kv('Momento de entrega del BEP', vars.bep_timing)}
</div>
<hr class="divider"/>

<!-- Section 4 -->
<div class="section">
  <h2>4. Estándares de información</h2>

  <h3>4.1 Nomenclatura y clasificación</h3>
  ${nar(vars.s4_1_nomenclatura)}
  ${infoTable([
    ['Sistema de nomenclatura de archivos', vars.naming_system],
    ['Sistema de clasificación', vars.classification_system],
  ])}

  <h3>4.2 Formatos de intercambio</h3>
  ${nar(vars.s4_2_formatos)}
  <p><strong>Formatos requeridos:</strong></p>
  ${nl2li(vars.exchange_formats_list)}
  ${kv('COBie para O&M', vars.requires_cobie)}

  <h3>4.3 Requisitos de software</h3>
  ${nar(vars.s4_3_software)}
  ${kv('Versión de software específica requerida', vars.requires_software)}
  ${vars.requires_software === 'Sí' ? kv('Versiones requeridas', vars.software_versions) : ''}
</div>
<hr class="divider"/>

<!-- Section 5 -->
<div class="section">
  <h2>5. Nivel de información necesario (LOIN)</h2>
  <p><em>Referencia normativa: ISO 19650-1 §11.2 y EN17412-1 — Nivel de información necesaria</em></p>

  <h3>5.1 Nivel mínimo requerido</h3>
  ${nar(vars.s5_1_nivel)}
  ${kv('Nivel mínimo de información necesario', vars.loin_level)}

  <h3>5.2 Componentes de información requeridos</h3>
  ${nar(vars.s5_2_componentes)}
  <p><strong>Componentes requeridos:</strong></p>
  ${nl2li(vars.loin_components_list)}

  ${vars.loin_by_discipline === 'Sí' ? `
  <h3>5.3 LOIN diferenciado por disciplina</h3>
  ${nar(vars.s5_3_disciplinas)}
  <p><strong>Disciplinas con LOIN específico:</strong></p>
  ${nl2li(vars.loin_disciplines_list)}
  ` : ''}
</div>
<hr class="divider"/>

<!-- Section 6 -->
<div class="section">
  <h2>6. Entorno común de datos y gobernanza</h2>

  <h3>6.1 Plataforma CDE</h3>
  ${nar(vars.s6_1_cde)}
  ${infoTable([
    ['Adjudicador provee el CDE', vars.client_provides_cde],
    ['Plataforma CDE', vars.cde_platform],
    ['Estructura de carpetas ISO 19650', vars.requires_iso_folders],
  ])}

  <h3>6.2 Estados de flujo de información</h3>
  ${nar(vars.s6_2_estados)}
  <p><strong>Estados requeridos en CDE:</strong></p>
  ${nl2li(vars.cde_states_list)}

  <h3>6.3 ${vars.has_restrictions === 'Sí' ? 'Restricciones de acceso a información' : 'Acceso a información'}</h3>
  ${nar(vars.s6_3_restricciones)}
  ${vars.has_restrictions === 'Sí' ? kv('Restricciones de acceso', vars.has_restrictions) + kv('Descripción de restricciones', vars.restrictions_description) : kv('Restricciones de acceso', 'No aplica')}
</div>
<hr class="divider"/>

<!-- Control de documento -->
<div class="section">
  <h2>Control de documento</h2>
  <table class="control-table">
    <thead>
      <tr><th>Versión</th><th>Fecha</th><th>BIM Manager</th><th>Estado</th><th>Descripción del cambio</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>v${esc(vars.doc_version)}</td>
        <td>${esc(vars.doc_date)}</td>
        <td>${esc(vars.bim_manager)}</td>
        <td>${esc(vars.doc_status)}</td>
        <td>Versión inicial generada desde BIM Doc Platform</td>
      </tr>
    </tbody>
  </table>
</div>

</div><!-- /content -->

<div class="doc-footer">
  ${esc(vars.project_name)}  ·  EIR v${esc(vars.doc_version)}  ·  ${esc(vars.doc_date)}  ·  ISO 19650-2
</div>

</body>
</html>`;
}
