import { mapAnswersToVars } from '../services/oirMapper';

const META = { project_name: 'Proyecto Test', version: 1, status: 'aprobado' };

// Full set of answers (all 27 questions answered)
const FULL_ANSWERS = [
  { question_id: 'OIR-1.1', answer_value: 'Organización Demo' },
  { question_id: 'OIR-1.2', answer_value: 'Cliente público' },
  { question_id: 'OIR-1.3', answer_value: 'Infraestructura' },
  { question_id: 'OIR-1.4', answer_value: 'España, Comunidad de Madrid' },
  { question_id: 'OIR-1.5', answer_value: 'ISO 19650|BIM Level 2|Estándar propio' },
  { question_id: 'OIR-1.6', answer_value: 'Ana García' },
  { question_id: 'OIR-2.1', answer_value: 'Gestión de activos|Gestión energética' },
  { question_id: 'OIR-2.2', answer_value: 'Reducir costos operativos en un 20%' },
  { question_id: 'OIR-2.3', answer_value: 'Sí' },
  { question_id: 'OIR-2.4', answer_value: 'ISO 55000' },
  { question_id: 'OIR-2.5', answer_value: 'Sí' },
  { question_id: 'OIR-2.6', answer_value: 'Cumplimiento Ley de Contratación Pública' },
  { question_id: 'OIR-3.1', answer_value: 'Inventario de espacios|Activos físicos y agrupaciones' },
  { question_id: 'OIR-3.2', answer_value: 'Plan mantenimiento preventivo|Vida útil componentes' },
  { question_id: 'OIR-3.3', answer_value: 'Sí' },
  { question_id: 'OIR-3.4', answer_value: 'Incendio|Seguridad estructural' },
  { question_id: 'OIR-3.5', answer_value: 'Costos operativos|Emisiones CO2e' },
  { question_id: 'OIR-3.6', answer_value: 'No' },
  { question_id: 'OIR-4.1', answer_value: 'IFC|COBie|PDF' },
  { question_id: 'OIR-4.2', answer_value: 'UniClass 2015' },
  { question_id: 'OIR-4.3', answer_value: 'Sí' },
  { question_id: 'OIR-4.4', answer_value: 'ACC' },
  { question_id: 'OIR-4.5', answer_value: 'Sí' },
  { question_id: 'OIR-4.6', answer_value: 'LOG 3 definido' },
  { question_id: 'OIR-5.1', answer_value: 'Trimestral' },
  { question_id: 'OIR-5.2', answer_value: 'No' },
  { question_id: 'OIR-5.4', answer_value: '10 años' },
  { question_id: 'OIR-5.5', answer_value: 'No' },
];

describe('oirMapper — mapAnswersToVars', () => {
  test('1. Mapeo correcto de los 27 question_id a variables de plantilla', () => {
    const vars = mapAnswersToVars(FULL_ANSWERS, META);

    expect(vars.org_name).toBe('Organización Demo');
    expect(vars.org_type).toBe('Cliente público');
    expect(vars.sector).toBe('Infraestructura');
    expect(vars.country).toBe('España, Comunidad de Madrid');
    expect(vars.responsible_name).toBe('Ana García');
    expect(vars.strategic_objective).toBe('Reducir costos operativos en un 20%');
    expect(vars.has_asset_plan).toBe('Sí');
    expect(vars.asset_plan_standard).toBe('ISO 55000');
    expect(vars.has_regulatory).toBe('Sí');
    expect(vars.regulatory_description).toBe('Cumplimiento Ley de Contratación Pública');
    expect(vars.classification_system).toBe('UniClass 2015');
    expect(vars.has_cde).toBe('Sí');
    expect(vars.cde_platform).toBe('ACC');
    expect(vars.has_lod).toBe('Sí');
    expect(vars.lod_level).toBe('LOG 3 definido');
    expect(vars.update_frequency).toBe('Trimestral');
    expect(vars.retention_policy).toBe('10 años');
    expect(vars.has_security).toBe('No');
    expect(vars.has_eol).toBe('No');
    expect(vars.project_name).toBe('Proyecto Test');
    expect(vars.doc_version).toBe('1');
    expect(vars.doc_status).toBe('Aprobado');
  });

  test('2. Multi-select pipe-separated se formatea como lista numerada', () => {
    const vars = mapAnswersToVars(FULL_ANSWERS, META);

    expect(vars.standards_list).toContain('1. ISO 19650');
    expect(vars.standards_list).toContain('2. BIM Level 2');
    expect(vars.standards_list).toContain('3. Estándar propio');

    expect(vars.bim_uses_list).toContain('1. Gestión de activos');
    expect(vars.bim_uses_list).toContain('2. Gestión energética');

    expect(vars.exchange_formats_list).toContain('1. IFC');
    expect(vars.exchange_formats_list).toContain('2. COBie');
    expect(vars.exchange_formats_list).toContain('3. PDF');
  });

  test('3. Multi-select JSON array también se parsea correctamente', () => {
    const answers = [
      { question_id: 'OIR-1.5', answer_value: '["ISO 19650","BIM Level 2"]' },
    ];
    const vars = mapAnswersToVars(answers, META);
    expect(vars.standards_list).toContain('1. ISO 19650');
    expect(vars.standards_list).toContain('2. BIM Level 2');
  });

  test('4. Campos condicionales vacíos devuelven "No aplica", nunca undefined', () => {
    // OIR-2.3 = No → OIR-2.4 debe ser "No aplica"
    const answers = [
      { question_id: 'OIR-2.3', answer_value: 'No' },
      // OIR-2.4 omitido intencionalmente
    ];
    const vars = mapAnswersToVars(answers, META);
    expect(vars.asset_plan_standard).toBe('No aplica');
  });

  test('5. OIR-3.4 es "No aplica" cuando OIR-3.3 = No', () => {
    const answers = [
      { question_id: 'OIR-3.3', answer_value: 'No' },
      { question_id: 'OIR-3.4', answer_value: 'Incendio|Seguridad estructural' }, // debe ignorarse
    ];
    const vars = mapAnswersToVars(answers, META);
    expect(vars.risk_types_list).toBe('No aplica');
  });

  test('6. Fin de vida útil condicional: OIR-3.7 solo si OIR-3.6 = Sí', () => {
    const withEol = [
      { question_id: 'OIR-3.6', answer_value: 'Sí' },
      { question_id: 'OIR-3.7', answer_value: 'Costos demolición|Reciclaje materiales' },
    ];
    const vars = mapAnswersToVars(withEol, META);
    expect(vars.eol_requirements_list).toContain('1. Costos demolición');

    const withoutEol = [
      { question_id: 'OIR-3.6', answer_value: 'No' },
      { question_id: 'OIR-3.7', answer_value: 'Costos demolición' },
    ];
    const vars2 = mapAnswersToVars(withoutEol, META);
    expect(vars2.eol_requirements_list).toBe('No aplica');
  });

  test('7. CDE platform solo cuando OIR-4.3 = Sí', () => {
    const vars = mapAnswersToVars(FULL_ANSWERS, META);
    expect(vars.cde_platform).toBe('ACC');

    const noCde = [{ question_id: 'OIR-4.3', answer_value: 'No' }, { question_id: 'OIR-4.4', answer_value: 'BIM 360' }];
    const vars2 = mapAnswersToVars(noCde, META);
    expect(vars2.cde_platform).toBe('No aplica');
  });

  test('8. Observaciones vacías cuando OIR-5.5 = No', () => {
    const answers = [
      { question_id: 'OIR-5.5', answer_value: 'No' },
      { question_id: 'OIR-5.6', answer_value: 'Esto no debe aparecer' },
    ];
    const vars = mapAnswersToVars(answers, META);
    expect(vars.observations_text).toBe('');
  });

  test('9. Respuestas completamente vacías generan "No aplica" en todos los campos', () => {
    const vars = mapAnswersToVars([], META);

    expect(vars.org_name).toBe('Sin especificar');
    expect(vars.org_type).toBe('No aplica');
    expect(vars.standards_list).toBe('No aplica');
    expect(vars.bim_uses_list).toBe('No aplica');
    expect(vars.asset_plan_standard).toBe('No aplica');
    expect(vars.risk_types_list).toBe('No aplica');
    expect(vars.observations_text).toBe('');
  });

  test('10. Restricciones de seguridad condicionales (OIR-5.3)', () => {
    const withSecurity = [
      { question_id: 'OIR-5.2', answer_value: 'Sí' },
      { question_id: 'OIR-5.3', answer_value: 'Información clasificada|Infraestructura crítica' },
    ];
    const vars = mapAnswersToVars(withSecurity, META);
    expect(vars.security_types_list).toContain('1. Información clasificada');
    expect(vars.security_types_list).toContain('2. Infraestructura crítica');

    const noSecurity = [{ question_id: 'OIR-5.2', answer_value: 'No' }];
    const vars2 = mapAnswersToVars(noSecurity, META);
    expect(vars2.security_types_list).toBe('No aplica');
  });
});

const EMPTY_NARRATIVES = {
  narrative_identification: '',
  narrative_objectives: '',
  narrative_assets: '',
  narrative_standards: '',
  narrative_governance: '',
};

describe('oirMapper — generación Word (.docx)', () => {
  test('11. buildOirDocx genera un Buffer no vacío con datos completos', async () => {
    const { buildOirDocx } = await import('../services/oirWordBuilder');
    const vars = { ...mapAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const buffer = await buildOirDocx(vars);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(5000); // Un docx real pesa varios KB
    // Los archivos .docx son ZIPs — verificar magic bytes PK
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  test('12. buildOirDocx no lanza errores con respuestas completamente vacías', async () => {
    const { buildOirDocx } = await import('../services/oirWordBuilder');
    const vars = { ...mapAnswersToVars([], META), ...EMPTY_NARRATIVES };
    await expect(buildOirDocx(vars)).resolves.toBeInstanceOf(Buffer);
  });
});

describe('oirMapper — generación HTML para PDF', () => {
  test('13. buildOirHtml devuelve HTML válido con todas las secciones', () => {
    const { buildOirHtml } = require('../services/oirHtmlBuilder');
    const vars = mapAnswersToVars(FULL_ANSWERS, META);
    const html = buildOirHtml(vars);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Organización Demo');
    expect(html).toContain('Objeto y campo de aplicación');
    expect(html).toContain('Identificación de la organización');
    expect(html).toContain('Objetivos estratégicos');
    expect(html).toContain('Requisitos de información del activo');
    expect(html).toContain('Estándares y formatos');
    expect(html).toContain('Gobernanza de la información');
    expect(html).toContain('Control de documento');
    expect(html).toContain('ISO 19650-1');
  });

  test('14. HTML no contiene marcadores sin reemplazar cuando datos están vacíos', () => {
    const { buildOirHtml } = require('../services/oirHtmlBuilder');
    const vars = mapAnswersToVars([], META);
    const html = buildOirHtml(vars);

    // No debe haber marcadores {variable} sin sustituir
    expect(html).not.toMatch(/\{[a-z_]+\}/);
  });
});
