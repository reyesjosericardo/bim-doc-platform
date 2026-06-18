import { mapPirAnswersToVars } from '../services/pirMapper';

const META = { project_name: 'Proyecto Inversión', version: 1, status: 'aprobado' };

const FULL_ANSWERS = [
  { question_id: 'PIR-1.1', answer_value: 'Nueva sede corporativa' },
  { question_id: 'PIR-1.2', answer_value: 'Edificación' },
  { question_id: 'PIR-1.3', answer_value: 'OIR v1' },
  { question_id: 'PIR-1.4', answer_value: 'Dir. Inmobiliaria' },
  { question_id: 'PIR-1.5', answer_value: 'Edificio de oficinas de 12 plantas' },
  { question_id: 'PIR-2.1', answer_value: 'Coste|Plazo|Sostenibilidad' },
  { question_id: 'PIR-2.2', answer_value: '20 M€' },
  { question_id: 'PIR-2.3', answer_value: '30 meses' },
  { question_id: 'PIR-2.4', answer_value: 'Consumo casi nulo (nZEB)' },
  { question_id: 'PIR-2.5', answer_value: 'Sí' },
  { question_id: 'PIR-2.6', answer_value: 'LEED' },
  { question_id: 'PIR-3.1', answer_value: 'Viabilidad|Proyecto básico|Licitación' },
  { question_id: 'PIR-3.2', answer_value: '¿Cumple presupuesto? ¿Cumple energía?' },
  { question_id: 'PIR-3.3', answer_value: 'Sí' },
  { question_id: 'PIR-3.4', answer_value: 'Coste|Energía|Alternativas de diseño' },
  { question_id: 'PIR-4.1', answer_value: 'Sí' },
  { question_id: 'PIR-4.2', answer_value: 'especifico' },
  { question_id: 'PIR-4.3', answer_value: 'Datos de coste|Datos de sostenibilidad y energía' },
  { question_id: 'PIR-4.4', answer_value: 'Fichas técnicas' },
  { question_id: 'PIR-5.1', answer_value: 'Estimación de costos|Análisis energético' },
  { question_id: 'PIR-5.2', answer_value: 'IFC|PDF' },
  { question_id: 'PIR-5.3', answer_value: 'Sí' },
  { question_id: 'PIR-5.4', answer_value: 'Parcela con protección arqueológica' },
  { question_id: 'PIR-5.5', answer_value: 'Anexo de hitos' },
];

describe('pirMapper — mapPirAnswersToVars', () => {
  test('1. Mapeo correcto de los campos principales', () => {
    const v = mapPirAnswersToVars(FULL_ANSWERS, META);
    expect(v.sector).toBe('Edificación');
    expect(v.client_lead).toBe('Dir. Inmobiliaria');
    expect(v.budget_target).toBe('20 M€');
    expect(v.schedule_target).toBe('30 meses');
    expect(v.has_certification).toBe('Sí');
    expect(v.certification).toBe('LEED');
    expect(v.loin_geometric).toBe('Específica (geometría y dimensiones definidas)');
    expect(v.requires_models).toBe('Sí');
    expect(v.has_transition).toBe('Sí');
    expect(v.doc_status).toBe('Aprobado');
  });

  test('2. Multi-select formateado como lista numerada', () => {
    const v = mapPirAnswersToVars(FULL_ANSWERS, META);
    expect(v.strategic_objectives_list).toContain('1. Coste');
    expect(v.decision_milestones_list).toContain('3. Licitación');
    expect(v.decision_info_list).toContain('2. Energía');
    expect(v.loin_alphanumeric_list).toContain('1. Datos de coste');
    expect(v.exchange_formats_list).toContain('1. IFC');
  });

  test('3. Certificación es "No aplica" cuando PIR-2.5 = No', () => {
    const v = mapPirAnswersToVars([
      { question_id: 'PIR-2.5', answer_value: 'No' },
      { question_id: 'PIR-2.6', answer_value: 'LEED' },
    ], META);
    expect(v.certification).toBe('No aplica');
  });

  test('4. LOIN condicional: dimensiones "No aplica" cuando PIR-4.1 = No', () => {
    const v = mapPirAnswersToVars([
      { question_id: 'PIR-4.1', answer_value: 'No' },
      { question_id: 'PIR-4.2', answer_value: 'especifico' },
    ], META);
    expect(v.has_loin).toBe('No');
    expect(v.loin_geometric).toBe('No aplica');
    expect(v.loin_alphanumeric_list).toBe('No aplica');
  });

  test('5. Defaults seguros con respuestas vacías', () => {
    const v = mapPirAnswersToVars([], META);
    expect(v.sector).toBe('No especificado');
    expect(v.client_lead).toBe('Sin especificar');
    expect(v.strategic_objectives_list).toBe('No aplica');
    expect(v.observations).toBe('');
  });
});

const EMPTY_NARRATIVES = { intro_context: '', s2_objectives: '', s3_decisions: '', s4_loin: '', s5_delivery: '' };

describe('pirMapper — generación de documentos', () => {
  test('6. buildPirDocx genera un Buffer válido (.docx ZIP)', async () => {
    const { buildPirDocx } = await import('../services/pirWordBuilder');
    const v = { ...mapPirAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const buffer = await buildPirDocx(v);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(5000);
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  test('7. buildPirHtml devuelve HTML con todas las secciones', () => {
    const { buildPirHtml } = require('../services/pirHtmlBuilder');
    const v = { ...mapPirAnswersToVars(FULL_ANSWERS, META), ...EMPTY_NARRATIVES };
    const html = buildPirHtml(v);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Objetivos estratégicos de la inversión');
    expect(html).toContain('puntos clave de decisión');
    expect(html).toContain('Requisitos de gestión y entrega');
    expect(html).toContain('Control de documento');
    expect(html).not.toMatch(/\{[a-z_]+\}/);
  });
});
