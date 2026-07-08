/**
 * Sprint 5 — LLM enrichment for BEP document generation.
 * Generates one focused professional paragraph per section (9 total).
 * BEP = Plan de Ejecución BIM — perspective of the adjudicatario principal answering the EIR.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { BEPTemplateVars } from './bepMapper';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface BEPNarratives {
  intro_context: string;
  s2_gestion: string;
  s3_1_federacion: string;
  s3_2_planificacion: string;
  s4_1_estandares: string;
  s4_2_loin: string;
  s4_3_clash: string;
  s5_cde: string;
  s6_software: string;
}

export type BEPEnrichedVars = BEPTemplateVars & BEPNarratives;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en la redacción de Planes de Ejecución BIM (BEP) conforme a ISO 19650-2. El BEP es el documento que el ADJUDICATARIO PRINCIPAL redacta como respuesta al EIR del adjudicador, comprometiéndose a una forma concreta de ejecutar el proceso BIM.

Tu audiencia es el adjudicador (cliente) que evaluará y aprobará este BEP. Redacta en tono propositivo y comprometido: el equipo de desarrollo declara cómo ejecutará el proyecto.

REGLAS PARA CADA PÁRRAFO:
- Exactamente 3 a 5 oraciones
- Tono propositivo-compromiso: "El equipo de desarrollo implementará...", "El adjudicatario principal se compromete a...", "Se establece el siguiente procedimiento..."
- Referencia implícita o explícita a ISO 19650-1 o ISO 19650-2
- Prohibido: "es importante destacar", "cabe mencionar", "cabe señalar"
- Cada párrafo cubre UNA sección específica

TERMINOLOGÍA OBLIGATORIA ISO 19650:
- "adjudicador" (nunca "cliente")
- "adjudicatario principal" (nunca "contratista")
- "equipo de desarrollo" (para el grupo que ejecuta el proyecto)
- "equipo de tareas" (para cada equipo de trabajo por disciplina)
- "contenedor de información" (nunca "archivo BIM")
- "entorno común de datos (CDE)" (nunca "plataforma compartida")
- "nivel de información necesario (LOIN)" (nunca "LOD")
- "modelo de información del proyecto (PIM)" / "modelo de información del activo (AIM)"
- "plan de ejecución BIM (BEP)" / "plan de ejecución BIM precontractual (PRE-BEP)"
- "matriz de responsabilidades" / "MIDP (Master Information Delivery Plan)" / "TIDP (Task Information Delivery Plan)"
- "hito de entrega de información" / "punto clave de decisión"

Redacta en español formal de nivel profesional-contractual.`;

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(v: BEPTemplateVars): string {
  return `Genera 9 párrafos profesionales para un Plan de Ejecución BIM (BEP) conforme a ISO 19650-2. Proyecto: "${v.project_name}". Fase del BEP: ${v.bep_phase}. Adjudicatario principal: ${v.contractor}.

GESTIÓN Y EQUIPO:
- BIM Manager: ${v.bim_manager}
- BIM Coordinator: ${v.bim_coordinator}
- Roles ISO 19650 en el equipo: ${v.iso_roles_list}
- Disciplinas / equipos de tareas: ${v.disciplines_list}
- Matriz de responsabilidades definida: ${v.has_resp_matrix}
- Cuadro de riesgos BIM: ${v.risks_text}
- Objetivos BIM del proyecto: ${v.bim_objectives}
- EIR de referencia: ${v.eir_reference}

PLANIFICACIÓN Y DOCUMENTACIÓN:
- Estrategia de federación del modelo: ${v.federation_strategy}
- Estructura del modelo federado: ${v.federated_structure_list}
- Hitos de entrega de información: ${v.milestones_list}
- Entregables comprometidos: ${v.deliverables_list}
- Elabora MIDP: ${v.has_midp} | Elabora TIDP por equipo: ${v.has_tidp}

ESTÁNDARES Y PROCEDIMIENTOS:
- Nomenclatura: ${v.naming_system} | Clasificación: ${v.classification_system}
- Nivel de información necesario (LOIN) — geométrica: ${v.loin_geometric}; alfanumérica: ${v.loin_alphanumeric_list}; documental: ${v.loin_documentation_list}
- Formatos de intercambio: ${v.exchange_formats_list}
- COBie para O&M: ${v.requires_cobie}
- Detección de conflictos (clash): ${v.has_clash}${v.has_clash === 'Sí' ? ` (frecuencia: ${v.clash_frequency})` : ''}

ENTORNO COMÚN DE DATOS (CDE):
- Plataforma CDE: ${v.cde_platform}
- Estados del CDE: ${v.cde_states_list}
- Estructura de carpetas ISO 19650: ${v.requires_iso_folders}
- Procedimiento de aprobación / transición de estados: ${v.approval_procedure}
- Política de seguridad y permisos: ${v.security_policy}

SOFTWARE Y HARDWARE:
- Software de autoría BIM: ${v.authoring_software_list}
- Software de coordinación/federación: ${v.coordination_software}
- Versiones comprometidas: ${v.software_versions}
- Recursos de hardware: ${v.hardware_resources}

INSTRUCCIONES POR CAMPO:
- intro_context: Presenta este BEP como ${v.bep_phase === 'Contractual' ? 'el plan de ejecución BIM contractual' : 'el plan de ejecución BIM precontractual (PRE-BEP)'} elaborado por el adjudicatario principal "${v.contractor}" como respuesta al EIR del proyecto "${v.project_name}". Declara su carácter y los objetivos BIM perseguidos. 3-4 oraciones.
- s2_gestion: Describe la estructura de gestión del equipo de desarrollo: el BIM Manager (${v.bim_manager}), el BIM Coordinator (${v.bim_coordinator}), los roles ISO 19650 asignados y los equipos de tareas por disciplina. Indica si existe matriz de responsabilidades (${v.has_resp_matrix}) y cómo se gestionan los riesgos BIM. 3-5 oraciones.
- s3_1_federacion: Explica la estrategia de federación del modelo de información del proyecto (PIM) y la estructura del modelo federado por disciplinas/zonas. Justifica la división adoptada en términos de coordinación y rendimiento. 3-4 oraciones.
- s3_2_planificacion: Describe la planificación de entregas: los hitos de entrega de información, los entregables comprometidos, y la elaboración del MIDP (${v.has_midp}) coordinando los TIDP de cada equipo de tareas (${v.has_tidp}). Referencia ISO 19650-2 §5.4. 3-5 oraciones.
- s4_1_estandares: Establece los estándares de información que aplicará el equipo de desarrollo: sistema de nomenclatura (${v.naming_system}), clasificación (${v.classification_system}) y formatos de intercambio (${v.exchange_formats_list}), incluyendo COBie para O&M (${v.requires_cobie}). 3-4 oraciones.
- s4_2_loin: Describe el nivel de información necesario (LOIN) que el equipo de desarrollo entregará en cada punto clave de decisión, conforme a ISO 19650-1 §11.2 y EN17412-1, articulado en sus tres componentes: información geométrica (${v.loin_geometric}), información alfanumérica (${v.loin_alphanumeric_list}) y documentación asociada (${v.loin_documentation_list}). Recalca que el detalle será el necesario para el propósito, sin exceso. 3-5 oraciones.
- s4_3_clash: ${v.has_clash === 'Sí' ? `Describe el procedimiento de detección de conflictos (clash detection) que ejecutará el equipo de desarrollo con frecuencia ${v.clash_frequency}, las matrices de choque entre disciplinas y el agente responsable de la coordinación 3D. 3-4 oraciones.` : 'Aunque no se establece un protocolo formal de detección de conflictos como compromiso, el equipo de desarrollo garantizará la coherencia geométrica de los contenedores de información mediante revisiones de coordinación periódicas. 3-4 oraciones.'}
- s5_cde: Describe el entorno común de datos (CDE) que utilizará el proyecto (${v.cde_platform}), los estados de flujo de información, la estructura de carpetas ISO 19650 (${v.requires_iso_folders}) y el procedimiento de transición y aprobación entre estados (WIP → Compartido → Publicado). Referencia ISO 19650-2 §5.6. 3-5 oraciones.
- s6_software: Detalla la propuesta tecnológica del equipo de desarrollo: software de autoría BIM por disciplina (${v.authoring_software_list}), software de coordinación/federación (${v.coordination_software}), versiones comprometidas y recursos de hardware. Justifica la interoperabilidad de la solución. 3-4 oraciones.

Responde EXCLUSIVAMENTE con un objeto JSON válido (sin markdown fences, sin texto antes o después):

{
  "intro_context": "...",
  "s2_gestion": "...",
  "s3_1_federacion": "...",
  "s3_2_planificacion": "...",
  "s4_1_estandares": "...",
  "s4_2_loin": "...",
  "s4_3_clash": "...",
  "s5_cde": "...",
  "s6_software": "..."
}`;
}

// ─── Parse narratives ─────────────────────────────────────────────────────────

function parseNarratives(text: string): BEPNarratives {
  const empty = emptyNarratives();
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      intro_context:      parsed.intro_context      || '',
      s2_gestion:         parsed.s2_gestion         || '',
      s3_1_federacion:    parsed.s3_1_federacion    || '',
      s3_2_planificacion: parsed.s3_2_planificacion || '',
      s4_1_estandares:    parsed.s4_1_estandares    || '',
      s4_2_loin:          parsed.s4_2_loin          || '',
      s4_3_clash:         parsed.s4_3_clash         || '',
      s5_cde:             parsed.s5_cde             || '',
      s6_software:        parsed.s6_software        || '',
    };
  } catch {
    console.error('[LLM] Failed to parse BEP narratives JSON');
    return empty;
  }
}

export function emptyNarratives(): BEPNarratives {
  return {
    intro_context: '', s2_gestion: '',
    s3_1_federacion: '', s3_2_planificacion: '',
    s4_1_estandares: '', s4_2_loin: '', s4_3_clash: '',
    s5_cde: '', s6_software: '',
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function enrichBepWithLLM(vars: BEPTemplateVars): Promise<BEPEnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping BEP LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API (9 BEP narratives)...');
  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 6144,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(vars) }],
    });

    console.log('[LLM] BEP response received, stop_reason:', response.stop_reason);

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text block');

    const narratives = parseNarratives(textBlock.text);
    console.log('[LLM] BEP narratives parsed successfully');
    return { ...vars, ...narratives };
  } catch (err: any) {
    console.error('[LLM] BEP enrichment failed:', err?.message || err);
    return { ...vars, ...emptyNarratives() };
  }
}
