const Joi = require('joi');

const inscricaoSchema = Joi.object({
  vaga_id: Joi.number().integer().required().messages({
    'any.required': 'O ID da vaga é obrigatório para se inscrever.',
    'number.base': 'ID da vaga inválido.'
  })
});

module.exports = { inscricaoSchema };