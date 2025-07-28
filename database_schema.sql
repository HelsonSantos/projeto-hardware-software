-- =====================================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA RFID
-- Banco: pj-hs
-- =====================================================

-- Criar o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS `pj-hs`;
USE `pj-hs`;

-- =====================================================
-- TABELA: admins (Administradores do sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: usuarios (Usuários cadastrados no sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: logs_rfid (Logs de todas as leituras RFID)
-- =====================================================
CREATE TABLE IF NOT EXISTS `logs_rfid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_data_hora` (`data_hora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: acessos (Acessos registrados no laboratório)
-- =====================================================
CREATE TABLE IF NOT EXISTS `acessos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tag_rfid` varchar(100) NOT NULL,
  `horario_acesso` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_horario_acesso` (`horario_acesso`),
  CONSTRAINT `fk_acessos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERIR ADMINISTRADOR PADRÃO
-- =====================================================
-- Senha: admin123 (hash bcrypt)
INSERT INTO `admins` (`email`, `password`) VALUES 
('admin@labaccess.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir alguns usuários de exemplo
INSERT INTO `usuarios` (`nome`, `matricula`, `curso`, `email`, `tagRfid`) VALUES 
('João Silva', '2023001', 'Engenharia de Computação', 'joao.silva@email.com', 'A1B2C3D4'),
('Maria Santos', '2023002', 'Ciência da Computação', 'maria.santos@email.com', 'E5F6G7H8'),
('Pedro Oliveira', '2023003', 'Sistemas de Informação', 'pedro.oliveira@email.com', 'I9J0K1L2')
ON DUPLICATE KEY UPDATE `nome` = `nome`;

-- Inserir alguns logs de exemplo
INSERT INTO `logs_rfid` (`uid`, `tipo`) VALUES 
('A1B2C3D4', 'MiFare Classic'),
('E5F6G7H8', 'MiFare Classic'),
('I9J0K1L2', 'MiFare Classic'),
('03C7AEEE', 'MiFare Classic 1K/4K');

-- Inserir alguns acessos de exemplo
INSERT INTO `acessos` (`usuario_id`, `tag_rfid`) VALUES 
(1, 'A1B2C3D4'),
(2, 'E5F6G7H8'),
(3, 'I9J0K1L2');

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS `idx_usuarios_tagRfid` ON `usuarios` (`tagRfid`);
CREATE INDEX IF NOT EXISTS `idx_logs_rfid_uid_tipo` ON `logs_rfid` (`uid`, `tipo`);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'Schema criado com sucesso!' as status;
SELECT COUNT(*) as total_admins FROM admins;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_logs FROM logs_rfid;
SELECT COUNT(*) as total_acessos FROM acessos; 