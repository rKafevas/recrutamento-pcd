const UsuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcrypt');

class UsuarioService {
  async registrarCandidato(dados) {
    // 1. VERIFICAÇÃO DE SEGURANÇA: O e-mail já existe?
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      const error = new Error('Este e-mail já está cadastrado no sistema.');
      error.status = 409; // Status 409: Conflict
      throw error;
    }

    // 2. CRIPTOGRAFIA
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(dados.senha, saltRounds);

    try {
      // 3. REGISTRO DE LOGIN (Tabela usuarios)
      const usuario = await UsuarioRepository.criarUsuario(
        dados.email, 
        senhaCriptografada, 
        'Candidato'
      );

      // 4. PERFIL DETALHADO (Tabela candidatos)
      const candidato = await UsuarioRepository.criarCandidato(
        usuario.id, 
        dados.nome_completo,
        dados.tipo_deficiencia,
        dados.necessidades_acessibilidade
      );

      // Retornamos os dados sem a senha para segurança
      return { 
        mensagem: "Cadastro realizado com sucesso!",
        usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        perfil: candidato 
      };

    } catch (err) {
      // Se algo der errado no INSERT (ex: banco fora do ar)
      console.error("Erro ao salvar no banco:", err);
      throw new Error("Erro técnico ao salvar os dados. Tente novamente.");
    }
  }
  async registrarRH(dados) {
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      const error = new Error('Este e-mail já está cadastrado no sistema.');
      error.status = 409;
      throw error;
    }

    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(dados.senha, saltRounds);

    try {
      const usuario = await UsuarioRepository.criarUsuario(dados.email, senhaCriptografada, 'RH');
      const empresa = await UsuarioRepository.criarEmpresa(usuario.id, dados.nome_fantasia, dados.cnpj);

      return {
        mensagem: "Conta RH criada com sucesso!",
        usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        empresa
      };
    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
      throw new Error("Erro técnico ao salvar os dados. Tente novamente.");
    }
  }
}

module.exports = new UsuarioService();