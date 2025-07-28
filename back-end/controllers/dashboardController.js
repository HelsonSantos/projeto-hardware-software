const pool = require("../db"); // Importa o pool de conexão do banco de dados

// Registrar um novo acesso
exports.registerAccess = async (req, res) => {
  const { tagRfid } = req.body;
  if (!tagRfid) {
    return res
      .status(400)
      .json({ message: "Tag RFID é obrigatória para registrar o acesso." });
  }

  try {
    const [users] = await pool.execute(
      "SELECT id FROM usuarios WHERE tagRfid = ?",
      [tagRfid]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para esta Tag RFID." });
    }

    const userId = users[0].id;

    const [result] = await pool.execute(
      "INSERT INTO acessos (usuario_id, tag_rfid) VALUES (?, ?)",
      [userId, tagRfid]
    );
    res
      .status(201)
      .json({
        message: "Acesso registrado com sucesso!",
        accessId: result.insertId,
      });
  } catch (error) {
    console.error("Erro ao registrar acesso:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao registrar acesso." });
  }
};

// Resumo (Hoje, Semana, Mês) - Usando logs_rfid
exports.getDashboardSummary = async (req, res) => {
  try {
    // Acessos de hoje
    const [todayResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE DATE(data_hora) = CURDATE()"
    );
    const todayCount = todayResult[0].count;

    // Acessos de ontem
    const [yesterdayResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE DATE(data_hora) = CURDATE() - INTERVAL 1 DAY"
    );
    const yesterdayCount = yesterdayResult[0].count;

    // Acessos da semana atual
    const [weekResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1)"
    );
    const weekCount = weekResult[0].count;

    // Acessos da semana passada
    const [lastWeekResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE() - INTERVAL 7 DAY, 1)"
    );
    const lastWeekCount = lastWeekResult[0].count;

    // Acessos do mês atual
    const [monthResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE MONTH(data_hora) = MONTH(CURDATE()) AND YEAR(data_hora) = YEAR(CURDATE())"
    );
    const monthCount = monthResult[0].count;

    // Acessos do mês passado
    const [lastMonthResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM logs_rfid WHERE MONTH(data_hora) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(data_hora) = YEAR(CURDATE() - INTERVAL 1 MONTH)"
    );
    const lastMonthCount = lastMonthResult[0].count;

    // Calcular percentuais
    const todayPercent =
      yesterdayCount > 0
        ? (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(1)
        : todayCount > 0
        ? "100"
        : "0";
    const weekPercent =
      lastWeekCount > 0
        ? (((weekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1)
        : weekCount > 0
        ? "100"
        : "0";
    const monthPercent =
      lastMonthCount > 0
        ? (((monthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1)
        : monthCount > 0
        ? "100"
        : "0";

    res.json({
      today: { count: todayCount, percent: `${todayPercent}%` },
      week: { count: weekCount, percent: `${weekPercent}%` },
      month: { count: monthCount, percent: `${monthPercent}%` },
    });
  } catch (error) {
    console.error("Erro ao buscar dados de resumo do dashboard:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao carregar resumo." });
  }
};

// Dados para o gráfico de fluxo - Usando logs_rfid
exports.getFlowByHour = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(data_hora, '%H:00') as hora,
                COUNT(*) as qtd
            FROM
                logs_rfid
            WHERE
                DATE(data_hora) = CURDATE()
            GROUP BY
                hora
            ORDER BY
                hora ASC;
        `);

    const fullDayData = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      return { hora: `${hour}:00`, qtd: 0 };
    });

    const chartData = fullDayData.map((hourSlot) => {
      const found = rows.find((row) => row.hora === hourSlot.hora);
      return found ? { hora: found.hora, qtd: found.qtd } : hourSlot;
    });

    res.json(chartData);
  } catch (error) {
    console.error("Erro ao buscar dados de fluxo por hora:", error);
    res
      .status(500)
      .json({
        message: "Erro interno do servidor ao carregar fluxo por hora.",
      });
  }
};

// Últimos acessos - Usando logs_rfid
exports.getRecentAccesses = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT
                l.id,
                u.nome,
                u.matricula,
                DATE_FORMAT(l.data_hora, '%H:%i') as horario
            FROM
                logs_rfid l
            LEFT JOIN
                usuarios u ON l.uid = u.tagRfid
            ORDER BY
                l.data_hora DESC
            LIMIT 10;
        `);

    // Processar dados para incluir informações de novos usuários
    const acessosProcessados = rows.map((acesso) => ({
      id: acesso.id,
      nome: acesso.nome || "Não cadastrado",
      matricula: acesso.matricula || "",
      horario: acesso.horario,
      novoUsuario: !acesso.nome,
    }));

    res.json(acessosProcessados);
  } catch (error) {
    console.error("Erro ao buscar acessos recentes:", error);
    res
      .status(500)
      .json({
        message: "Erro interno do servidor ao carregar acessos recentes.",
      });
  }
};
