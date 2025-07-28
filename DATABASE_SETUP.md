# Configuração do Banco de Dados - Sistema RFID

## 📋 Estrutura de Tabelas Esperada

O back-end espera as seguintes tabelas no banco de dados `pj-hs`:

### 1. **Tabela `admins`** (Administradores)

```sql
- id (int, auto_increment, primary key)
- email (varchar(255), unique)
- password (varchar(255)) - hash bcrypt
- created_at (timestamp)
```

### 2. **Tabela `usuarios`** (Usuários cadastrados)

```sql
- id (int, auto_increment, primary key)
- nome (varchar(255))
- matricula (varchar(50), unique)
- curso (varchar(100))
- email (varchar(255), unique)
- tagRfid (varchar(100), unique)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. **Tabela `logs_rfid`** (Logs de leituras RFID)

```sql
- id (int, auto_increment, primary key)
- uid (varchar(100)) - UID da tag RFID
- tipo (varchar(50)) - Tipo da tag (ex: MiFare Classic)
- data_hora (timestamp)
```

### 4. **Tabela `acessos`** (Acessos registrados)

```sql
- id (int, auto_increment, primary key)
- usuario_id (int, foreign key -> usuarios.id)
- tag_rfid (varchar(100))
- horario_acesso (timestamp)
```

## 🚀 Como Configurar

### Opção 1: Usar o Script SQL Completo

1. Abra o MySQL Workbench ou phpMyAdmin
2. Execute o arquivo `database_schema.sql`
3. O script criará automaticamente todas as tabelas e dados de exemplo

### Opção 2: Executar Manualmente

```sql
-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS `pj-hs`;
USE `pj-hs`;

-- 2. Criar tabela admins
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Criar tabela usuarios
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `matricula` varchar(50) NOT NULL,
  `curso` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tagRfid` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `tagRfid` (`tagRfid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Criar tabela logs_rfid
CREATE TABLE `logs_rfid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_data_hora` (`data_hora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Criar tabela acessos
CREATE TABLE `acessos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tag_rfid` varchar(100) NOT NULL,
  `horario_acesso` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_horario_acesso` (`horario_acesso`),
  CONSTRAINT `fk_acessos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Inserir administrador padrão
INSERT INTO `admins` (`email`, `password`) VALUES
('admin@labaccess.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
```

## 🔐 Credenciais Padrão

Após executar o script, você terá um administrador padrão:

- **Email:** admin@labaccess.com
- **Senha:** admin123

## 📊 Dados de Exemplo

O script também inclui:

- 3 usuários de exemplo
- Alguns logs RFID de exemplo
- Alguns acessos de exemplo

## 🔧 Configuração do Back-end

Certifique-se de que o arquivo `back-end/db.js` está configurado corretamente:

```javascript
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin", // Sua senha do MySQL
  database: "pj-hs", // Nome do banco
  // ... outras configurações
};
```

## ✅ Verificação

Após executar o script, você pode verificar se tudo foi criado corretamente:

```sql
USE pj-hs;
SHOW TABLES;
SELECT COUNT(*) FROM admins;
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM logs_rfid;
SELECT COUNT(*) FROM acessos;
```

## 🚨 Problemas Comuns

1. **Erro "Table doesn't exist":** Execute o script SQL completo
2. **Erro de conexão:** Verifique as credenciais no `db.js`
3. **Erro de autenticação:** Use as credenciais padrão ou crie um novo admin

## 📝 Notas Importantes

- O banco deve se chamar `pj-hs` (exatamente como está no código)
- Todas as tabelas devem ter os nomes exatos especificados
- Os campos `tagRfid` em `usuarios` e `uid` em `logs_rfid` devem ser únicos
- A tabela `acessos` tem foreign key para `usuarios`
