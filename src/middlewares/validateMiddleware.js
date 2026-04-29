const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Pega todas as mensagens de erro do Joi e coloca num array
      const mensagens = error.details.map(detail => detail.message);
      return res.status(400).json({ erros: mensagens });
    }
    
    next(); // Se não houver erro, vai para o Controller
  };
};

module.exports = validate;