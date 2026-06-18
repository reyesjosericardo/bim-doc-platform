import { mapAirAnswersToVars } from '../services/airMapper';

const META = { project_name: 'Activo Test', version: 1, status: 'aprobado' };

const FULL_ANSWERS = [
  { question_id: 'AIR-1.1', answer_value: 'Hospital Central' },
  { question_id: 'AIR-1.2', answer_value: 'edificio' },
  { question_id: 'AIR-1.3', answer_value: 'Operación' },
  { question_id: 'AIR-1.4', answer_value: 'OIR v1' },
  { question_id: 'AIR-1.5', answer_value: 'Ana Facility' },
  { question_id: 'AIR-2.1', answer_value: 'Mantenimiento|Eficiencia energética' },
  { question_id: 'AIR-2.2', answer_value: 'ISO 55000' },
  { question_id: 'AIR-2.3', answer_value: 'Sí' },
  { question_id: 'AIR-2.4', answer_value: 'Archibus' },
  { question_id: 'AIR-2.5', answer_value: 'ID, ubicación, fabricante' },
  { question_id: 'AIR-3.1', answer_value: 'Fichas técnicas|Manuales O&M|Garantías' },
  { question_id: 'AIR-3.2', answer_value: 'Código por planta-zona' },
  { question_id: 'AIR-3.3', answer_value: 'Por sistema MEP' },
  { question_id: 'AIR-3.4', answer_value: 'Sí' },
  { question_id: 'AIR-3.5', answer_value: 'Sí' },
  { question_id: 'AIR-4.1', answer_value: 'Sí' },
  { question_id: 'AIR-4.2', answer_value: 'construido' },
  { question_id: 'AIR-4.3', answer_value: 'Datos del fabricante y producto|Datos de operación y mantenimiento' },
  { question_id: 'AIR-4.4', answer_value: 'Fichas técnicas|Garantías' },
  { question_id: 'AIR-5.1', answer_value: 'IFC|COBie' },
  { question_id: 'AIR-5.2', answer_value: 'Sí' },
  { question_id: 'AIR-5.3', answer_value: 'A la entrega del proyecto' },
  { question_id: 'AIR-5.4', answer_value: 'Validación antes de aceptación' },
  { question_id: 'AIR-5.5', answer_value: 'Uniclass 2015' },
  { question_id: 'AIR-6.1', answer_value: 'Plataforma FM' },
  { question_id: 'AIR-6.2', answer_value: 'Trimestral' },
  { question_id: 'AIR-6.3', answer_value: 'Vida útil del activo' },
  { question_id: 'AIR-6.4', answer_value: 'No' },
  { question_id: 'AIR-6.5', answer_value: 'Anexo de parámetros' },
];

describe('airMapper — mapAirAnswersToVars', () => {
  test('1. Mapeo correcto de los campos principales', () => {
    const v = mapAirAnswersToVars(FULL_ANSWERS, META);
    expect(v.asset_name).toBe('Hospital Central');
    expect(v.asset_type).toBe('Edificio');
    expect(v.asset_manager).toBe('Ana Facility');
    expect(v.am_standard).toBe('ISO 55000');
    expect(v.has_cafm).toBe('Sí');
    expect(v.cafm_system).toBe('Archibus');
    expect(v.loin_geometric).toBe('Tal como construido (as-built verificado)');
    expect(v.handover_timing).toBe('A la entrega del proyecto');
    expect(v.classification_system).toBe('Uniclass 2015');
    expect(v.doc_status).toBe('Aprobado');
  });

  test('2. Multi-select formateado como lista numerada', () => {
    const v = mapAirAnswersToVars(FULL_ANSWERS, META);
    expect(v.mgmt_objectives_list).toContain('1. Mantenimiento');
    expect(v.aim_contents_list).toContain('2. Manuales O&M');
    expect(v.loin_alphanumeric_list).toContain('1. Datos del fabricante y producto');
    expect(v.aim_formats_list).toContain('2. COBie');
  });

  test('3. CAFM system es "No aplica" cuando AIR-2.3 = No', () => {
    const v = mapAirAnswersToVars([
      { question_id: 'AIR-2.3', answer_value: 'No' },
      { question_id: 'AIR-2.4', answer_value: 'Archibus' },
    ], META);
    expect(v.cafm_system).toBe('No aplica');
  });

  test('4. LOIN condicional: dimensiones "No aplica" cuando AIR-4.1 = No', () => {
    const v = mapAirAnswersToVars([
      { question_id: 'AIR-4.1', answer_value: 'No' },
      { question_id: 'AIR-4.2', answer_value: 'construido' },
      { question_id: 'AIR-4.3', answer_value: 'Datos de coste' },
    ], META);
    expect(v.has_loin).toBe('No');
    expect(v.loin_geometric).toBe('No aplica');
    expect(v.loin_alphanumeric_list).toBe('No aplica');
  });

  test('5. Defaults seguros con respuestas vacías', () => {
    const v = mapAirAnswersToVars([], META);
    expect(v.asset_name).toBe('Sin especificar');
    expect(v.asset_type).toBe('No especificado');
    expect(v.mgmt_objectives_list).toBe('No aplica');
    expect(v.observations).toBe('');
  });
});

const EMPTY_NARRATIVES = { intro_context: '', s2_fm: '', s3_aim: '', s4_loin: '', s5_handover: '', s6_governance: '' };

describe('airMapper — generación de documentos', () => {
  test('6. buildAirDocx genera un Buffer válido (.docx ZIP)', async () => {
    const { buildAirDocx } = await import('../services/airWordBuilder');
    const v = { ...mapAirAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const buffer = await buildAirDocx(v);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(5000);
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  test('7. buildAirHtml devuelve HTML con todas las secciones', () => {
    const { buildAirHtml } = require('../services/airHtmlBuilder');
    const v = { ...mapAirAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const html = buildAirHtml(v);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Hospital Central');
    expect(html).toContain('Requisitos del gestor del activo');
    expect(html).toContain('Contenidos del AIM');
    expect(html).toContain('traspaso PIM');
    expect(html).toContain('Control de documento');
    expect(html).not.toMatch(/\{[a-z_]+\}/);
  });
});
