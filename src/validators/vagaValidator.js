const Joi = require('joi');

const vagaSchema = Joi.object({
  titulo: Joi.string().min(5).max(100).required().messages({
    'string.empty': 'O título da vaga é obrigatório.',
    'string.min': 'O título deve ter pelo menos 5 caracteres.'
  }),
  descricao: Joi.string().min(20).required().messages({
    'string.empty': 'A descrição da vaga é obrigatória.',
    'string.min': 'A descrição deve ser detalhada (mínimo 20 caracteres).'
  }),
  requisitos: Joi.string().min(10).required().messages({
    'string.empty': 'Os requisitos são obrigatórios.',
    'string.min': 'Descreva os requisitos com mais detalhes.'
  }),
  beneficios: Joi.string().allow('', null).optional(),
  modelo_trabalho: Joi.string().valid('Presencial', 'Híbrido', 'Remoto').required().messages({
    'any.only': 'Modelo de trabalho deve ser Presencial, Híbrido ou Remoto.',
    'any.required': 'O modelo de trabalho é obrigatório.'
  }),
  localizacao: Joi.string().required().messages({
    'string.empty': 'A localização é obrigatória.'
  }),
  salario: Joi.string().allow('', null).optional(),
  tipo_deficiencia_foco: Joi.string().valid('Física', 'Auditiva', 'Visual', 'Intelectual', 'Múltipla', 'Qualquer').required().messages({
    'any.only': 'Selecione um tipo de deficiência válido.',
    'any.required': 'O tipo de deficiência é obrigatório.'
  }),
  acessibilidade_local: Joi.string().allow('', null).optional(),
  tecnologias_assistivas: Joi.string().allow('', null).optional()
});

module.exports = { vagaSchema };
