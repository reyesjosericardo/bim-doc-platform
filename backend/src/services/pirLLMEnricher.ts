/**
 * LLM enrichment for PIR document generation.
 * PIR = Requisitos de Información del Proyecto. Lo emite el adjudicador antes de la
 * licitación para fijar los objetivos estratégicos de la inversión y los puntos
 * clave de decisión. Genera 5 párrafos normativos (uno por sección).
 */

import Anthropic from '@anthropic-ai/sdk';
import type { PIRTemplateVars } from './pirMapper';

export interface PIRNarratives {
  intro_context: string;
  s2_objectives: string;
  s3_decisions: string;
  s4_loin: string;
  s5_delivery: string;
}

export type PIREnrichedVars = PIRTemplateVars & PIRNarratives;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en la redacción de Requisitos de Información del Proyecto (PIR) conforme a ISO 19650. El PIR lo emite el adjudicador antes de la licitación para expresar los objetivos estratégicos de una inversión concreta y los puntos clave de decisión en los que necesita información.

Tu audiencia son los equipos que prepararán el EIR y los adjudicatarios. Redacta en tono normativo-estratégico.

REGLAS PARA CADA PÁRRAFO:
- Exactamente 3 a 5 oraciones
- Tono: "El adjudicador persigue...", "En cada punto clave de decisión se requerirá...", "Se establece como objetivo..."
- Referencia implícita o explícita a ISO 19650-1 (PIR alimenta el EIR)
- Prohibido: "es importante destacar", "cabe mencionar", "cabe señalar"
- Cada párrafo cubre UNA sección

TERMINOLOGÍA OBLIGATORIA ISO 19650:
- "adjudicador" (nunca "cliente")
- "punto clave de decisión" / "hito de entrega de información"
- "nivel de información necesario (LOIN)" (nunca "LOD")
- "modelo de información del proyecto (PIM)"
- "requisitos de intercambio de información (EIR)"

Redacta en español formal de nivel estratégico-profesional.`;

function buildUserPrompt(v: PIRTemplateVars): string {
  return `Genera 5 párrafos para un documento PIR (Requisitos de Información del Proyecto) conforme a ISO 19650. Proyecto: "${v.project_name}" (${v.sector}). Responsable del adjudicador: ${v.client_lead}.

ALCANCE DE LA INVERSIÓN: ${v.investment_scope}
OIR de referencia: ${v.oir_reference}

OBJETIVOS ESTRATÉGICOS:
- Objetivos: ${v.strategic_objectives_list}
- Presupuesto objetivo: ${v.budget_target} | Plazo objetivo: ${v.schedule_target}
- Sostenibilidad/energía: ${v.sustainability_goals}
- Certificación ambiental: ${v.has_certification}${v.has_certification === 'Sí' ? ` (${v.certification})` : ''}

HITOS Y DECISIONES:
- Hitos de decisión clave: ${v.decision_milestones_list}
- Preguntas clave por hito: ${v.key_questions}
- Modelos para decisiones: ${v.requires_models}
- Información para la toma de decisiones: ${v.decision_info_list}

LOIN DEL PROYECTO:
- ¿Definido?: ${v.has_loin}${v.has_loin === 'Sí' ? ` — geométrica: ${v.loin_geometric}; alfanumérica: ${v.loin_alphanumeric_list}; documental: ${v.loin_documentation_list}` : ''}

GESTIÓN Y ENTREGA:
- Usos BIM prioritarios: ${v.bim_uses_list}
- Formatos de intercambio: ${v.exchange_formats_list}
- Plan de transición a operación (AIR/AIM): ${v.has_transition}
- Restricciones / condicionantes: ${v.constraints}

INSTRUCCIONES POR CAMPO:
- intro_context: Contextualiza este PIR como el documento que fija las necesidades de información del adjudicador para la inversión "${v.project_name}" (${v.sector}) y que alimentará el EIR, conforme a ISO 19650-1. 3-4 oraciones.
- s2_objectives: Describe los objetivos estratégicos de la inversión (${v.strategic_objectives_list}), incluyendo presupuesto (${v.budget_target}), plazo (${v.schedule_target}) y metas de sostenibilidad${v.has_certification === 'Sí' ? ` con certificación ${v.certification}` : ''}. Establece que la información del proyecto debe permitir verificar su cumplimiento. 3-5 oraciones.
- s3_decisions: Establece los puntos clave de decisión del proyecto (${v.decision_milestones_list}) y la información que el adjudicador necesita en cada uno para decidir (${v.decision_info_list}), incluyendo el uso de modelos (${v.requires_models}). 3-5 oraciones.
- s4_loin: ${v.has_loin === 'Sí' ? `Establece el nivel de información necesario (LOIN) por punto de decisión conforme a ISO 19650-1 §11.2 y EN 17412-1: geométrica (${v.loin_geometric}), alfanumérica (${v.loin_alphanumeric_list}) y documental (${v.loin_documentation_list}). Recalca que el detalle será el necesario para decidir, sin exceso. 3-5 oraciones.` : 'Establece que el nivel de información necesario (LOIN) se definirá por punto de decisión conforme a EN 17412-1 en sus componentes geométrico, alfanumérico y documental, ajustado al propósito de cada decisión. 3-4 oraciones.'}
- s5_delivery: Define los usos BIM prioritarios (${v.bim_uses_list}), los formatos de intercambio (${v.exchange_formats_list}) y la previsión de transición a la fase de operación (${v.has_transition}), estableciendo que estos requisitos se concretarán en el EIR. 3-4 oraciones.

Responde EXCLUSIVAMENTE con un objeto JSON válido (sin markdown fences):

{
  "intro_context": "...",
  "s2_objectives": "...",
  "s3_decisions": "...",
  "s4_loin": "...",
  "s5_delivery": "..."
}`;
}

function parseNarratives(raw: string): PIRNarratives {
  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const p = JSON.parse(clean);
    return {
      intro_context: p.intro_context || '',
      s2_objectives: p.s2_objectives || '',
      s3_decisions:  p.s3_decisions  || '',
      s4_loin:       p.s4_loin       || '',
      s5_delivery:   p.s5_delivery   || '',
    };
  } catch {
    console.error('[LLM] Failed to parse PIR narratives JSON');
    return emptyNarratives();
  }
}

export function emptyNarratives(): PIRNarratives {
  return { intro_context: '', s2_objectives: '', s3_decisions: '', s4_loin: '', s5_delivery: '' };
}

export async function enrichPirWithLLM(vars: PIRTemplateVars): Promise<PIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping PIR LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API (5 PIR narratives)...');
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(vars) }],
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text block');
    const narratives = parseNarratives(textBlock.text);
    console.log('[LLM] PIR narratives parsed successfully');
    return { ...vars, ...narratives };
  } catch (err: any) {
    console.error('[LLM] PIR enrichment failed:', err?.message || err);
    return { ...vars, ...emptyNarratives() };
  }
}
