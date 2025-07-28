
const pool = require('../db'); // Importa o pool de conexão do banco de dados

// Registrar um novo acesso
exports.registerAccess = async (req, res) => {
    const { tagRfid } = req.body;
    if (!tagRfid) {
        return res.status(400).json({ message: 'Tag RFID é obrigatória para registrar o acesso.' });
    }

    try {
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE tagRfid = ?', [tagRfid]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado para esta Tag RFID.' });
        }

        const userId = users[0].id;

        const [result] = await pool.execute(
            'INSERT INTO acessos (usuario_id, tag_rfid) VALUES (?, ?)',
            [userId, tagRfid]
        );
        res.status(201).json({ message: 'Acesso registrado com sucesso!', accessId: result.insertId });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar acesso.' });
    }
};

// Resumo (Hoje, Semana, Mês)
exports.getDashboardSummary = async (req, res) => {
    try {
        const [todayResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE DATE(horario_acesso) = CURDATE()"
        );
        const todayCount = todayResult[0].count;

        const [yesterdayResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE DATE(horario_acesso) = CURDATE() - INTERVAL 1 DAY"
        );
        const yesterdayCount = yesterdayResult[0].count;

        const [weekResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE YEARWEEK(horario_acesso, 1) = YEARWEEK(CURDATE(), 1)"
        );
        const weekCount = weekResult[0].count;

        const [lastWeekResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE YEARWEEK(horario_acesso, 1) = YEARWEEK(CURDATE() - INTERVAL 7 DAY, 1)"
        );
        const lastWeekCount = lastWeekResult[0].count;

        const [monthResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE MONTH(horario_acesso) = MONTH(CURDATE()) AND YEAR(horario_acesso) = YEAR(CURDATE())"
        );
        const monthCount = monthResult[0].count;

        const [lastMonthResult] = await pool.execute(
            "SELECT COUNT(*) as count FROM acessos WHERE MONTH(horario_acesso) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(horario_acesso) = YEAR(CURDATE() - INTERVAL 1 MONTH)"
        );
        const lastMonthCount = lastMonthResult[0].count;

        const todayPercent = yesterdayCount > 0 ? (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(1) : (todayCount > 0 ? "100" : "0");
        const weekPercent = lastWeekCount > 0 ? (((weekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1) : (weekCount > 0 ? "100" : "0");
        const monthPercent = lastMonthCount > 0 ? (((monthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1) : (monthCount > 0 ? "100" : "0");

        res.json({
            today: { count: todayCount, percent: `${todayPercent}%` },
            week: { count: weekCount, percent: `${weekPercent}%` },
            month: { count: monthCount, percent: `${monthPercent}%` }
        });

    } catch (error) {
        console.error('Erro ao buscar dados de resumo do dashboard:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao carregar resumo.' });
    }
};

// Dados para o gráfico de fluxo
exports.getFlowByHour = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(horario_acesso, '%H:00') as hora,
                COUNT(*) as qtd
            FROM
                acessos
            WHERE
                DATE(horario_acesso) = CURDATE()
            GROUP BY
                hora
            ORDER BY
                hora ASC;
        `);

        const fullDayData = Array.from({ length: 24 }, (_, i) => {
            const hour = String(i).padStart(2, '0');
            return { hora: `${hour}:00`, qtd: 0 };
        });

        const chartData = fullDayData.map(hourSlot => {
            const found = rows.find((row) => row.hora === hourSlot.hora);
            return found ? { hora: found.hora, qtd: found.qtd } : hourSlot;
        });

        res.json(chartData);

    } catch (error) {
        console.error('Erro ao buscar dados de fluxo por hora:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao carregar fluxo por hora.' });
    }
};

// Últimos acessos
exports.getRecentAccesses = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                a.id,
                u.nome,
                u.matricula,
                DATE_FORMAT(a.horario_acesso, '%H:%i') as horario
            FROM
                acessos a
            JOIN
                usuarios u ON a.usuario_id = u.id
            ORDER BY
                a.horario_acesso DESC
            LIMIT 10;
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar acessos recentes:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao carregar acessos recentes.' });
    }
};