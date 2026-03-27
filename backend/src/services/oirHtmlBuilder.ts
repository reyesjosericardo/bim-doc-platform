/**
 * Builds a styled HTML string for OIR → PDF rendering via Puppeteer.
 */

import type { OIREnrichedVars } from './oirLLMEnricher';

function nl2li(text: string): string {
  if (!text || text === 'No aplica') return '<em style="color:#6B7280">No aplica</em>';
  const lines = text.split('\n').filter(Boolean);
  if (lines.length === 1) return `<span>${lines[0]}</span>`;
  return `<ol>${lines.map((l) => `<li>${l.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
}

function row(label: string, value: string): string {
  const isEmpty = !value || value === 'No aplica';
  return `
    <tr>
      <td class="label-cell">${label}</td>
      <td class="${isEmpty ? 'na' : ''}">${isEmpty ? 'No aplica' : value}</td>
    </tr>`;
}

function section(num: string, title: string, content: string): string {
  return `
    <div class="section">
      <h2>${num}. ${title}</h2>
      ${content}
    </div>`;
}

function subsection(title: string, content: string): string {
  return `<div class="subsection"><h3>${title}</h3>${content}</div>`;
}

function kv(label: string, value: string): string {
  const isEmpty = !value || value === 'No aplica';
  return `<p><strong>${label}:</strong> <span class="${isEmpty ? 'na' : ''}">${isEmpty ? 'No aplica' : value}</span></p>`;
}

function narrativeHtml(text: string): string {
  if (!text) return '';
  return `<p class="narrative">${text}</p>`;
}

export function buildOirHtml(vars: OIREnrichedVars): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111827; line-height: 1.6; }
  .cover { text-align: center; padding: 80px 60px; page-break-after: always; }
  .cover h1 { font-size: 28pt; color: #1D4ED8; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14pt; color: #6B7280; margin-bottom: 60px; font-style: italic; }
  .cover table { margin: 0 auto; border-collapse: collapse; width: 420px; }
  .cover td { padding: 8px 16px; border: 1px solid #E5E7EB; }
  .cover td:first-child { background: #EFF6FF; font-weight: 600; color: #1D4ED8; width: 150px; }
  .header { background: #1D4ED8; color: white; padding: 8px 20px; font-size: 9pt; display: flex; justify-content: space-between; }
  .footer { border-top: 1px solid #E5E7EB; padding: 8px 20px; font-size: 9pt; color: #6B7280; text-align: center; }
  .content { padding: 20px 30px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  .section h2 { font-size: 14pt; color: #1D4ED8; border-bottom: 2px solid #BFDBFE; padding-bottom: 6px; margin-bottom: 16px; }
  .subsection { margin: 16px 0 12px 0; }
  .subsection h3 { font-size: 11pt; color: #374151; font-weight: 600; margin-bottom: 8px; }
  p { margin: 8px 0; }
  ol { margin: 8px 0 8px 24px; }
  ol li { margin: 2px 0; }
  .na { color: #9CA3AF; font-style: italic; }
  table.info { border-collapse: collapse; width: 100%; margin: 12px 0; }
  table.info td { border: 1px solid #E5E7EB; padding: 7px 12px; font-size: 10.5pt; }
  .label-cell { background: #EFF6FF; font-weight: 600; color: #1E40AF; width: 38%; }
  table.control { border-collapse: collapse; width: 100%; margin-top: 12px; }
  table.control th { background: #1D4ED8; color: white; padding: 8px 10px; font-size: 10pt; text-align: left; }
  table.control td { border: 1px solid #E5E7EB; padding: 7px 10px; font-size: 10pt; background: #F9FAFB; }
  .conditional-block { border-left: 3px solid #BFDBFE; padding-left: 16px; margin: 8px 0; background: #F8FAFF; border-radius: 0 4px 4px 0; }
  .narrative { color: #374151; font-style: italic; margin: 0 0 14px 0; line-height: 1.7; border-left: 3px solid #93C5FD; padding-left: 12px; background: #F0F7FF; border-radius: 0 4px 4px 0; padding: 10px 10px 10px 14px; }
  @media print { .section { page-break-inside: avoid; } }
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
  <h1>REQUISITOS DE INFORMACIÓN<br/>DE LA ORGANIZACIÓN</h1>
  <p class="subtitle">(OIR) — ISO 19650-1</p>
  <table>
    <tr><td>Organización</td><td>${vars.org_name}</td></tr>
    <tr><td>Proyecto</td><td>${vars.project_name}</td></tr>
    <tr><td>Versión</td><td>v${vars.doc_version}</td></tr>
    <tr><td>Fecha</td><td>${vars.doc_date}</td></tr>
    <tr><td>Estado</td><td>${vars.doc_status}</td></tr>
    <tr><td>Responsable</td><td>${vars.responsible_name}</td></tr>
  </table>
</div>

<!-- HEADER repetido en contenido -->
<div class="header">
  <span>OIR — ${vars.org_name}</span>
  <span>ISO 19650-1 | v${vars.doc_version} | ${vars.doc_date}</span>
</div>

<div class="content">

${section('1', 'Objeto y campo de aplicación', `
  <p>El presente documento establece los Requisitos de Información de la Organización (OIR)
  de <strong>${vars.org_name}</strong>, conforme a lo estipulado en la norma ISO 19650-1:2018, §5.2.
  Su propósito es definir la información que la organización necesita para la gestión de sus activos
  a lo largo del ciclo de vida.</p>
  <p>El OIR proporciona la base para la elaboración del AIR (Asset Information Requirements) y el
  EIR (Exchange Information Requirements), y es vinculante para todos los adjudicatarios que participen
  en proyectos de la organización.</p>
  ${kv('Sector de actividad', vars.sector)}
  ${kv('Ámbito geográfico', vars.country)}
  ${subsection('Estándares BIM reconocidos', nl2li(vars.standards_list))}
`)}

${section('2', 'Identificación de la organización', `
  ${narrativeHtml(vars.narrative_identification)}
  <table class="info">
    ${row('Nombre oficial', vars.org_name)}
    ${row('Tipo de organización', vars.org_type)}
    ${row('Sector principal', vars.sector)}
    ${row('País y región de operación', vars.country)}
    ${row('Responsable de gestión', vars.responsible_name)}
  </table>
  ${subsection('Estándares BIM reconocidos', nl2li(vars.standards_list))}
`)}

${section('3', 'Objetivos estratégicos', `
  ${narrativeHtml(vars.narrative_objectives)}
  ${subsection('3.1 Usos BIM requeridos', nl2li(vars.bim_uses_list))}
  ${subsection('3.2 Objetivo estratégico principal', `<p>${vars.strategic_objective}</p>`)}
  ${subsection('3.3 Plan de gestión de activos', `
    ${kv('¿Dispone de plan de gestión de activos vigente?', vars.has_asset_plan)}
    ${vars.has_asset_plan === 'Sí' ? `<div class="conditional-block">${kv('Norma aplicable', vars.asset_plan_standard)}</div>` : ''}
  `)}
  ${subsection('3.4 Obligaciones regulatorias', `
    ${kv('¿Existen obligaciones regulatorias?', vars.has_regulatory)}
    ${vars.has_regulatory === 'Sí' ? `<div class="conditional-block"><p>${vars.regulatory_description}</p></div>` : ''}
  `)}
`)}

${section('4', 'Requisitos de información del activo', `
  ${narrativeHtml(vars.narrative_assets)}
  ${subsection('4.1 Registro de activos', nl2li(vars.asset_registry_list))}
  ${subsection('4.2 Operación y mantenimiento', nl2li(vars.om_requirements_list))}
  ${subsection('4.3 Gestión de riesgos', `
    ${kv('¿Requiere información para gestión de riesgos?', vars.has_risk_mgmt)}
    ${vars.has_risk_mgmt === 'Sí' ? `<div class="conditional-block">${nl2li(vars.risk_types_list)}</div>` : ''}
  `)}
  ${subsection('4.4 Impactos a gestionar', nl2li(vars.impact_types_list))}
  ${subsection('4.5 Fin de vida útil', `
    ${kv('¿Requiere información para fin de vida útil?', vars.has_eol)}
    ${vars.has_eol === 'Sí' ? `<div class="conditional-block">${nl2li(vars.eol_requirements_list)}</div>` : ''}
  `)}
`)}

${section('5', 'Estándares y formatos', `
  ${narrativeHtml(vars.narrative_standards)}
  ${subsection('5.1 Formatos de intercambio de información', nl2li(vars.exchange_formats_list))}
  ${subsection('5.2 Sistema de clasificación', `<p>${vars.classification_system}</p>`)}
  ${subsection('5.3 Entorno común de datos (CDE)', `
    ${kv('¿Usa o planea usar un entorno común de datos?', vars.has_cde)}
    ${vars.has_cde === 'Sí' ? `<div class="conditional-block">${kv('Plataforma CDE', vars.cde_platform)}</div>` : ''}
  `)}
  ${subsection('5.4 Nivel de información (LOD/LOI)', `
    ${kv('¿Tiene definido LOD/LOI para sus activos?', vars.has_lod)}
    ${vars.has_lod === 'Sí' ? `<div class="conditional-block">${kv('Nivel de información geométrica mínimo', vars.lod_level)}</div>` : ''}
  `)}
`)}

${section('6', 'Gobernanza de la información', `
  ${narrativeHtml(vars.narrative_governance)}
  ${subsection('6.1 Frecuencia de actualización del modelo', `<p>${vars.update_frequency}</p>`)}
  ${subsection('6.2 Restricciones de seguridad de la información', `
    ${kv('¿Existen restricciones de seguridad?', vars.has_security)}
    ${vars.has_security === 'Sí' ? `<div class="conditional-block">${nl2li(vars.security_types_list)}</div>` : ''}
  `)}
  ${subsection('6.3 Política de retención de información', `<p>${vars.retention_policy}</p>`)}
`)}

${vars.observations_text ? section('7', 'Observaciones adicionales', `<p>${vars.observations_text}</p>`) : ''}

${section('Control de documento', '', `
  <table class="control">
    <tr>
      <th>Versión</th><th>Fecha</th><th>Autor</th><th>Estado</th><th>Descripción del cambio</th>
    </tr>
    <tr>
      <td>v${vars.doc_version}</td>
      <td>${vars.doc_date}</td>
      <td>${vars.responsible_name}</td>
      <td>${vars.doc_status}</td>
      <td>Versión inicial generada desde BIM Doc Platform</td>
    </tr>
  </table>
`)}

</div>

<div class="footer">
  ${vars.org_name} &nbsp;|&nbsp; OIR v${vars.doc_version} &nbsp;|&nbsp; ${vars.doc_date} &nbsp;|&nbsp; ISO 19650-1
</div>

</body>
</html>`;
}
