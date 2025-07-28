// rfid-backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura'; // Mesma chave do authController

exports.protect = (req, res, next) => {
    // Obtenha o token do cabeçalho de autorização
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Nenhum token fornecido, acesso negado.' });
    }

    try {
        // Verifica o token
        const tokenParts = token.split(' '); // Espera "Bearer TOKEN"
        if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
            throw new Error('Formato de token inválido.');
        }
        const decoded = jwt.verify(tokenParts[1], JWT_SECRET);
        req.admin = decoded; // Adiciona as informações do administrador à requisição
        next(); // Continua para a próxima função middleware/rota
    } catch (error) {
        console.error('Erro de autenticação do token:', error.message);
        res.status(403).json({ message: 'Token inválido ou expirado.' }); // Acesso proibido
    }
};