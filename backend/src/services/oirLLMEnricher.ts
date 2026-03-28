/**
 * Sprint 3 — LLM enrichment for OIR document generation.
 * Uses Claude Opus 4.6 (adaptive thinking) to generate professional ISO 19650
 * technical prose for each section before the structured answers.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { OIRTemplateVars } from './oirMapper';

export interface OIRNarratives {
  narrative_identification: string;
  narrative_objectives: string;
  narrative_assets: string;
  narrative_standards: string;
  narrative_governance: string;
}

export type OIREnrichedVars = OIRTemplateVars & OIRNarratives;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generates professional technical narratives for each OIR section.
 * Falls back to empty strings if the API key is not configured or the call fails.
 */
export async function enrichOirWithLLM(vars: OIRTemplateVars): Promise<OIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  const prompt = buildPrompt(vars);

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text block in response');
    }

    const narratives = parseNarratives(textBlock.text);
    return { ...vars, ...narratives };
  } catch (err) {
    console.error('[LLM] Enrichment failed:', err);
    return { ...vars, ...emptyNarratives() };
  }
}

function emptyNarratives(): OIRNarratives {
  return {
    narrative_identification: '',
    narrative_objectives: '',
    narrative_assets: '',
    narrative_standards: '',
    narrative_governance: '',
  };
}

function buildPrompt(v: OIRTemplateVars): string {
  return `Eres un redactor técnico especializado en gestión de información BIM e ISO 19650.
Tu tarea es generar texto técnico profesional en español para un documento OIR (Requisitos de Información de la Organización) basado en las respuestas del cuestionario.

Para cada sección, escribe un párrafo introductorio de 3-5 oraciones en tono formal que contextualice y dé coherencia técnica a las respuestas. El texto debe sonar como redacción profesional de un documento de ingeniería, no como una lista de respuestas.

DATOS DEL CUESTIONARIO:
- Organización: ${v.org_name}
- Tipo: ${v.org_type}
- Sector: ${v.sector}
- País: ${v.country}
- Estándares BIM: ${v.standards_list}
- Responsable: ${v.responsible_name}
- Usos BIM: ${v.bim_uses_list}
- Objetivo estratégico: ${v.strategic_objective}
- Plan de gestión de activos: ${v.has_asset_plan}${v.has_asset_plan === 'Sí' ? ` (norma: ${v.asset_plan_standard})` : ''}
- Obligaciones regulatorias: ${v.has_regulatory}${v.has_regulatory === 'Sí' ? ` — ${v.regulatory_description}` : ''}
- Registro de activos: ${v.asset_registry_list}
- Requisitos O&M: ${v.om_requirements_list}
- Gestión de riesgos: ${v.has_risk_mgmt}${v.has_risk_mgmt === 'Sí' ? ` — tipos: ${v.risk_types_list}` : ''}
- Impactos a gestionar: ${v.impact_types_list}
- Fin de vida útil: ${v.has_eol}${v.has_eol === 'Sí' ? ` — ${v.eol_requirements_list}` : ''}
- Formatos de intercambio: ${v.exchange_formats_list}
- Sistema de clasificación: ${v.classification_system}
- CDE: ${v.has_cde}${v.has_cde === 'Sí' ? ` — plataforma: ${v.cde_platform}` : ''}
- LOD/LOI definido: ${v.has_lod}${v.has_lod === 'Sí' ? ` — nivel: ${v.lod_level}` : ''}
- Frecuencia de actualización: ${v.update_frequency}
- Restricciones de seguridad: ${v.has_security}${v.has_security === 'Sí' ? ` — tipos: ${v.security_types_list}` : ''}
- Política de retención: ${v.retention_policy}

Responde EXCLUSIVAMENTE con un objeto JSON válido con estas 5 claves (sin texto adicional antes ni después):

{
  "narrative_identification": "párrafo para la sección de identificación de la organización",
  "narrative_objectives": "párrafo para la sección de objetivos estratégicos y usos BIM",
  "narrative_assets": "párrafo para la sección de requisitos de información del activo",
  "narrative_standards": "párrafo para la sección de estándares y formatos de intercambio",
  "narrative_governance": "párrafo para la sección de gobernanza de la información"
}`;
}

function parseNarratives(text: string): OIRNarratives {
  // Extract JSON block from the response (handle potential markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in LLM response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    narrative_identification: String(parsed.narrative_identification ?? ''),
    narrative_objectives:     String(parsed.narrative_objectives ?? ''),
    narrative_assets:         String(parsed.narrative_assets ?? ''),
    narrative_standards:      String(parsed.narrative_standards ?? ''),
    narrative_governance:     String(parsed.narrative_governance ?? ''),
  };
}
