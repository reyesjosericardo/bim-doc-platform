/**
 * Sprint 3 — LLM enrichment for OIR document generation.
 * Sprint 3.1 — Upgraded to executive-level system prompt with ISO 19650 mandatory terminology.
 * Uses Claude to generate professional ISO 19650 technical prose for each section.
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

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en gestión de información para proyectos de edificación e ingeniería civil, con dominio profundo de la norma ISO 19650 y experiencia asesorando a directorios y juntas directivas de empresas constructoras.

Los documentos que generas son revisados y aprobados por Gerentes Generales, Directores de Proyectos y Gerentes de BIM. Por eso:

ESTRUCTURA OBLIGATORIA DE CADA PÁRRAFO (4 a 6 oraciones):
1. Contexto normativo — enmarca el tema en ISO 19650
2. Fundamento técnico — explica el principio o requisito
3. Aplicación específica — lo conecta con los datos del proyecto
4. Implicación estratégica — indica el impacto para la organización

ESTILO DE REDACCIÓN:
- Lenguaje técnico-ejecutivo: preciso, sin ambigüedades
- Voz activa e institucional: "La organización establece...", "El modelo de información requiere...", "El adjudicador define..."
- Nunca usar frases vacías sin justificación inmediata: prohibido "es importante destacar", "cabe mencionar", "es fundamental considerar" sin argumento concreto después
- Cada párrafo debe referenciar implícita o explícitamente ISO 19650-1 o ISO 19650-2 como marco normativo de respaldo
- Profundidad ejecutiva: el lector es un gerente con criterio técnico, no un principiante

TERMINOLOGÍA OBLIGATORIA ISO 19650 — usar siempre estos términos:
- "adjudicador" (NUNCA "cliente" o "contratante")
- "adjudicatario principal" (NUNCA "contratista" o "empresa BIM")
- "requisitos de información" (NUNCA "requerimientos")
- "entorno común de datos (CDE)" (NUNCA "plataforma compartida")
- "contenedor de información" (NUNCA "archivo" o "modelo BIM")
- "intercambio de información" (NUNCA "entrega de documentos")
- "nivel de información necesario" (NUNCA "LOD" como término suelto)
- "modelo de información del proyecto (PIM)"
- "modelo de información del activo (AIM)"
- "evento desencadenante" para referirse a hitos de intercambio
- "punto clave de decisión" para referirse a aprobaciones

Redacta en español formal de nivel profesional alto.`;

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(v: OIRTemplateVars): string {
  // Strip §phase markers for LLM readability
  const bimUsesForLLM = v.bim_uses_list === 'No aplica'
    ? 'No aplica'
    : v.bim_uses_list
        .split('\n')
        .filter((l) => l && !l.startsWith('§'))
        .map((l) => l.replace(/^\d+\.\s*/, ''))
        .join('; ');

  return `Genera cinco párrafos ejecutivos para un documento OIR (Requisitos de Información de la Organización) conforme a ISO 19650-1.

DATOS DEL CUESTIONARIO:
- Organización: ${v.org_name}
- Tipo: ${v.org_type}
- Sector: ${v.sector}
- País: ${v.country}
- Estándares BIM: ${v.standards_list}
- Responsable de información: ${v.responsible_name}
- Usos BIM seleccionados: ${bimUsesForLLM}
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
- Nivel de información necesario: ${v.has_lod}${v.has_lod === 'Sí' ? ` — ${v.lod_level}` : ''}
- Frecuencia de actualización: ${v.update_frequency}
- Restricciones de seguridad: ${v.has_security}${v.has_security === 'Sí' ? ` — tipos: ${v.security_types_list}` : ''}
- Política de retención: ${v.retention_policy}

INSTRUCCIONES POR SECCIÓN:

Sección "narrative_identification" — Identificación de la organización:
Enmarca el rol de ${v.org_name} como adjudicador según ISO 19650-1. Justifica técnicamente por qué los estándares seleccionados son adecuados para el sector ${v.sector} en el contexto geográfico de ${v.country}. Establece la responsabilidad de gestión de información en términos normativos. Indica la implicación estratégica para el equipo de desarrollo del modelo de información del activo (AIM).

Sección "narrative_objectives" — Objetivos estratégicos y usos BIM:
Contextualiza los usos BIM seleccionados (${bimUsesForLLM}) dentro del marco de ISO 19650-2 para la fase de adjudicación y entrega. Justifica cómo estos usos BIM responden al objetivo estratégico de la organización. Explica la relación entre los usos BIM y los eventos desencadenantes de intercambio de información. Menciona específicamente los usos BIM más relevantes por su impacto en el modelo de información del proyecto (PIM).

Sección "narrative_assets" — Requisitos de información del activo:
Enmarca los requisitos de información del activo en el ciclo de vida completo según ISO 19650-1 §8. Justifica técnicamente la necesidad de información para operación, mantenimiento y gestión de riesgos. Conecta los requisitos O&M con la transición del PIM al AIM al cierre del proyecto. Indica la implicación estratégica de contar con un AIM completo para la toma de decisiones del adjudicador.

Sección "narrative_standards" — Estándares y formatos:
Enmarca los formatos de intercambio seleccionados (${v.exchange_formats_list}) en el contexto de la interoperabilidad requerida por ISO 19650-1 §11. Justifica técnicamente la selección del sistema de clasificación ${v.classification_system} y su rol en la identificación unívoca de contenedores de información. ${v.has_cde === 'Sí' ? `Explica cómo el entorno común de datos (CDE) ${v.cde_platform} implementa los estados de flujo de trabajo del contenedor de información según ISO 19650-2 §5.6.` : 'Fundamenta la necesidad de implementar un entorno común de datos (CDE) para garantizar el control de acceso y trazabilidad de los contenedores de información.'} ${v.has_lod === 'Sí' ? `Establece la relevancia del ${v.lod_level} como umbral mínimo de completitud para los intercambios de información en cada punto clave de decisión.` : ''}

Sección "narrative_governance" — Gobernanza de la información:
Enmarca la gobernanza de la información en los principios de ISO 19650-1 §5.3 sobre responsabilidades del adjudicador. Justifica técnicamente la frecuencia de actualización del modelo de información del activo (${v.update_frequency}) en relación con los eventos desencadenantes definidos. ${v.has_security === 'Sí' ? `Establece el marco de control de acceso y restricciones de seguridad aplicables a los contenedores de información sensible.` : ''} Indica la implicación estratégica de la política de retención de información (${v.retention_policy}) para la continuidad operativa del AIM a largo plazo.

Responde EXCLUSIVAMENTE con un objeto JSON válido con estas 5 claves (sin texto adicional antes ni después, sin markdown fences):

{
  "narrative_identification": "párrafo ejecutivo de 4-6 oraciones para identificación de la organización",
  "narrative_objectives": "párrafo ejecutivo de 4-6 oraciones para objetivos estratégicos y usos BIM",
  "narrative_assets": "párrafo ejecutivo de 4-6 oraciones para requisitos de información del activo",
  "narrative_standards": "párrafo ejecutivo de 4-6 oraciones para estándares y formatos",
  "narrative_governance": "párrafo ejecutivo de 4-6 oraciones para gobernanza de la información"
}`;
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Generates professional executive-level narratives for each OIR section.
 * Falls back to empty strings if the API key is not configured or the call fails.
 */
export async function enrichOirWithLLM(vars: OIRTemplateVars): Promise<OIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API...');
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
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
    narrative_identification: '',
    narrative_objectives: '',
    narrative_assets: '',
    narrative_standards: '',
    narrative_governance: '',
  };
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
