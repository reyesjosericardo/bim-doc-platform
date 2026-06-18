/**
 * LLM enrichment for AIR document generation.
 * AIR = Requisitos de Información del Activo. Lo emite el adjudicador para definir
 * qué información debe contener el AIM y cómo se traspasa el PIM al AIM.
 * Genera 6 párrafos normativos (uno por sección).
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIRTemplateVars } from './airMapper';

export interface AIRNarratives {
  intro_context: string;
  s2_fm: string;
  s3_aim: string;
  s4_loin: string;
  s5_handover: string;
  s6_governance: string;
}

export type AIREnrichedVars = AIRTemplateVars & AIRNarratives;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en la redacción de Requisitos de Información del Activo (AIR) conforme a ISO 19650. El AIR lo emite el adjudicador (propietario/operador del activo) para definir la información que necesita gestionar su activo a lo largo de su ciclo de vida, y que debe materializarse en el modelo de información del activo (AIM).

Tu audiencia son los equipos de desarrollo y el adjudicatario principal que entregarán la información. Redacta en tono normativo-contractual.

REGLAS PARA CADA PÁRRAFO:
- Exactamente 3 a 5 oraciones
- Tono normativo: "El adjudicador requiere...", "La información del activo deberá...", "Se establece como requisito..."
- Referencia implícita o explícita a ISO 19650-1 / ISO 19650-3 (gestión del activo)
- Prohibido: "es importante destacar", "cabe mencionar", "cabe señalar"
- Cada párrafo cubre UNA sección

TERMINOLOGÍA OBLIGATORIA ISO 19650:
- "adjudicador" (nunca "cliente")
- "modelo de información del activo (AIM)" / "modelo de información del proyecto (PIM)"
- "entorno común de datos (CDE)"
- "nivel de información necesario (LOIN)" (nunca "LOD")
- "gestión del activo" / "operación y mantenimiento (O&M)"
- "traspaso de información" para PIM → AIM

Redacta en español formal de nivel contractual-profesional.`;

function buildUserPrompt(v: AIRTemplateVars): string {
  return `Genera 6 párrafos para un documento AIR (Requisitos de Información del Activo) conforme a ISO 19650. Activo: "${v.asset_name}" (${v.asset_type}). Facility Manager / responsable: ${v.asset_manager}.

REQUISITOS DEL GESTOR DEL ACTIVO:
- Objetivos de gestión: ${v.mgmt_objectives_list}
- Estándar de gestión de activos: ${v.am_standard}
- Integración con CAFM/CMMS: ${v.has_cafm}${v.has_cafm === 'Sí' ? ` (${v.cafm_system})` : ''}
- Parámetros CAFM/CMMS: ${v.cafm_params}

CONTENIDOS DEL AIM:
- Información a incluir: ${v.aim_contents_list}
- Nomenclatura de espacios: ${v.space_naming} | de sistemas/MEP: ${v.system_naming}
- Plan de puesta en marcha: ${v.has_commissioning} | Costos de reemplazo: ${v.has_replacement_cost}

LOIN DEL ACTIVO:
- ¿Definido?: ${v.has_loin}${v.has_loin === 'Sí' ? ` — geométrica: ${v.loin_geometric}; alfanumérica: ${v.loin_alphanumeric_list}; documental: ${v.loin_documentation_list}` : ''}

FORMATOS Y TRASPASO:
- Formatos del AIM: ${v.aim_formats_list} | COBie: ${v.requires_cobie}
- Momento de traspaso PIM → AIM: ${v.handover_timing}
- Procedimiento de traspaso: ${v.handover_procedure}
- Clasificación: ${v.classification_system}

GOBERNANZA:
- Plataforma de gestión del AIM / CDE: ${v.aim_platform}
- Frecuencia de actualización: ${v.update_frequency} | Retención: ${v.retention_policy}
- Restricciones de seguridad: ${v.has_security}

INSTRUCCIONES POR CAMPO:
- intro_context: Contextualiza este AIR como el documento que define la información necesaria para la gestión del activo "${v.asset_name}" (${v.asset_type}) a lo largo de su ciclo de vida, conforme a ISO 19650. Establece su relación con el AIM. 3-4 oraciones.
- s2_fm: Describe los requisitos del gestor del activo: objetivos de gestión (${v.mgmt_objectives_list}), estándar aplicable (${v.am_standard}) y la integración con el sistema CAFM/CMMS (${v.has_cafm}). Establece que la información debe ser explotable por dichos sistemas. 3-5 oraciones.
- s3_aim: Establece los contenidos que debe incorporar el AIM (${v.aim_contents_list}), incluyendo nomenclaturas de espacios y sistemas, plan de puesta en marcha (${v.has_commissioning}) y costos de reemplazo (${v.has_replacement_cost}). 3-4 oraciones.
- s4_loin: ${v.has_loin === 'Sí' ? `Establece el nivel de información necesario (LOIN) del AIM conforme a ISO 19650-1 §11.2 y EN 17412-1: geométrica (${v.loin_geometric}), alfanumérica (${v.loin_alphanumeric_list}) y documental (${v.loin_documentation_list}). Recalca que el detalle será el necesario para la gestión del activo, sin exceso. 3-5 oraciones.` : 'Establece que el nivel de información necesario (LOIN) del AIM se definirá conforme a EN 17412-1 en sus componentes geométrico, alfanumérico y documental, ajustado al propósito de gestión del activo. 3-4 oraciones.'}
- s5_handover: Define los formatos de entrega del AIM (${v.aim_formats_list}), el requisito de COBie (${v.requires_cobie}) y el procedimiento y momento de traspaso del PIM al AIM (${v.handover_timing}). Referencia ISO 19650-3. 3-4 oraciones.
- s6_governance: Establece la plataforma de gestión del AIM (${v.aim_platform}), la frecuencia de actualización (${v.update_frequency}), la política de retención (${v.retention_policy}) y las restricciones de seguridad de la información (${v.has_security}). 3-4 oraciones.

Responde EXCLUSIVAMENTE con un objeto JSON válido (sin markdown fences):

{
  "intro_context": "...",
  "s2_fm": "...",
  "s3_aim": "...",
  "s4_loin": "...",
  "s5_handover": "...",
  "s6_governance": "..."
}`;
}

function parseNarratives(raw: string): AIRNarratives {
  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const p = JSON.parse(clean);
    return {
      intro_context: p.intro_context || '',
      s2_fm:         p.s2_fm         || '',
      s3_aim:        p.s3_aim        || '',
      s4_loin:       p.s4_loin       || '',
      s5_handover:   p.s5_handover   || '',
      s6_governance: p.s6_governance || '',
    };
  } catch {
    console.error('[LLM] Failed to parse AIR narratives JSON');
    return emptyNarratives();
  }
}

export function emptyNarratives(): AIRNarratives {
  return { intro_context: '', s2_fm: '', s3_aim: '', s4_loin: '', s5_handover: '', s6_governance: '' };
}

export async function enrichAirWithLLM(vars: AIRTemplateVars): Promise<AIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping AIR LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API (6 AIR narratives)...');
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
    console.log('[LLM] AIR narratives parsed successfully');
    return { ...vars, ...narratives };
  } catch (err: any) {
    console.error('[LLM] AIR enrichment failed:', err?.message || err);
    return { ...vars, ...emptyNarratives() };
  }
}
