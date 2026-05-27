const UsuarioRepository = require('../repositories/usuarioRepository');
const TokenRepository = require('../repositories/tokenRepository');
const EmailService = require('../services/emailService');
const bcrypt = require('bcrypt');

class UsuarioService {

  async registrarCandidato(dados) {
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(dados.email);

    if (usuarioExistente) {
      const error = new Error('Este e-mail já está cadastrado.');
      error.status = 409;
      throw error;
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

    try {
      const usuario = await UsuarioRepository.criarUsuario(
        dados.email,
        senhaCriptografada,
        'Candidato'
      );

      const candidato = await UsuarioRepository.criarCandidato(
        usuario.id,
        dados.nome_completo,
        dados.tipo_deficiencia || null
      );

      try {
        const token = await TokenRepository.criar(usuario.id, 'confirmacao');

        await EmailService.enviarConfirmacaoCadastro(
          dados.email,
          dados.nome_completo,
          token
        );

      } catch (e) {
        console.error('Erro ao enviar e-mail:', e.message);
      }

      return {
        mensagem: "Cadastro realizado com sucesso!",
        usuario: {
          id: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo
        },
        perfil: candidato,
        usuario_id: usuario.id
      };

    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
      throw new Error("Erro ao criar cadastro. Tente novamente.");
    }
  }

  async registrarRH(dados) {
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(dados.email);

    if (usuarioExistente) {
      const error = new Error('Este e-mail já está cadastrado.');
      error.status = 409;
      throw error;
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

    try {
      const usuario = await UsuarioRepository.criarUsuario(
        dados.email,
        senhaCriptografada,
        'RH'
      );

      const empresa = await UsuarioRepository.criarEmpresa(
        usuario.id,
        dados.nome_fantasia,
        dados.cnpj
      );

      try {
        const token = await TokenRepository.criar(usuario.id, 'confirmacao');

        await EmailService.enviarConfirmacaoCadastro(
          dados.email,
          dados.nome_fantasia,
          token
        );

      } catch (e) {
        console.error('Erro ao enviar e-mail:', e.message);
      }

      return {
        mensagem: "Cadastro realizado com sucesso!",
        usuario: {
          id: usuario.id,
          email: usuario.email,
          tipo: usuario.tipo
        },
        empresa,
        usuario_id: usuario.id
      };

    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
      throw new Error("Erro ao criar cadastro. Tente novamente.");
    }
  }

  async deletarConta(usuarioId) {
    await UsuarioRepository.deletarConta(usuarioId);
  }
}

module.exports = new UsuarioService();