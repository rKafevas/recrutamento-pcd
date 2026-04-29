// src/middlewares/roleMiddleware.js

const authorize = (tiposPermitidos) => {
  return (req, res, next) => {
    // O req.usuarioTipo será definido pelo nosso authMiddleware atualizado
    const { usuarioTipo } = req;

    if (!tiposPermitidos.includes(usuarioTipo)) {
      return res.status(403).json({ 
        error: "Acesso negado. Você não tem permissão para acessar este recurso." 
      });
    }

    next();
  };
};

module.exports = authorize;