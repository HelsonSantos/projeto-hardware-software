const express = require('express');
const cors = require('cors');
require('./db');

const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');

const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', authMiddleware.protect, userRoutes);
app.use('/api/dashboard', authMiddleware.protect, dashboardRoutes);
app.use((req, res, next) => {
    res.status(404).json({ message: 'Rota não encontrada.' });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor.' });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});