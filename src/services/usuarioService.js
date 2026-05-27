const UsuarioRepository = require('../repositories/usuarioRepository');
const TokenRepository = require('../repositories/tokenRepository');
const EmailService = require('../services/emailService');
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

      // Envia e-mail de confirmação
      try {
        const token = await TokenRepository.criar(usuario.id, 'confirmacao');
        await EmailService.enviarConfirmacaoCadastro(dados.email, dados.nome_completo, token);
      } catch(e) { console.error('Erro ao enviar e-mail de confirmação:', e.message); }

      return { 
        mensagem: "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
        usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        perfil: candidato,
        usuario_id: usuario.id
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

      // Envia e-mail de confirmação
      try {
        const token = await TokenRepository.criar(usuario.id, 'confirmacao');
        await EmailService.enviarConfirmacaoCadastro(dados.email, dados.nome_completo, token);
      } catch(e) { console.error('Erro ao enviar e-mail de confirmação:', e.message); }

      return {
        mensagem: "Conta RH criada! Verifique seu e-mail para confirmar a conta.",
        usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        empresa,
        usuario_id: usuario.id
      };
    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
      throw new Error("Erro técnico ao salvar os dados. Tente novamente.");
    }
  }
  async deletarConta(usuarioId) {
    await UsuarioRepository.deletarConta(usuarioId);
  }
}

module.exports = new UsuarioService();