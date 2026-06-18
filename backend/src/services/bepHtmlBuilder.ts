/**
 * Sprint 5 — Builds styled HTML for BEP → PDF rendering via Puppeteer.
 */

import type { BEPEnrichedVars } from './bepLLMEnricher';

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
  if (lines.length === 1) return `<span>${esc(lines[0].replace(/^\d+\.\s*/, ''))}</span>`;
  return '<ol>' + lines.map((l) => `<li>${esc(l.replace(/^\d+\.\s*/, ''))}</li>`).join('') + '</ol>';
}

function infoTable(rows: [string, string][]): string {
  return `<table class="info-table"><tbody>${rows.map(([k, v]) => `<tr><td class="key">${esc(k)}</td><td>${esc(v || 'No aplica')}</td></tr>`).join('')}</tbody></table>`;
}

export function buildBepHtml(vars: BEPEnrichedVars): string {
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
  <h1>PLAN DE<br>EJECUCIÓN BIM</h1>
  <p class="subtitle">(BEP) — ISO 19650-2</p>
  <table>
    <tr><td>Proyecto</td><td>${esc(vars.project_name)}</td></tr>
    <tr><td>Adjudicatario principal</td><td>${esc(vars.contractor)}</td></tr>
    <tr><td>Fase del BEP</td><td>${esc(vars.bep_phase)}</td></tr>
    <tr><td>Versión</td><td>v${esc(vars.doc_version)}</td></tr>
    <tr><td>Fecha</td><td>${esc(vars.doc_date)}</td></tr>
    <tr><td>Estado</td><td>${esc(vars.doc_status)}</td></tr>
    <tr><td>BIM Manager</td><td>${esc(vars.bim_manager)}</td></tr>
  </table>
</div>

<!-- Header -->
<div class="doc-header">
  <span>BEP — ${esc(vars.project_name)}</span>
  <span>ISO 19650-2 | v${esc(vars.doc_version)} | ${esc(vars.doc_date)}</span>
</div>

<div class="content">

<!-- Section 1 -->
<div class="section">
  <h2>1. Objeto y alcance del BEP</h2>
  ${nar(vars.intro_context)}
  ${kv('Adjudicatario principal', vars.contractor)}
  ${kv('Fase del BEP', vars.bep_phase)}
  ${kv('EIR / documento de referencia', vars.eir_reference)}
  <p><strong>Objetivos BIM del proyecto:</strong></p>
  ${nl2li(vars.bim_objectives)}
</div>
<hr class="divider"/>

<!-- Section 2 -->
<div class="section">
  <h2>2. Gestión del proyecto BIM</h2>
  ${nar(vars.s2_gestion)}
  ${infoTable([
    ['BIM Manager', vars.bim_manager],
    ['BIM Coordinator', vars.bim_coordinator],
    ['Matriz de responsabilidades definida', vars.has_resp_matrix],
  ])}
  <p><strong>Roles ISO 19650 en el equipo:</strong></p>
  ${nl2li(vars.iso_roles_list)}
  <p><strong>Disciplinas / equipos de tareas:</strong></p>
  ${nl2li(vars.disciplines_list)}
  <p><strong>Cuadro de riesgos BIM:</strong></p>
  ${nl2li(vars.risks_text)}
</div>
<hr class="divider"/>

<!-- Section 3 -->
<div class="section">
  <h2>3. Planificación y documentación</h2>

  <h3>3.1 Estrategia de federación del modelo</h3>
  ${nar(vars.s3_1_federacion)}
  ${nl2li(vars.federation_strategy)}
  <p><strong>Estructura del modelo federado:</strong></p>
  ${nl2li(vars.federated_structure_list)}

  <h3>3.2 Hitos, entregables y planes de entrega</h3>
  ${nar(vars.s3_2_planificacion)}
  <p><strong>Hitos de entrega de información:</strong></p>
  ${nl2li(vars.milestones_list)}
  <p><strong>Entregables comprometidos:</strong></p>
  ${nl2li(vars.deliverables_list)}
  ${kv('Elabora MIDP (Master Information Delivery Plan)', vars.has_midp)}
  ${kv('Elabora TIDP por equipo de tareas', vars.has_tidp)}
</div>
<hr class="divider"/>

<!-- Section 4 -->
<div class="section">
  <h2>4. Estándares y procedimientos</h2>

  <h3>4.1 Nomenclatura, clasificación y formatos</h3>
  ${nar(vars.s4_1_estandares)}
  ${infoTable([
    ['Sistema de nomenclatura', vars.naming_system],
    ['Sistema de clasificación', vars.classification_system],
    ['COBie para O&M', vars.requires_cobie],
  ])}
  <p><strong>Formatos de intercambio:</strong></p>
  ${nl2li(vars.exchange_formats_list)}

  <h3>4.2 Nivel de información necesario (LOIN)</h3>
  <p><em>Referencia normativa: ISO 19650-1 §11.2 y EN17412-1</em></p>
  ${nar(vars.s4_2_loin)}
  ${kv('Información geométrica', vars.loin_geometric)}
  <p><strong>Información alfanumérica:</strong></p>
  ${nl2li(vars.loin_alphanumeric_list)}
  <p><strong>Documentación asociada:</strong></p>
  ${nl2li(vars.loin_documentation_list)}

  <h3>4.3 Detección de conflictos (Clash Detection)</h3>
  ${nar(vars.s4_3_clash)}
  ${kv('¿Se ejecuta clash detection?', vars.has_clash)}
  ${vars.has_clash === 'Sí' ? kv('Frecuencia / hitos de clash detection', vars.clash_frequency) : ''}
</div>
<hr class="divider"/>

<!-- Section 5 -->
<div class="section">
  <h2>5. Entorno común de datos (CDE)</h2>
  ${nar(vars.s5_cde)}
  ${infoTable([
    ['Plataforma CDE', vars.cde_platform],
    ['Estructura de carpetas ISO 19650', vars.requires_iso_folders],
  ])}
  <p><strong>Estados del CDE:</strong></p>
  ${nl2li(vars.cde_states_list)}
  <p><strong>Procedimiento de aprobación / transición de estados:</strong></p>
  ${nl2li(vars.approval_procedure)}
  <p><strong>Política de seguridad y permisos de acceso:</strong></p>
  ${nl2li(vars.security_policy)}
</div>
<hr class="divider"/>

<!-- Section 6 -->
<div class="section">
  <h2>6. Software y hardware</h2>
  ${nar(vars.s6_software)}
  <p><strong>Software de autoría BIM:</strong></p>
  ${nl2li(vars.authoring_software_list)}
  ${kv('Software de coordinación / federación', vars.coordination_software)}
  <p><strong>Versiones de software comprometidas:</strong></p>
  ${nl2li(vars.software_versions)}
  <p><strong>Recursos de hardware / infraestructura:</strong></p>
  ${nl2li(vars.hardware_resources)}
</div>
${vars.observations && vars.observations !== 'No aplica' ? `
<hr class="divider"/>
<div class="section">
  <h3>Observaciones y anexos</h3>
  ${nl2li(vars.observations)}
</div>` : ''}
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
  ${esc(vars.project_name)}  ·  BEP v${esc(vars.doc_version)}  ·  ${esc(vars.doc_date)}  ·  ISO 19650-2
</div>

</body>
</html>`;
}
