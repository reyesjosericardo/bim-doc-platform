/**
 * Sprint 3.2 — Builds styled HTML for OIR → PDF rendering via Puppeteer.
 * Structure: h2 for sections, h3 for sub-sections.
 * No colored backgrounds on narrative paragraphs.
 * Supports 'complete' and 'narrative_only' modes.
 */

import type { OIREnrichedVars } from './oirLLMEnricher';

export type DocMode = 'complete' | 'narrative_only';

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Narrative paragraph — plain text, no color highlight */
function nar(text: string): string {
  if (!text) return '';
  return `<p class="narrative-text">${esc(text)}</p>`;
}

/** User's original text as blockquote */
function blockquote(text: string): string {
  if (!text) return '';
  return `<blockquote class="user-quote">${esc(text)}</blockquote>`;
}

/** Key-value inline */
function kv(label: string, value: string): string {
  const empty = !value || value === 'No aplica';
  return `<p><strong>${esc(label)}:</strong> <span class="${empty ? 'na' : ''}">${esc(value || 'No aplica')}</span></p>`;
}

/** Multiline list — handles §Phase headers */
function nl2li(text: string): string {
  if (!text || text === 'No aplica') return '<em class="na">No aplica</em>';
  const lines = text.split('\n').filter(Boolean);
  if (lines.length === 1 && !lines[0].startsWith('§')) return `<span>${esc(lines[0])}</span>`;

  let html = '';
  let inList = false;
  for (const line of lines) {
    if (line.startsWith('§')) {
      if (inList) { html += '</ol>'; inList = false; }
      html += `<p class="phase-header">${esc(line.slice(1))}</p>`;
    } else {
      if (!inList) { html += '<ol>'; inList = true; }
      html += `<li>${esc(line.replace(/^\d+\.\s*/, ''))}</li>`;
    }
  }
  if (inList) html += '</ol>';
  return html;
}

function pennStateNote(): string {
  return `<p class="footnote">Los usos BIM han sido definidos según el framework BIM Uses de la Universidad de Penn State (Computer Integrated Construction Research Program) y adaptados a los requisitos de información establecidos en ISO 19650-1.</p>`;
}

/** Conditional block — rendered only in complete mode */
function data(mode: DocMode, content: string): string {
  if (mode === 'narrative_only') return '';
  return content;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildOirHtml(vars: OIREnrichedVars, mode: DocMode = 'complete'): string {
  const full = mode === 'complete';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111827; line-height: 1.65; }

  /* Cover */
  .cover { text-align: center; padding: 80px 60px; page-break-after: always; }
  .cover h1 { font-size: 28pt; color: #1D4ED8; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14pt; color: #6B7280; margin-bottom: 60px; font-style: italic; }
  .cover table { margin: 0 auto; border-collapse: collapse; width: 420px; }
  .cover td { padding: 8px 16px; border: 1px solid #E5E7EB; }
  .cover td:first-child { background: #EFF6FF; font-weight: 600; color: #1D4ED8; width: 150px; }

  /* Header/footer */
  .doc-header { background: #1D4ED8; color: white; padding: 8px 20px; font-size: 9pt; display: flex; justify-content: space-between; }
  .doc-footer { border-top: 1px solid #E5E7EB; padding: 8px 20px; font-size: 9pt; color: #6B7280; text-align: center; }
  .content { padding: 20px 30px; }

  /* Sections */
  .section { margin-bottom: 36px; }
  .section > h2 { font-size: 15pt; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; padding-bottom: 6px; margin-bottom: 18px; margin-top: 32px; }
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 28px 0; }

  /* Sub-sections */
  .subsection { margin: 20px 0 14px 0; }
  .subsection h3 { font-size: 11.5pt; color: #374151; font-weight: 600; margin-bottom: 10px; border-left: 3px solid #BFDBFE; padding-left: 10px; }

  /* Narrative text — plain, no background */
  .narrative-text { color: #111827; margin: 0 0 12px 0; line-height: 1.7; }

  /* User quote */
  .user-quote { border-left: 4px solid #D1D5DB; padding: 8px 14px; margin: 10px 0 14px 0; color: #6B7280; font-style: italic; }

  /* Data elements */
  p { margin: 7px 0; }
  ol { margin: 6px 0 6px 24px; }
  li { margin: 2px 0; }
  .na { color: #9CA3AF; font-style: italic; }
  .phase-header { font-weight: 600; color: #1D4ED8; margin-top: 12px; margin-bottom: 4px; font-size: 10.5pt; }
  .footnote { font-size: 9pt; color: #6B7280; font-style: italic; margin-top: 10px; line-height: 1.5; }

  /* Info tables */
  table.info { border-collapse: collapse; width: 100%; margin: 12px 0; }
  table.info td { border: 1px solid #E5E7EB; padding: 7px 12px; font-size: 10.5pt; }
  .label-cell { background: #EFF6FF; font-weight: 600; color: #1E40AF; width: 38%; }

  /* Control table */
  table.control { border-collapse: collapse; width: 100%; margin-top: 12px; }
  table.control th { background: #1D4ED8; color: white; padding: 8px 10px; font-size: 10pt; text-align: left; }
  table.control td { border: 1px solid #E5E7EB; padding: 7px 10px; font-size: 10pt; background: #F9FAFB; }

  @media print { .section { page-break-inside: avoid; } }
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
  <h1>REQUISITOS DE INFORMACIÓN<br/>DE LA ORGANIZACIÓN</h1>
  <p class="subtitle">(OIR) — ISO 19650-1${mode === 'narrative_only' ? ' — Versión ejecutiva' : ''}</p>
  <table>
    <tr><td>Organización</td><td>${esc(vars.org_name)}</td></tr>
    <tr><td>Proyecto</td><td>${esc(vars.project_name)}</td></tr>
    <tr><td>Versión</td><td>v${esc(vars.doc_version)}</td></tr>
    <tr><td>Fecha</td><td>${esc(vars.doc_date)}</td></tr>
    <tr><td>Estado</td><td>${esc(vars.doc_status)}</td></tr>
    <tr><td>Responsable</td><td>${esc(vars.responsible_name)}</td></tr>
  </table>
</div>

<div class="doc-header">
  <span>OIR — ${esc(vars.org_name)}</span>
  <span>ISO 19650-1 | v${esc(vars.doc_version)} | ${esc(vars.doc_date)}${mode === 'narrative_only' ? ' | Versión ejecutiva' : ''}</span>
</div>

<div class="content">

<!-- SECCIÓN 1 -->
<div class="section">
  <h2>1. Objeto y campo de aplicación</h2>
  ${nar(vars.intro_context ||
    `El presente documento establece los Requisitos de Información de la Organización (OIR) de ${esc(vars.org_name)}, ` +
    `conforme a la norma ISO 19650-1:2018, §5.2. Su propósito es definir la información que la organización ` +
    `necesita para la gestión de sus activos a lo largo del ciclo de vida.`
  )}
  ${data(mode, `
    ${kv('Sector de actividad', vars.sector)}
    ${kv('Ámbito geográfico', vars.country)}
  `)}
</div>
<hr class="divider"/>

<!-- SECCIÓN 2 -->
<div class="section">
  <h2>2. Identificación de la organización</h2>

  <div class="subsection">
    <h3>2.1 Perfil institucional</h3>
    ${nar(vars.s2_1_perfil)}
    ${data(mode, `
      <table class="info">
        <tr><td class="label-cell">Nombre oficial</td><td>${esc(vars.org_name)}</td></tr>
        <tr><td class="label-cell">Tipo de organización</td><td>${esc(vars.org_type)}</td></tr>
        <tr><td class="label-cell">Sector principal</td><td>${esc(vars.sector)}</td></tr>
        <tr><td class="label-cell">País y región de operación</td><td>${esc(vars.country)}</td></tr>
      </table>
    `)}
  </div>

  <div class="subsection">
    <h3>2.2 Estándares BIM reconocidos</h3>
    ${nar(vars.s2_2_estandares)}
    ${data(mode, nl2li(vars.standards_list))}
  </div>

  <div class="subsection">
    <h3>2.3 Responsable de gestión de información</h3>
    ${nar(vars.s2_3_responsable)}
    ${data(mode, kv('Responsable designado', vars.responsible_name))}
  </div>
</div>
<hr class="divider"/>

<!-- SECCIÓN 3 -->
<div class="section">
  <h2>3. Objetivos estratégicos</h2>

  <div class="subsection">
    <h3>3.1 Usos BIM requeridos</h3>
    ${nar(vars.s3_1_usos_bim)}
    ${data(mode, nl2li(vars.bim_uses_list) + pennStateNote())}
  </div>

  <div class="subsection">
    <h3>3.2 Objetivo estratégico principal</h3>
    ${nar(vars.s3_2_objetivo)}
    ${data(mode, vars.strategic_objective ? `<p><strong>Declaración del adjudicador:</strong></p>${blockquote(vars.strategic_objective)}` : '')}
  </div>

  <div class="subsection">
    <h3>3.3 Plan de gestión de activos</h3>
    ${nar(vars.s3_3_plan_activos)}
    ${data(mode, `
      ${kv('¿Dispone de plan de gestión de activos vigente?', vars.has_asset_plan)}
      ${vars.has_asset_plan === 'Sí' ? kv('Norma aplicable del plan', vars.asset_plan_standard) : ''}
    `)}
  </div>

  <div class="subsection">
    <h3>3.4 Obligaciones regulatorias</h3>
    ${nar(vars.s3_4_regulatorio)}
    ${data(mode, `
      ${kv('¿Existen obligaciones regulatorias?', vars.has_regulatory)}
      ${vars.has_regulatory === 'Sí' ? `<p><strong>Descripción:</strong></p><p>${esc(vars.regulatory_description)}</p>` : ''}
    `)}
  </div>
</div>
<hr class="divider"/>

<!-- SECCIÓN 4 -->
<div class="section">
  <h2>4. Requisitos de información del activo</h2>

  <div class="subsection">
    <h3>4.1 Registro de activos</h3>
    ${nar(vars.s4_1_registro)}
    ${data(mode, nl2li(vars.asset_registry_list))}
  </div>

  <div class="subsection">
    <h3>4.2 Operación y mantenimiento</h3>
    ${nar(vars.s4_2_om)}
    ${data(mode, nl2li(vars.om_requirements_list))}
  </div>

  <div class="subsection">
    <h3>4.3 Gestión de riesgos</h3>
    ${nar(vars.s4_3_riesgos)}
    ${data(mode, `
      ${kv('¿Requiere información para gestión de riesgos?', vars.has_risk_mgmt)}
      ${vars.has_risk_mgmt === 'Sí' ? `<p><strong>Tipos de riesgo:</strong></p>${nl2li(vars.risk_types_list)}` : ''}
    `)}
  </div>

  <div class="subsection">
    <h3>4.4 Impactos a gestionar</h3>
    ${nar(vars.s4_4_impactos)}
    ${data(mode, nl2li(vars.impact_types_list))}
  </div>

  <div class="subsection">
    <h3>4.5 Fin de vida útil</h3>
    ${nar(vars.s4_5_eol)}
    ${data(mode, `
      ${kv('¿Requiere información para fin de vida útil?', vars.has_eol)}
      ${vars.has_eol === 'Sí' ? `<p><strong>Información requerida:</strong></p>${nl2li(vars.eol_requirements_list)}` : ''}
    `)}
  </div>
</div>
<hr class="divider"/>

<!-- SECCIÓN 5 -->
<div class="section">
  <h2>5. Estándares y formatos de información</h2>

  <div class="subsection">
    <h3>5.1 Formatos de intercambio aceptados</h3>
    ${nar(vars.s5_1_formatos)}
    ${data(mode, nl2li(vars.exchange_formats_list))}
  </div>

  <div class="subsection">
    <h3>5.2 Sistema de clasificación</h3>
    ${nar(vars.s5_2_clasificacion)}
    ${data(mode, kv('Sistema seleccionado', vars.classification_system))}
  </div>

  <div class="subsection">
    <h3>5.3 Entorno común de datos (CDE)</h3>
    ${nar(vars.s5_3_cde)}
    ${data(mode, `
      ${kv('¿Usa o planea usar CDE?', vars.has_cde)}
      ${vars.has_cde === 'Sí' ? kv('Plataforma CDE', vars.cde_platform) : ''}
    `)}
  </div>

  <div class="subsection">
    <h3>5.4 Nivel de información necesario</h3>
    ${nar(vars.s5_4_nivel_info)}
    ${data(mode, `
      <p class="footnote">Referencia normativa: ISO 19650-1 §11.2</p>
      ${kv('¿Nivel de información necesario definido?', vars.has_lod)}
      ${vars.has_lod === 'Sí' ? kv('Nivel mínimo requerido', vars.lod_level) : ''}
    `)}
  </div>
</div>
<hr class="divider"/>

<!-- SECCIÓN 6 -->
<div class="section">
  <h2>6. Gobernanza de la información</h2>

  <div class="subsection">
    <h3>6.1 Frecuencia de actualización del modelo</h3>
    ${nar(vars.s6_1_frecuencia)}
    ${data(mode, kv('Frecuencia establecida', vars.update_frequency))}
  </div>

  <div class="subsection">
    <h3>6.2 Restricciones de seguridad</h3>
    ${nar(vars.s6_2_seguridad)}
    ${data(mode, `
      ${kv('¿Existen restricciones de seguridad?', vars.has_security)}
      ${vars.has_security === 'Sí' ? `<p><strong>Tipos de restricciones:</strong></p>${nl2li(vars.security_types_list)}` : ''}
    `)}
  </div>

  <div class="subsection">
    <h3>6.3 Política de retención de información</h3>
    ${nar(vars.s6_3_retencion)}
    ${data(mode, kv('Política aplicada', vars.retention_policy))}
  </div>
</div>
<hr class="divider"/>

${vars.observations_text ? `
<!-- SECCIÓN 7 -->
<div class="section">
  <h2>7. Observaciones adicionales</h2>
  ${nar(vars.s7_observaciones)}
  ${data(mode, `<p><strong>Declaración del adjudicador:</strong></p>${blockquote(vars.observations_text)}`)}
</div>
<hr class="divider"/>
` : ''}

${full ? `
<!-- CONTROL DE DOCUMENTO -->
<div class="section">
  <h2>Control de documento</h2>
  <table class="control">
    <tr>
      <th>Versión</th><th>Fecha</th><th>Autor</th><th>Estado</th><th>Descripción del cambio</th>
    </tr>
    <tr>
      <td>v${esc(vars.doc_version)}</td>
      <td>${esc(vars.doc_date)}</td>
      <td>${esc(vars.responsible_name)}</td>
      <td>${esc(vars.doc_status)}</td>
      <td>Versión inicial generada desde BIM Doc Platform</td>
    </tr>
  </table>
</div>
` : ''}

</div>

<div class="doc-footer">
  ${esc(vars.org_name)} &nbsp;|&nbsp; OIR v${esc(vars.doc_version)} &nbsp;|&nbsp; ${esc(vars.doc_date)} &nbsp;|&nbsp; ISO 19650-1
</div>

</body>
</html>`;
}
