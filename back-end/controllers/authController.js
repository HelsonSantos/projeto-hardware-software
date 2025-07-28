// rfid-backend/controllers/authController.js

const pool = require('../db');
const bcrypt = require('bcryptjs'); // Para hash de senhas
const jwt = require('jsonwebtoken'); // Para JSON Web Tokens

// Chave secreta para assinar os JWTs (MUITO IMPORTANTE: USE UMA CHAVE FORTE E ARMAZENE EM VARIÁVEIS DE AMBIENTE)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura'; // Use uma chave forte aqui!

// Registro de Administrador (API-ONLY - Para ser usado uma vez via Postman)
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // Gera um hash da senha
        const hashedPassword = await bcrypt.hash(password, 10); // 10 é o salt rounds, um valor seguro

        // Insere o novo administrador no banco de dados
        const [result] = await pool.execute(
            'INSERT INTO admins (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        res.status(201).json({ message: 'Administrador registrado com sucesso!', adminId: result.insertId });
    } catch (error) {
        console.error('Erro ao registrar administrador:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email já cadastrado.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao registrar administrador.' });
    }
};

// Login de Administrador
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // Busca o administrador pelo email
        const [admins] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' }); // Email não encontrado
        }

        const admin = admins[0];

        // Compara a senha fornecida com o hash armazenado
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' }); // Senha incorreta
        }

        // Se as credenciais estiverem corretas, gera um JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.json({ message: 'Login bem-sucedido!', token });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
};