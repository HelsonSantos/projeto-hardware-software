-- Script para adicionar administrador diretamente no banco de dados
-- Execute este script no MySQL para adicionar o administrador

-- Primeiro, certifique-se de que a tabela admins existe
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir o administrador (senha já hasheada com bcrypt)
-- Senha: Helson@123
INSERT INTO admins (email, password) VALUES 
('helson@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE 
email = VALUES(email);

-- Verificar se foi inserido
SELECT id, email, created_at FROM admins WHERE email = 'helson@gmail.com'; 