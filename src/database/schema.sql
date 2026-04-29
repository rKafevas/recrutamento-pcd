-- Tabela de Usuários (Base para login e segurança LGPD)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) CHECK (perfil IN ('Candidato', 'RH', 'Admin')), -- Controle de Acesso (RBAC) [cite: 114, 115]
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Candidatos (Foco em Acessibilidade)
CREATE TABLE candidatos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    nome_completo VARCHAR(255) NOT NULL,
    tipo_deficiencia VARCHAR(100), -- Requisito RF03 [cite: 76]
    necessidades_acessibilidade TEXT,
    laudo_medico_url VARCHAR(255) -- Opcional na 1ª etapa [cite: 78]
);

-- Tabela de Empresas/RH
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL
);

-- Tabela de Vagas
CREATE TABLE vagas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_deficiencia_foco VARCHAR(100),
    data_publicacao DATE DEFAULT CURRENT_DATE
);

-- Tabela de Inscrições (Liga o Candidato à Vaga)
CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    vaga_id INTEGER REFERENCES vagas(id),
    candidato_id INTEGER REFERENCES candidatos(id),
    status VARCHAR(50) DEFAULT 'Pendente', -- Ex: Pendente, Entrevista, Contratado
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs (Exigência de Segurança e LGPD)
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao TEXT NOT NULL, -- Ex: "Candidato visualizou vaga X"
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);