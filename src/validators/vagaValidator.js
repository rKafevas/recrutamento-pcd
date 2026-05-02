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
  requisitos: Joi.string().required(),
  localizacao: Joi.string().required(),
  salario: Joi.number().precision(2).positive().allow(null),
  // Este campo é essencial para cumprir o requisito de filtros por deficiência do TAP
  tipo_deficiencia_foco: Joi.string().valid('Física', 'Auditiva', 'Visual', 'Intelectual', 'Múltipla', 'Qualquer').required()
});

module.exports = { vagaSchema };