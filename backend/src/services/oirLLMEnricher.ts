/**
 * Sprint 3.2 — LLM enrichment for OIR document generation.
 * Generates one focused executive paragraph per sub-section (22 total).
 */

import Anthropic from '@anthropic-ai/sdk';
import type { OIRTemplateVars } from './oirMapper';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface OIRNarratives {
  // Section 1 — intro
  intro_context: string;
  // Section 2 — Identificación
  s2_1_perfil: string;
  s2_2_estandares: string;
  s2_3_responsable: string;
  // Section 3 — Objetivos
  s3_1_usos_bim: string;
  s3_2_objetivo: string;
  s3_3_plan_activos: string;
  s3_4_regulatorio: string;
  // Section 4 — Activos
  s4_1_registro: string;
  s4_2_om: string;
  s4_3_riesgos: string;
  s4_4_impactos: string;
  s4_5_eol: string;
  // Section 5 — Estándares
  s5_1_formatos: string;
  s5_2_clasificacion: string;
  s5_3_cde: string;
  s5_4_nivel_info: string;
  // Section 6 — Gobernanza
  s6_1_frecuencia: string;
  s6_2_seguridad: string;
  s6_3_retencion: string;
  // Section 7 — Observaciones (conditional)
  s7_observaciones: string;
}

export type OIREnrichedVars = OIRTemplateVars & OIRNarratives;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en gestión de información para proyectos de edificación e ingeniería civil, con dominio profundo de la norma ISO 19650 y experiencia asesorando a directorios y juntas directivas de empresas constructoras.

Los documentos que generas son revisados y aprobados por Gerentes Generales, Directores de Proyectos y Gerentes de BIM.

REGLAS PARA CADA PÁRRAFO:
- Exactamente 3 a 5 oraciones
- Comienza directamente con el contenido técnico — sin frases de introducción genéricas
- Cada párrafo cubre UNA sub-sección específica — no repitas información de otras sub-secciones
- Referencia implícita o explícita a ISO 19650-1 o ISO 19650-2 como marco normativo
- Voz activa e institucional: "La organización establece...", "El adjudicador define..."
- Prohibido: "es importante destacar", "cabe mencionar", "es fundamental considerar"

TERMINOLOGÍA OBLIGATORIA ISO 19650:
- "adjudicador" (nunca "cliente" o "contratante")
- "adjudicatario principal" (nunca "contratista")
- "requisitos de información" (nunca "requerimientos")
- "entorno común de datos (CDE)" (nunca "plataforma compartida")
- "contenedor de información" (nunca "archivo BIM")
- "intercambio de información" (nunca "entrega de documentos")
- "nivel de información necesario" (nunca "LOD")
- "modelo de información del proyecto (PIM)" / "modelo de información del activo (AIM)"
- "evento desencadenante" / "punto clave de decisión"

Redacta en español formal de nivel profesional alto.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip §phase markers from bim_uses_list for clean LLM input. */
function cleanBimUses(raw: string): string {
  if (raw === 'No aplica') return 'No aplica';
  return raw
    .split('\n')
    .filter((l) => l && !l.startsWith('§'))
    .map((l) => l.replace(/^\d+\.\s*/, ''))
    .join('; ');
}

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(v: OIRTemplateVars): string {
  const bimUses = cleanBimUses(v.bim_uses_list);

  return `Genera 21 párrafos ejecutivos para un documento OIR (Requisitos de Información de la Organización) conforme a ISO 19650-1. Cada campo del JSON debe contener exactamente UN párrafo de 3 a 5 oraciones para la sub-sección indicada.

DATOS DEL ADJUDICADOR:
- Organización: ${v.org_name} | Tipo: ${v.org_type} | Sector: ${v.sector} | País: ${v.country}
- Responsable de información: ${v.responsible_name}
- Estándares BIM: ${v.standards_list}
- Usos BIM seleccionados: ${bimUses}
- Objetivo estratégico: ${v.strategic_objective}
- Plan de gestión de activos: ${v.has_asset_plan}${v.has_asset_plan === 'Sí' ? ` (norma: ${v.asset_plan_standard})` : ''}
- Obligaciones regulatorias: ${v.has_regulatory}${v.has_regulatory === 'Sí' ? ` — ${v.regulatory_description}` : ''}
- Registro de activos: ${v.asset_registry_list}
- Requisitos O&M: ${v.om_requirements_list}
- Gestión de riesgos: ${v.has_risk_mgmt}${v.has_risk_mgmt === 'Sí' ? ` — ${v.risk_types_list}` : ''}
- Impactos: ${v.impact_types_list}
- Fin de vida útil: ${v.has_eol}${v.has_eol === 'Sí' ? ` — ${v.eol_requirements_list}` : ''}
- Formatos de intercambio: ${v.exchange_formats_list}
- Sistema de clasificación: ${v.classification_system}
- CDE: ${v.has_cde}${v.has_cde === 'Sí' ? ` — ${v.cde_platform}` : ''}
- Nivel de información necesario: ${v.has_lod}${v.has_lod === 'Sí' ? ` — ${v.lod_level}` : ''}
- Frecuencia de actualización: ${v.update_frequency}
- Restricciones de seguridad: ${v.has_security}${v.has_security === 'Sí' ? ` — ${v.security_types_list}` : ''}
- Política de retención: ${v.retention_policy}
${v.observations_text ? `- Observaciones del adjudicador: ${v.observations_text}` : ''}

INSTRUCCIONES POR CAMPO:
- intro_context: Contextualiza este OIR en ISO 19650-1 §5.2. Menciona a ${v.org_name} como adjudicador. 2-3 oraciones.
- s2_1_perfil: Enmarca a ${v.org_name} como adjudicador en el sector ${v.sector} en ${v.country} según ISO 19650-1.
- s2_2_estandares: Justifica técnicamente los estándares seleccionados (${v.standards_list}) para el contexto de la organización.
- s2_3_responsable: Establece el rol normativo del responsable de gestión de información según ISO 19650-2 §5.1.
- s3_1_usos_bim: Contextualiza los usos BIM seleccionados (${bimUses}) en el marco de ISO 19650-2. Menciona específicamente los más relevantes.
- s3_2_objetivo: IMPORTANTE — El adjudicador declaró como objetivo: "${v.strategic_objective}". Eleva este texto a lenguaje ejecutivo técnico ISO 19650, reencuadrándolo en términos del ciclo de vida del activo y los requisitos de información. 3-5 oraciones.
- s3_3_plan_activos: Justifica la relación entre el plan de gestión de activos (${v.has_asset_plan}${v.has_asset_plan === 'Sí' ? `, norma ${v.asset_plan_standard}` : ''}) y los requisitos de información del AIM según ISO 19650-1 §8.
- s3_4_regulatorio: Enmarca las obligaciones regulatorias (${v.has_regulatory}${v.has_regulatory === 'Sí' ? `: ${v.regulatory_description}` : ''}) como condicionantes de los requisitos de información del adjudicador.
- s4_1_registro: Justifica la necesidad de la información de registro de activos para la construcción del AIM según ISO 19650-1 §8.2.
- s4_2_om: Fundamenta los requisitos de información para operación y mantenimiento en el contexto de la transición del PIM al AIM al cierre del proyecto.
- s4_3_riesgos: Enmarca los requisitos de información para gestión de riesgos (${v.has_risk_mgmt}${v.has_risk_mgmt === 'Sí' ? `, tipos: ${v.risk_types_list}` : ''}) en ISO 19650-1.
- s4_4_impactos: Justifica la necesidad de información sobre los impactos a gestionar (${v.impact_types_list}) para la toma de decisiones del adjudicador.
- s4_5_eol: Fundamenta los requisitos de información para el fin de vida útil del activo (${v.has_eol}${v.has_eol === 'Sí' ? `: ${v.eol_requirements_list}` : ''}) según ISO 19650-1.
- s5_1_formatos: Justifica los formatos de intercambio seleccionados (${v.exchange_formats_list}) en términos de interoperabilidad y flujo de trabajo de contenedores según ISO 19650-1 §11.
- s5_2_clasificacion: Explica el rol del sistema de clasificación (${v.classification_system}) en la identificación unívoca de contenedores de información.
- s5_3_cde: ${v.has_cde === 'Sí' ? `Fundamenta cómo el CDE ${v.cde_platform} implementa los estados de flujo del contenedor de información según ISO 19650-2 §5.6.` : 'Fundamenta la necesidad futura de implementar un entorno común de datos (CDE) para la gestión del ciclo de vida del AIM.'}
- s5_4_nivel_info: Establece el ${v.has_lod === 'Sí' ? v.lod_level : 'nivel de información necesario a definir'} como umbral de completitud para los intercambios de información en cada punto clave de decisión, según ISO 19650-1 §11.2.
- s6_1_frecuencia: Justifica la frecuencia de actualización (${v.update_frequency}) del AIM en relación con los eventos desencadenantes de intercambio de información.
- s6_2_seguridad: ${v.has_security === 'Sí' ? `Establece el marco de control de acceso para los contenedores de información con restricciones: ${v.security_types_list}.` : 'Enmarca los principios de acceso controlado a los contenedores de información según ISO 19650-1 §5.3.'}
- s6_3_retencion: Justifica la política de retención (${v.retention_policy}) para la continuidad del AIM a largo plazo conforme a los principios de ISO 19650-1.
${v.observations_text ? `- s7_observaciones: Reencuadra técnicamente en ISO 19650 la siguiente observación del adjudicador: "${v.observations_text}". 3-5 oraciones.` : '- s7_observaciones: "" (campo vacío — no se generan observaciones)'}

Responde EXCLUSIVAMENTE con un objeto JSON válido (sin markdown fences, sin texto antes o después):

{
  "intro_context": "...",
  "s2_1_perfil": "...",
  "s2_2_estandares": "...",
  "s2_3_responsable": "...",
  "s3_1_usos_bim": "...",
  "s3_2_objetivo": "...",
  "s3_3_plan_activos": "...",
  "s3_4_regulatorio": "...",
  "s4_1_registro": "...",
  "s4_2_om": "...",
  "s4_3_riesgos": "...",
  "s4_4_impactos": "...",
  "s4_5_eol": "...",
  "s5_1_formatos": "...",
  "s5_2_clasificacion": "...",
  "s5_3_cde": "...",
  "s5_4_nivel_info": "...",
  "s6_1_frecuencia": "...",
  "s6_2_seguridad": "...",
  "s6_3_retencion": "...",
  "s7_observaciones": "${v.observations_text ? '...' : ''}"
}`;
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function enrichOirWithLLM(vars: OIRTemplateVars): Promise<OIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API (22 sub-section narratives)...');
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(vars) }],
    });

    console.log('[LLM] Response received, stop_reason:', response.stop_reason);

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text block in response');
    }

    const narratives = parseNarratives(textBlock.text);
    console.log('[LLM] Narratives parsed successfully');
    return { ...vars, ...narratives };
  } catch (err: any) {
    console.error('[LLM] Enrichment failed:', err?.message || err);
    return { ...vars, ...emptyNarratives() };
  }
}

function emptyNarratives(): OIRNarratives {
  return {
    intro_context: '',
    s2_1_perfil: '', s2_2_estandares: '', s2_3_responsable: '',
    s3_1_usos_bim: '', s3_2_objetivo: '', s3_3_plan_activos: '', s3_4_regulatorio: '',
    s4_1_registro: '', s4_2_om: '', s4_3_riesgos: '', s4_4_impactos: '', s4_5_eol: '',
    s5_1_formatos: '', s5_2_clasificacion: '', s5_3_cde: '', s5_4_nivel_info: '',
    s6_1_frecuencia: '', s6_2_seguridad: '', s6_3_retencion: '',
    s7_observaciones: '',
  };
}

function parseNarratives(text: string): OIRNarratives {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in LLM response');

  const p = JSON.parse(jsonMatch[0]);
  const s = (key: string) => String(p[key] ?? '');

  return {
    intro_context:      s('intro_context'),
    s2_1_perfil:        s('s2_1_perfil'),
    s2_2_estandares:    s('s2_2_estandares'),
    s2_3_responsable:   s('s2_3_responsable'),
    s3_1_usos_bim:      s('s3_1_usos_bim'),
    s3_2_objetivo:      s('s3_2_objetivo'),
    s3_3_plan_activos:  s('s3_3_plan_activos'),
    s3_4_regulatorio:   s('s3_4_regulatorio'),
    s4_1_registro:      s('s4_1_registro'),
    s4_2_om:            s('s4_2_om'),
    s4_3_riesgos:       s('s4_3_riesgos'),
    s4_4_impactos:      s('s4_4_impactos'),
    s4_5_eol:           s('s4_5_eol'),
    s5_1_formatos:      s('s5_1_formatos'),
    s5_2_clasificacion: s('s5_2_clasificacion'),
    s5_3_cde:           s('s5_3_cde'),
    s5_4_nivel_info:    s('s5_4_nivel_info'),
    s6_1_frecuencia:    s('s6_1_frecuencia'),
    s6_2_seguridad:     s('s6_2_seguridad'),
    s6_3_retencion:     s('s6_3_retencion'),
    s7_observaciones:   s('s7_observaciones'),
  };
}
