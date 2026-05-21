const Joi = require('joi');

// 1. Schema para Cadastro (Candidato)
const usuarioSchema = Joi.object({
  nome_completo: Joi.string().min(3).max(100).required().messages({
    'string.min': 'O nome deve ter pelo menos 3 caracteres.',
    'any.required': 'O nome é obrigatório.'
  }),
  
  email: Joi.string().email().required().messages({
    'string.email': 'Digite um e-mail válido.',
    'any.required': 'O e-mail é obrigatório.'
  }),
  
  senha: Joi.string().min(6).required().messages({
    'string.min': 'A senha deve ter no mínimo 6 caracteres.',
    'any.required': 'A senha é obrigatória.'
  }),

  tipo_deficiencia: Joi.string().max(50).allow('', null).optional().messages({
    'string.max': 'O tipo de deficiência é muito longo.'
  }),

  necessidades_acessibilidade: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'O campo de necessidades excede o limite de caracteres.'
  })
});

// 2. Schema para Login (Ajustado para o seu AuthController)
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'O formato do e-mail é inválido.',
    'any.required': 'O e-mail é obrigatório para logar.'
  }),
  senha: Joi.string().required().messages({
    'any.required': 'A senha é obrigatória para logar.'
  })
});

// 3. Schema para Cadastro RH
const rhSchema = Joi.object({
  nome_completo: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  nome_fantasia: Joi.string().min(2).max(255).required().messages({
    'any.required': 'O nome da empresa é obrigatório.'
  }),
  cnpj: Joi.string().length(18).required().messages({
    'string.length': 'O CNPJ deve ter 18 caracteres (com máscara).',
    'any.required': 'O CNPJ é obrigatório.'
  })
});

module.exports = { usuarioSchema, loginSchema, rhSchema };