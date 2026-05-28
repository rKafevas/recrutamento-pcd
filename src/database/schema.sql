-- INCLUI+ — Schema completo atualizado

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('Candidato', 'RH', 'Admin')),
    email_confirmado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidatos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    tipo_deficiencia VARCHAR(100),
    necessidades_acessibilidade TEXT,
    laudo_medico_url TEXT,
    curriculo_url TEXT,
    foto_url TEXT,
    telefone VARCHAR(20),
    sobre TEXT,
    formacao TEXT,
    experiencias TEXT,
    habilidades TEXT
);

CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS vagas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT,
    beneficios TEXT,
    modelo_trabalho VARCHAR(20) CHECK (modelo_trabalho IN ('Presencial', 'Híbrido', 'Remoto')),
    localizacao VARCHAR(255),
    salario VARCHAR(100),
    tipo_deficiencia_foco VARCHAR(100),
    acessibilidade_local TEXT,
    tecnologias_assistivas TEXT,
    status VARCHAR(20) DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Pausada', 'Encerrada')),
    data_publicacao DATE DEFAULT CURRENT_DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inscricoes (
    id SERIAL PRIMARY KEY,
    vaga_id INTEGER REFERENCES vagas(id) ON DELETE CASCADE,
    candidato_id INTEGER REFERENCES candidatos(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pendente',
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    destinatario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    inscricao_id INTEGER REFERENCES inscricoes(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    link VARCHAR(255),
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tokens_email (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(6) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
