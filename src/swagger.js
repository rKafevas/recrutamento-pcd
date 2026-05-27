const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inclui+ API',
      version: '1.0.0',
      description: 'API do Sistema de Recrutamento Inclusivo para PcD — Inclui+',
      contact: { name: 'Equipe Inclui+' }
    },
    servers: [{
    url: 'https://inclui-plus-api.onrender.com',
    description: 'Servidor de Produção (Render)'
  },],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            tipo: { type: 'string', enum: ['Candidato', 'RH'] }
          }
        },
        Vaga: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            requisitos: { type: 'string' },
            beneficios: { type: 'string' },
            modelo_trabalho: { type: 'string', enum: ['Presencial', 'Híbrido', 'Remoto'] },
            localizacao: { type: 'string' },
            salario: { type: 'string' },
            tipo_deficiencia_foco: { type: 'string', enum: ['Física','Auditiva','Visual','Intelectual','Múltipla','Qualquer'] },
            acessibilidade_local: { type: 'string' },
            tecnologias_assistivas: { type: 'string' },
            status: { type: 'string', enum: ['Aberta','Pausada','Encerrada'] }
          }
        },
        Inscricao: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            vaga_id: { type: 'integer' },
            candidato_id: { type: 'integer' },
            status: { type: 'string', enum: ['Pendente','Em análise','Entrevista','Aprovado','Reprovado'] },
            data_inscricao: { type: 'string', format: 'date-time' }
          }
        },
        Mensagem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            remetente_id: { type: 'integer' },
            destinatario_id: { type: 'integer' },
            inscricao_id: { type: 'integer' },
            conteudo: { type: 'string' },
            lida: { type: 'boolean' },
            criado_em: { type: 'string', format: 'date-time' }
          }
        },
        Erro: {
          type: 'object',
          properties: {
            erro: { type: 'string' },
            mensagem: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticação' },
      { name: 'Usuários', description: 'Cadastro de candidatos e RH' },
      { name: 'Vagas', description: 'Gestão de vagas' },
      { name: 'Inscrições', description: 'Candidaturas' },
      { name: 'Perfil', description: 'Upload de laudo e currículo' },
      { name: 'Mensagens', description: 'Chat interno' },
      { name: 'Relatórios', description: 'Relatório de cotas Lei 8.213/91' }
    ],
    paths: {
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login de usuário',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','senha'], properties: { email: { type: 'string' }, senha: { type: 'string' } } } } } },
          responses: {
            200: { description: 'Login realizado', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, usuario: { $ref: '#/components/schemas/Usuario' } } } } } },
            401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
          }
        }
      },
      '/usuarios': {
        post: {
          tags: ['Usuários'],
          summary: 'Cadastro de candidato PcD',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nome_completo','email','senha'], properties: { nome_completo: { type: 'string' }, email: { type: 'string' }, senha: { type: 'string', minLength: 6 }, tipo_deficiencia: { type: 'string' }, necessidades_acessibilidade: { type: 'string' } } } } } },
          responses: { 201: { description: 'Candidato criado' }, 409: { description: 'E-mail já cadastrado' } }
        }
      },
      '/usuarios/rh': {
        post: {
          tags: ['Usuários'],
          summary: 'Cadastro de usuário RH',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nome_completo','email','senha','nome_fantasia','cnpj'], properties: { nome_completo: { type: 'string' }, email: { type: 'string' }, senha: { type: 'string' }, nome_fantasia: { type: 'string' }, cnpj: { type: 'string' } } } } } },
          responses: { 201: { description: 'RH criado' }, 409: { description: 'E-mail já cadastrado' } }
        }
      },
      '/minha-conta': {
        delete: {
          tags: ['Usuários'],
          summary: 'Excluir conta (LGPD)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Conta excluída' }, 401: { description: 'Não autorizado' } }
        }
      },
      '/vagas': {
        get: {
          tags: ['Vagas'],
          summary: 'Listar vagas abertas',
          responses: { 200: { description: 'Lista de vagas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Vaga' } } } } } }
        },
        post: {
          tags: ['Vagas'],
          summary: 'Criar vaga (RH)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Vaga' } } } },
          responses: { 201: { description: 'Vaga criada' }, 403: { description: 'Acesso negado' } }
        }
      },
      '/vagas/filtro': {
        get: {
          tags: ['Vagas'],
          summary: 'Filtrar vagas',
          parameters: [
            { name: 'deficiencia', in: 'query', schema: { type: 'string' } },
            { name: 'modelo', in: 'query', schema: { type: 'string' } },
            { name: 'busca', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Vagas filtradas' } }
        }
      },
      '/vagas/minhas': {
        get: {
          tags: ['Vagas'],
          summary: 'Listar vagas do RH logado',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Vagas do RH' } }
        }
      },
      '/vagas/{id}': {
        patch: {
          tags: ['Vagas'],
          summary: 'Editar vaga (RH)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vaga atualizada' }, 403: { description: 'Sem permissão' } }
        }
      },
      '/vagas/{id}/encerrar': {
        patch: {
          tags: ['Vagas'],
          summary: 'Encerrar vaga (RH)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vaga encerrada' }, 403: { description: 'Sem permissão' } }
        }
      },
      '/vagas/recomendadas': {
        get: {
          tags: ['Vagas'],
          summary: 'Vagas recomendadas para o candidato',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Vagas compatíveis com a deficiência do candidato' } }
        }
      },
      '/inscricoes': {
        post: {
          tags: ['Inscrições'],
          summary: 'Candidatar-se a uma vaga',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['vaga_id'], properties: { vaga_id: { type: 'integer' } } } } } },
          responses: { 201: { description: 'Candidatura realizada' }, 409: { description: 'Já inscrito nesta vaga' } }
        }
      },
      '/inscricoes/minhas': {
        get: {
          tags: ['Inscrições'],
          summary: 'Listar candidaturas do candidato logado',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de candidaturas' } }
        }
      },
      '/inscricoes/vaga/{vaga_id}': {
        get: {
          tags: ['Inscrições'],
          summary: 'Listar candidatos de uma vaga (RH)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'vaga_id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Lista de candidatos' } }
        }
      },
      '/inscricoes/{id}/status': {
        patch: {
          tags: ['Inscrições'],
          summary: 'Atualizar status de candidatura (RH)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['Pendente','Em análise','Entrevista','Aprovado','Reprovado'] } } } } } },
          responses: { 200: { description: 'Status atualizado' } }
        }
      },
      '/perfil/laudo': {
        patch: {
          tags: ['Perfil'],
          summary: 'Upload de laudo médico',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { laudo: { type: 'string', format: 'binary' } } } } } },
          responses: { 200: { description: 'Laudo enviado' } }
        }
      },
      '/perfil/curriculo': {
        patch: {
          tags: ['Perfil'],
          summary: 'Upload de currículo',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { curriculo: { type: 'string', format: 'binary' }, nome: { type: 'string' }, sobre: { type: 'string' } } } } } },
          responses: { 200: { description: 'Currículo salvo' } }
        }
      },
      '/mensagens/conversas': {
        get: {
          tags: ['Mensagens'],
          summary: 'Listar conversas do usuário logado',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de conversas' } }
        }
      },
      '/mensagens/{inscricao_id}': {
        get: {
          tags: ['Mensagens'],
          summary: 'Buscar mensagens de uma conversa',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'inscricao_id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Mensagens da conversa', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Mensagem' } } } } } }
        }
      },
      '/relatorio/cotas': {
        get: {
          tags: ['Relatórios'],
          summary: 'Relatório de cotas Lei 8.213/91 (RH)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dados do relatório de cotas' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
