/**
 * Sprint 4 — LLM enrichment for EIR document generation.
 * Generates one focused executive paragraph per sub-section (13 total).
 * EIR = "Pliego BIM" contractual — perspective of the adjudicador to adjudicatarios.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { EIRTemplateVars } from './eirMapper';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface EIRNarratives {
  intro_context: string;
  s2_info_previa: string;
  s3_1_entregables: string;
  s3_2_clash: string;
  s4_1_nomenclatura: string;
  s4_2_formatos: string;
  s4_3_software: string;
  s5_1_nivel: string;
  s5_2_componentes: string;
  s5_3_disciplinas: string;
  s6_1_cde: string;
  s6_2_estados: string;
  s6_3_restricciones: string;
}

export type EIREnrichedVars = EIRTemplateVars & EIRNarratives;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un consultor BIM senior especializado en redacción de documentos contractuales BIM (EIR — Requisitos de Intercambio de Información) conforme a ISO 19650-2. Tu audiencia son los adjudicatarios principales y equipos de desarrollo que deben cumplir con estos requisitos durante el diseño y construcción.

El EIR es el "Pliego BIM" — un documento de carácter contractual. Redacta en tono normativo, claro y preciso.

REGLAS PARA CADA PÁRRAFO:
- Exactamente 3 a 5 oraciones
- Tono normativo-contractual: "El adjudicador requiere...", "Los adjudicatarios principales deberán...", "Se establece como requisito..."
- Referencia implícita o explícita a ISO 19650-1 o ISO 19650-2
- Prohibido: "es importante destacar", "cabe mencionar", "cabe señalar"
- Cada párrafo cubre UNA sub-sección específica

TERMINOLOGÍA OBLIGATORIA ISO 19650:
- "adjudicador" (nunca "cliente")
- "adjudicatario principal" (nunca "contratista")
- "equipo de desarrollo" (para el grupo que ejecuta el proyecto)
- "contenedor de información" (nunca "archivo BIM")
- "entorno común de datos (CDE)" (nunca "plataforma compartida")
- "nivel de información necesario (LOIN)" (nunca "LOD")
- "modelo de información del proyecto (PIM)" / "modelo de información del activo (AIM)"
- "plan de ejecución BIM (BEP)" / "plan de ejecución BIM precontractual (PRE-BEP)"
- "hito de entrega de información" / "punto clave de decisión"
- "intercambio de información" (nunca "entrega de archivos")

Redacta en español formal de nivel contractual-profesional.`;

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(v: EIRTemplateVars): string {
  return `Genera 13 párrafos ejecutivos para un documento EIR (Requisitos de Intercambio de Información) conforme a ISO 19650-2. Proyecto: "${v.project_name}", sector: ${v.sector}.

DATOS DEL PROYECTO:
- Descripción: ${v.project_description}
- Fases incluidas: ${v.phases_list}
- BIM Manager del adjudicador: ${v.bim_manager}

INFORMACIÓN PREVIA DISPONIBLE:
- Topográfico: ${v.has_topo} | Geotécnico: ${v.has_geo} | AIM/nube de puntos: ${v.has_aim} | Libro de estilo: ${v.has_style_book}
- Otros documentos: ${v.other_docs}

HITOS Y ENTREGABLES:
- Entregables mínimos: ${v.deliverables_list}
- IFC en cada hito: ${v.requires_ifc}
- Clash detection: ${v.has_clash}${v.has_clash === 'Sí' ? ` (frecuencia: ${v.clash_frequency})` : ''}
- Momento entrega BEP: ${v.bep_timing}

ESTÁNDARES DE INFORMACIÓN:
- Nomenclatura: ${v.naming_system} | Clasificación: ${v.classification_system}
- Formatos de intercambio: ${v.exchange_formats_list}
- Software específico: ${v.requires_software}${v.requires_software === 'Sí' ? ` — ${v.software_versions}` : ''}
- COBie para O&M: ${v.requires_cobie}

LOIN (NIVEL DE INFORMACIÓN NECESARIO):
- Nivel mínimo: ${v.loin_level}
- Componentes: ${v.loin_components_list}
- LOIN por disciplina: ${v.loin_by_discipline}${v.loin_by_discipline === 'Sí' ? ` — ${v.loin_disciplines_list}` : ''}

CDE Y GOBERNANZA:
- Adjudicador provee CDE: ${v.client_provides_cde}${v.client_provides_cde === 'Sí' ? ` — plataforma: ${v.cde_platform}` : ''}
- Estados de flujo: ${v.cde_states_list}
- Estructura carpetas ISO 19650: ${v.requires_iso_folders}
- Restricciones de acceso: ${v.has_restrictions}${v.has_restrictions === 'Sí' ? ` — ${v.restrictions_description}` : ''}

INSTRUCCIONES POR CAMPO:
- intro_context: Contextualiza este EIR como "Pliego BIM" emitido por el adjudicador para el proyecto "${v.project_name}" en el sector ${v.sector}. Establece su carácter contractual según ISO 19650-2. 3-4 oraciones.
- s2_info_previa: Describe la información previa disponible que el adjudicador pone a disposición del equipo de desarrollo (${v.has_topo === 'Sí' ? 'topográfico' : ''}${v.has_geo === 'Sí' ? ', geotécnico' : ''}${v.has_aim === 'Sí' ? ', AIM/nube de puntos' : ''}${v.has_style_book === 'Sí' ? ', libro de estilo' : ''}). Establece que el equipo de desarrollo deberá verificar la vigencia de estos documentos. 3-4 oraciones.
- s3_1_entregables: Establece los entregables mínimos requeridos por el adjudicador en cada hito de entrega de información, incluyendo la obligatoriedad de IFC (${v.requires_ifc}). Referencia ISO 19650-2 §5.6 sobre estados de publicación. 3-5 oraciones.
- s3_2_clash: ${v.has_clash === 'Sí' ? `Establece los requisitos de detección de conflictos (clash detection) con frecuencia ${v.clash_frequency}. Define que el adjudicatario principal es responsable de la coordinación 3D. 3-4 oraciones.` : 'Aunque no se establece un protocolo formal de clash detection como requisito mínimo, el equipo de desarrollo deberá garantizar la coherencia geométrica de los contenedores de información intercambiados. 3-4 oraciones.'}
- s4_1_nomenclatura: Establece el sistema de nomenclatura de archivos (${v.naming_system}) y el sistema de clasificación (${v.classification_system}) como requisitos obligatorios para la identificación unívoca de contenedores de información. 3-4 oraciones.
- s4_2_formatos: Define los formatos de intercambio de información requeridos (${v.exchange_formats_list}) y el requisito de COBie para O&M (${v.requires_cobie}). Establece que el IFC es el formato neutral de archivado para el AIM. 3-4 oraciones.
- s4_3_software: ${v.requires_software === 'Sí' ? `Establece las versiones de software requeridas: ${v.software_versions}. Justifica estos requisitos en términos de interoperabilidad y compatibilidad con el CDE del adjudicador. 3-4 oraciones.` : 'El adjudicador no establece requisitos de versión de software específica, dejando a criterio del adjudicatario principal la selección de herramientas, siempre que se garantice la entrega de contenedores de información en los formatos especificados. 3-4 oraciones.'}
- s5_1_nivel: Establece el ${v.loin_level} como nivel mínimo de información necesario para todos los intercambios de información en puntos clave de decisión, conforme a ISO 19650-1 §11.2 y EN17412-1. Describe las implicaciones contractuales del incumplimiento. 3-5 oraciones.
- s5_2_componentes: Describe los componentes de información requeridos (${v.loin_components_list}) según la estructura LOIN: geométrico, datos alfanuméricos y fichas técnicas. Establece qué debe incluir cada componente en los contenedores de información. 3-4 oraciones.
- s5_3_disciplinas: ${v.loin_by_discipline === 'Sí' ? `El adjudicador establece requisitos LOIN diferenciados para las siguientes disciplinas: ${v.loin_disciplines_list}. Justifica esta diferenciación por la complejidad técnica de cada disciplina. 3-4 oraciones.` : 'El adjudicador establece un nivel de información necesario uniforme para todas las disciplinas del proyecto, simplificando la coordinación entre equipos de trabajo. Los adjudicatarios principales deberán aplicar este nivel a todos los contenedores de información intercambiados. 3-4 oraciones.'}
- s6_1_cde: ${v.client_provides_cde === 'Sí' ? `El adjudicador provee el entorno común de datos (CDE) mediante la plataforma ${v.cde_platform} como infraestructura tecnológica del proyecto. Establece que todos los intercambios de información deben realizarse a través del CDE. 3-4 oraciones.` : 'El adjudicatario principal será responsable de establecer y gestionar el entorno común de datos (CDE) para el proyecto, garantizando el acceso del adjudicador a la zona COMPARTIDO. El CDE deberá implementar los estados de flujo de información requeridos por ISO 19650-2 §5.6. 3-4 oraciones.'}
- s6_2_estados: Establece los estados de flujo de información requeridos en el CDE (${v.cde_states_list}) y la obligatoriedad de la estructura de carpetas ISO 19650 (${v.requires_iso_folders}). Define el protocolo de transición entre estados y las responsabilidades de validación. 3-4 oraciones.
- s6_3_restricciones: ${v.has_restrictions === 'Sí' ? `El adjudicador establece restricciones de acceso a información: ${v.restrictions_description}. Define el protocolo de gestión de acceso en el CDE para contenedores de información restringida. 3-4 oraciones.` : 'El adjudicador establece que los contenedores de información del proyecto serán accesibles a todos los participantes autorizados del equipo de desarrollo, sin restricciones de distribución específicas más allá de las definidas por las reglas de acceso del CDE. 3-4 oraciones.'}

Responde EXCLUSIVAMENTE con un objeto JSON válido (sin markdown fences, sin texto antes o después):

{
  "intro_context": "...",
  "s2_info_previa": "...",
  "s3_1_entregables": "...",
  "s3_2_clash": "...",
  "s4_1_nomenclatura": "...",
  "s4_2_formatos": "...",
  "s4_3_software": "...",
  "s5_1_nivel": "...",
  "s5_2_componentes": "...",
  "s5_3_disciplinas": "...",
  "s6_1_cde": "...",
  "s6_2_estados": "...",
  "s6_3_restricciones": "..."
}`;
}

// ─── Parse narratives ─────────────────────────────────────────────────────────

function parseNarratives(text: string): EIRNarratives {
  const empty = emptyNarratives();
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      intro_context:    parsed.intro_context    || '',
      s2_info_previa:   parsed.s2_info_previa   || '',
      s3_1_entregables: parsed.s3_1_entregables || '',
      s3_2_clash:       parsed.s3_2_clash       || '',
      s4_1_nomenclatura: parsed.s4_1_nomenclatura || '',
      s4_2_formatos:    parsed.s4_2_formatos    || '',
      s4_3_software:    parsed.s4_3_software    || '',
      s5_1_nivel:       parsed.s5_1_nivel       || '',
      s5_2_componentes: parsed.s5_2_componentes || '',
      s5_3_disciplinas: parsed.s5_3_disciplinas || '',
      s6_1_cde:         parsed.s6_1_cde         || '',
      s6_2_estados:     parsed.s6_2_estados     || '',
      s6_3_restricciones: parsed.s6_3_restricciones || '',
    };
  } catch {
    console.error('[LLM] Failed to parse EIR narratives JSON');
    return empty;
  }
}

export function emptyNarratives(): EIRNarratives {
  return {
    intro_context: '', s2_info_previa: '',
    s3_1_entregables: '', s3_2_clash: '',
    s4_1_nomenclatura: '', s4_2_formatos: '', s4_3_software: '',
    s5_1_nivel: '', s5_2_componentes: '', s5_3_disciplinas: '',
    s6_1_cde: '', s6_2_estados: '', s6_3_restricciones: '',
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function enrichEirWithLLM(vars: EIRTemplateVars): Promise<EIREnrichedVars> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('[LLM] ANTHROPIC_API_KEY not set — skipping EIR LLM enrichment');
    return { ...vars, ...emptyNarratives() };
  }

  console.log('[LLM] Calling Anthropic API (13 EIR narratives)...');
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6144,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(vars) }],
    });

    console.log('[LLM] EIR response received, stop_reason:', response.stop_reason);

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text block');

    const narratives = parseNarratives(textBlock.text);
    console.log('[LLM] EIR narratives parsed successfully');
    return { ...vars, ...narratives };
  } catch (err: any) {
    console.error('[LLM] EIR enrichment failed:', err?.message || err);
    return { ...vars, ...emptyNarratives() };
  }
}
