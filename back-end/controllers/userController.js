// rfid-backend/controllers/userController.js

const pool = require('../db'); // Importa o pool de conexão do banco de dados

// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Cadastrar um novo usuário
exports.createUser = async (req, res) => {
    const { nome, matricula, curso, email, tagRfid } = req.body;
    if (!nome || !matricula || !email || !tagRfid) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios (nome, matrícula, email, tagRfid) devem ser preenchidos.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nome, matricula, curso, email, tagRfid) VALUES (?, ?, ?, ?, ?)',
            [nome, matricula, curso, email, tagRfid]
        );
        const newUser = { id: result.insertId, nome, matricula, curso, email, tagRfid };
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            let message = 'Erro de duplicidade.';
            if (error.message.includes('matricula')) {
                message = 'Matrícula já cadastrada.';
            } else if (error.message.includes('email')) {
                message = 'E-mail já cadastrado.';
            } else if (error.message.includes('tagRfid')) {
                message = 'Tag RFID já cadastrada.';
            }
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar usuário.' });
    }
};

// Atualizar um usuário existente
exports.updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, matricula, curso, email, tagRfid } = req.body;

    if (!nome || !matricula || !email || !tagRfid) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE usuarios SET nome = ?, matricula = ?, curso = ?, email = ?, tagRfid = ? WHERE id = ?',
            [nome, matricula, curso, email, tagRfid, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            let message = 'Erro de duplicidade.';
            if (error.message.includes('matricula')) {
                message = 'Matrícula já cadastrada.';
            } else if (error.message.includes('email')) {
                message = 'E-mail já cadastrado.';
            } else if (error.message.includes('tagRfid')) {
                message = 'Tag RFID já cadastrada.';
            }
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar usuário.' });
    }
};

// Deletar um usuário
exports.deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar usuário.' });
    }
};