const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado' });
  }

  // 3. Valida se o token é verdadeiro
  jwt.verify(token, 'process.env.JWT_SECRET', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // 4. MUDANÇA AQUI: Salva o ID E o TIPO do usuário
    req.usuarioId = decoded.id;
    req.usuarioTipo = decoded.tipo; // Captura o 'RH' ou 'Candidato' vindo do token
    
    return next();
  });
};