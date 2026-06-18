import { mapBepAnswersToVars } from '../services/bepMapper';

const META = { project_name: 'Proyecto BEP Test', version: 1, status: 'aprobado' };

// Full set of answers (all 34 questions answered)
const FULL_ANSWERS = [
  { question_id: 'BEP-1.1', answer_value: 'Proyecto BEP Test' },
  { question_id: 'BEP-1.2', answer_value: 'Constructora Demo S.A.' },
  { question_id: 'BEP-1.3', answer_value: 'contractual' },
  { question_id: 'BEP-1.4', answer_value: 'EIR v2 del adjudicador' },
  { question_id: 'BEP-1.5', answer_value: 'Coordinación 3D y entrega As-Built' },
  { question_id: 'BEP-2.1', answer_value: 'Laura Méndez' },
  { question_id: 'BEP-2.2', answer_value: 'Carlos Ruiz' },
  { question_id: 'BEP-2.3', answer_value: 'Adjudicatario principal|Equipo de tareas' },
  { question_id: 'BEP-2.4', answer_value: 'Arquitectura|Estructuras|Instalaciones MEP' },
  { question_id: 'BEP-2.5', answer_value: 'Sí' },
  { question_id: 'BEP-2.6', answer_value: 'Riesgo de interoperabilidad entre software' },
  { question_id: 'BEP-3.1', answer_value: 'Federación por disciplinas con modelo central' },
  { question_id: 'BEP-3.2', answer_value: 'ARQ|EST|MEP' },
  { question_id: 'BEP-3.3', answer_value: 'Proyecto Básico|Proyecto de Ejecución' },
  { question_id: 'BEP-3.4', answer_value: 'Modelos|Planos|Mediciones' },
  { question_id: 'BEP-3.5', answer_value: 'Sí' },
  { question_id: 'BEP-3.6', answer_value: 'Sí' },
  { question_id: 'BEP-4.1', answer_value: 'ISO 19650 + código propio' },
  { question_id: 'BEP-4.2', answer_value: 'GuBIMclass' },
  { question_id: 'BEP-4.3', answer_value: 'especifico' },
  { question_id: 'BEP-4.4', answer_value: 'Propiedades técnicas y funcionales|Datos de operación y mantenimiento' },
  { question_id: 'BEP-4.5', answer_value: 'Fichas técnicas|Manuales de operación y mantenimiento' },
  { question_id: 'BEP-4.6', answer_value: 'IFC|RVT|PDF' },
  { question_id: 'BEP-4.7', answer_value: 'Sí' },
  { question_id: 'BEP-4.8', answer_value: 'Quincenal' },
  { question_id: 'BEP-4.9', answer_value: 'Sí' },
  { question_id: 'BEP-5.1', answer_value: 'Autodesk Construction Cloud' },
  { question_id: 'BEP-5.2', answer_value: 'WIP|Compartido|Publicado|Archivado' },
  { question_id: 'BEP-5.3', answer_value: 'Sí' },
  { question_id: 'BEP-5.4', answer_value: 'Aprobación por BIM Coordinator antes de Compartido' },
  { question_id: 'BEP-5.5', answer_value: 'Permisos por rol y disciplina' },
  { question_id: 'BEP-6.1', answer_value: 'Revit|Civil 3D' },
  { question_id: 'BEP-6.2', answer_value: 'Navisworks' },
  { question_id: 'BEP-6.3', answer_value: 'Revit 2024, Navisworks 2024' },
  { question_id: 'BEP-6.4', answer_value: 'Workstations 64GB RAM' },
  { question_id: 'BEP-6.5', answer_value: 'Anexo de matriz de responsabilidades adjunto' },
];

describe('bepMapper — mapBepAnswersToVars', () => {
  test('1. Mapeo correcto de los question_id a variables de plantilla', () => {
    const vars = mapBepAnswersToVars(FULL_ANSWERS, META);

    expect(vars.project_name).toBe('Proyecto BEP Test');
    expect(vars.contractor).toBe('Constructora Demo S.A.');
    expect(vars.bep_phase).toBe('Contractual');
    expect(vars.eir_reference).toBe('EIR v2 del adjudicador');
    expect(vars.bim_manager).toBe('Laura Méndez');
    expect(vars.bim_coordinator).toBe('Carlos Ruiz');
    expect(vars.has_resp_matrix).toBe('Sí');
    expect(vars.naming_system).toBe('ISO 19650 + código propio');
    expect(vars.classification_system).toBe('GuBIMclass');
    expect(vars.loin_geometric).toBe('Específica (geometría y dimensiones definidas)');
    expect(vars.loin_alphanumeric_list).toContain('1. Propiedades técnicas y funcionales');
    expect(vars.loin_documentation_list).toContain('1. Fichas técnicas');
    expect(vars.has_clash).toBe('Sí');
    expect(vars.clash_frequency).toBe('Quincenal');
    expect(vars.requires_cobie).toBe('Sí');
    expect(vars.cde_platform).toBe('Autodesk Construction Cloud');
    expect(vars.requires_iso_folders).toBe('Sí');
    expect(vars.coordination_software).toBe('Navisworks');
    expect(vars.doc_version).toBe('1');
    expect(vars.doc_status).toBe('Aprobado');
  });

  test('2. Multi-select pipe-separated se formatea como lista numerada', () => {
    const vars = mapBepAnswersToVars(FULL_ANSWERS, META);

    expect(vars.disciplines_list).toContain('1. Arquitectura');
    expect(vars.disciplines_list).toContain('2. Estructuras');
    expect(vars.disciplines_list).toContain('3. Instalaciones MEP');

    expect(vars.exchange_formats_list).toContain('1. IFC');
    expect(vars.exchange_formats_list).toContain('2. RVT');

    expect(vars.cde_states_list).toContain('1. WIP');
    expect(vars.cde_states_list).toContain('4. Archivado');
  });

  test('3. Multi-select JSON array también se parsea correctamente', () => {
    const answers = [
      { question_id: 'BEP-2.4', answer_value: '["Arquitectura","Estructuras"]' },
    ];
    const vars = mapBepAnswersToVars(answers, META);
    expect(vars.disciplines_list).toContain('1. Arquitectura');
    expect(vars.disciplines_list).toContain('2. Estructuras');
  });

  test('4. Clash frequency es "No aplica" cuando BEP-4.7 = No', () => {
    const answers = [
      { question_id: 'BEP-4.7', answer_value: 'No' },
      { question_id: 'BEP-4.8', answer_value: 'Quincenal' }, // debe ignorarse
    ];
    const vars = mapBepAnswersToVars(answers, META);
    expect(vars.has_clash).toBe('No');
    expect(vars.clash_frequency).toBe('No aplica');
  });

  test('5. Fase precontractual resuelve a "Precontractual (PRE-BEP)"', () => {
    const answers = [{ question_id: 'BEP-1.3', answer_value: 'precontractual' }];
    const vars = mapBepAnswersToVars(answers, META);
    expect(vars.bep_phase).toBe('Precontractual (PRE-BEP)');
  });

  test('6. LOIN geométrico no especificado devuelve "No aplica"; valor desconocido se devuelve tal cual', () => {
    expect(mapBepAnswersToVars([], META).loin_geometric).toBe('No aplica');
    const vars = mapBepAnswersToVars([{ question_id: 'BEP-4.3', answer_value: 'custom' }], META);
    expect(vars.loin_geometric).toBe('custom');
  });

  test('7. Respuestas completamente vacías generan defaults seguros, nunca undefined', () => {
    const vars = mapBepAnswersToVars([], META);

    expect(vars.contractor).toBe('Sin especificar');
    expect(vars.bim_manager).toBe('Sin especificar');
    expect(vars.bep_phase).toBe('No especificado');
    expect(vars.disciplines_list).toBe('No aplica');
    expect(vars.iso_roles_list).toBe('No aplica');
    expect(vars.has_clash).toBe('No especificado');
    expect(vars.clash_frequency).toBe('No aplica');
    expect(vars.observations).toBe('');
  });
});

const EMPTY_NARRATIVES = {
  intro_context: '', s2_gestion: '',
  s3_1_federacion: '', s3_2_planificacion: '',
  s4_1_estandares: '', s4_2_loin: '', s4_3_clash: '',
  s5_cde: '', s6_software: '',
};

describe('bepMapper — generación Word (.docx)', () => {
  test('8. buildBepDocx genera un Buffer no vacío con datos completos', async () => {
    const { buildBepDocx } = await import('../services/bepWordBuilder');
    const vars = { ...mapBepAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const buffer = await buildBepDocx(vars);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(5000);
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  test('9. buildBepDocx no lanza errores con respuestas completamente vacías', async () => {
    const { buildBepDocx } = await import('../services/bepWordBuilder');
    const vars = { ...mapBepAnswersToVars([], META), ...EMPTY_NARRATIVES };
    await expect(buildBepDocx(vars)).resolves.toBeInstanceOf(Buffer);
  });
});

describe('bepMapper — generación HTML para PDF', () => {
  test('10. buildBepHtml devuelve HTML válido con todas las secciones', () => {
    const { buildBepHtml } = require('../services/bepHtmlBuilder');
    const vars = { ...mapBepAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const html = buildBepHtml(vars);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Constructora Demo S.A.');
    expect(html).toContain('Objeto y alcance del BEP');
    expect(html).toContain('Gestión del proyecto BIM');
    expect(html).toContain('Planificación y documentación');
    expect(html).toContain('Estándares y procedimientos');
    expect(html).toContain('Entorno común de datos');
    expect(html).toContain('Software y hardware');
    expect(html).toContain('Control de documento');
    expect(html).toContain('ISO 19650-2');
  });

  test('11. HTML no contiene marcadores sin reemplazar cuando datos están vacíos', () => {
    const { buildBepHtml } = require('../services/bepHtmlBuilder');
    const vars = { ...mapBepAnswersToVars([], META), ...EMPTY_NARRATIVES };
    const html = buildBepHtml(vars);
    expect(html).not.toMatch(/\{[a-z_]+\}/);
  });
});
