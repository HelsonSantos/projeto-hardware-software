const pool = require("../db");

exports.registrarLeitura = async (req, res) => {
  try {
    const { uid, tipo } = req.body;

    if (!uid || !tipo) {
      return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    // Primeiro, verificar se o UID existe na tabela de usuários
    const [usuarios] = await pool.execute(
      "SELECT * FROM usuarios WHERE tagRfid = ?",
      [uid]
    );

    let usuarioEncontrado = null;
    let novoUsuario = false;

    if (usuarios.length > 0) {
      // Usuário encontrado
      usuarioEncontrado = usuarios[0];
      console.log(
        `✅ Usuário encontrado: ${usuarioEncontrado.nome} (${usuarioEncontrado.matricula})`
      );
    } else {
      // Usuário não encontrado - novo usuário
      novoUsuario = true;
      console.log(`⚠️ Novo usuário detectado: UID=${uid}`);
    }

    // Registrar o log de leitura
    const sql = `INSERT INTO logs_rfid (uid, tipo) VALUES (?, ?)`;
    const [result] = await pool.execute(sql, [uid, tipo]);

    console.log(`📥 Leitura registrada: UID=${uid}, Tipo=${tipo}`);

    // Retornar resposta com informações do usuário
    if (usuarioEncontrado) {
      res.status(200).json({
        status: "ok",
        mensagem: "Leitura registrada com sucesso.",
        usuario: {
          id: usuarioEncontrado.id,
          nome: usuarioEncontrado.nome,
          matricula: usuarioEncontrado.matricula,
          curso: usuarioEncontrado.curso,
          email: usuarioEncontrado.email,
        },
        novoUsuario: false,
      });
    } else {
      // Emitir alerta via WebSocket para novo usuário
      const alertaData = {
        uid: uid,
        tipo: tipo,
        timestamp: new Date().toISOString(),
        mensagem: "Novo usuário detectado! Cadastre este usuário no sistema.",
      };

      // Emitir via WebSocket se disponível
      if (req.app.locals.emitirAlertaNovoUsuario) {
        req.app.locals.emitirAlertaNovoUsuario(alertaData);
      }

      res.status(200).json({
        status: "ok",
        mensagem: "Leitura registrada com sucesso.",
        novoUsuario: true,
        uid: uid,
        tipo: tipo,
        alerta: "Novo usuário detectado! Cadastre este usuário no sistema.",
        alertaData: alertaData,
      });
    }
  } catch (error) {
    console.error("❌ Erro ao registrar leitura:", error.message);
    res.status(500).json({ mensagem: "Erro ao registrar leitura." });
  }
};

// Buscar leituras recentes com informações de usuários
exports.getLeiturasRecentes = async (req, res) => {
  try {
    const [leituras] = await pool.execute(`
            SELECT 
                l.id,
                l.uid,
                l.tipo,
                l.data_hora,
                u.nome,
                u.matricula,
                u.curso,
                u.email
            FROM logs_rfid l
            LEFT JOIN usuarios u ON l.uid = u.tagRfid
            ORDER BY l.data_hora DESC
            LIMIT 20
        `);

    // Separar leituras de usuários conhecidos e novos usuários
    const leiturasProcessadas = leituras.map((leitura) => ({
      id: leitura.id,
      uid: leitura.uid,
      tipo: leitura.tipo,
      data_hora: leitura.data_hora,
      usuario: leitura.nome
        ? {
            nome: leitura.nome,
            matricula: leitura.matricula,
            curso: leitura.curso,
            email: leitura.email,
          }
        : null,
      novoUsuario: !leitura.nome,
    }));

    res.status(200).json({
      leituras: leiturasProcessadas,
      novosUsuarios: leiturasProcessadas.filter((l) => l.novoUsuario),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar leituras recentes:", error.message);
    res.status(500).json({ mensagem: "Erro ao buscar leituras recentes." });
  }
};

// Buscar histórico de acessos com filtros
exports.getHistoricoAcessos = async (req, res) => {
  try {
    const {
      dataInicio,
      dataFim,
      tipo,
      usuario,
      uid,
      pagina = 1,
      limite = 50,
    } = req.query;

    let whereConditions = [];
    let params = [];

    // Filtro por data
    if (dataInicio) {
      whereConditions.push("l.data_hora >= ?");
      params.push(dataInicio);
    }
    if (dataFim) {
      whereConditions.push("l.data_hora <= ?");
      params.push(dataFim + " 23:59:59");
    }

    // Filtro por tipo
    if (tipo) {
      whereConditions.push("l.tipo = ?");
      params.push(tipo);
    }

    // Filtro por UID
    if (uid) {
      whereConditions.push("l.uid LIKE ?");
      params.push(`%${uid}%`);
    }

    // Filtro por usuário (nome, matrícula, curso)
    if (usuario) {
      whereConditions.push(
        "(u.nome LIKE ? OR u.matricula LIKE ? OR u.curso LIKE ?)"
      );
      params.push(`%${usuario}%`, `%${usuario}%`, `%${usuario}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Calcular offset para paginação
    const offset = (pagina - 1) * limite;

    // Query principal
    const query = `
      SELECT 
        l.id,
        l.uid,
        l.tipo,
        l.data_hora,
        u.nome,
        u.matricula,
        u.curso,
        u.email
      FROM logs_rfid l
      LEFT JOIN usuarios u ON l.uid = u.tagRfid
      ${whereClause}
      ORDER BY l.data_hora DESC
      LIMIT ? OFFSET ?
    `;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM logs_rfid l
      LEFT JOIN usuarios u ON l.uid = u.tagRfid
      ${whereClause}
    `;

    const [leituras] = await pool.execute(query, [
      ...params,
      parseInt(limite),
      offset,
    ]);
    const [countResult] = await pool.execute(countQuery, params);

    const total = countResult[0].total;
    const totalPaginas = Math.ceil(total / limite);

    // Processar leituras
    const leiturasProcessadas = leituras.map((leitura) => ({
      id: leitura.id,
      uid: leitura.uid,
      tipo: leitura.tipo,
      data_hora: leitura.data_hora,
      usuario: leitura.nome
        ? {
            nome: leitura.nome,
            matricula: leitura.matricula,
            curso: leitura.curso,
            email: leitura.email,
          }
        : null,
      novoUsuario: !leitura.nome,
    }));

    res.status(200).json({
      leituras: leiturasProcessadas,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        totalPaginas,
      },
      filtros: {
        dataInicio,
        dataFim,
        tipo,
        usuario,
        uid,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de acessos:", error.message);
    res.status(500).json({ mensagem: "Erro ao buscar histórico de acessos." });
  }
};

// Buscar estatísticas de acessos
exports.getEstatisticasAcessos = async (req, res) => {
  try {
    const { periodo = "hoje" } = req.query;

    let whereClause = "";
    let params = [];

    switch (periodo) {
      case "hoje":
        whereClause = "WHERE DATE(l.data_hora) = CURDATE()";
        break;
      case "semana":
        whereClause = "WHERE l.data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
      case "mes":
        whereClause = "WHERE l.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
      case "todos":
        whereClause = "";
        break;
    }

    // Total de acessos
    const [totalAcessos] = await pool.execute(
      `
      SELECT COUNT(*) as total
      FROM logs_rfid l
      ${whereClause}
    `,
      params
    );

    // Acessos por tipo
    const [acessosPorTipo] = await pool.execute(
      `
      SELECT tipo, COUNT(*) as total
      FROM logs_rfid l
      ${whereClause}
      GROUP BY tipo
    `,
      params
    );

    // Novos usuários
    const [novosUsuarios] = await pool.execute(
      `
      SELECT COUNT(*) as total
      FROM logs_rfid l
      LEFT JOIN usuarios u ON l.uid = u.tagRfid
      ${whereClause}
      WHERE u.nome IS NULL
    `,
      params
    );

    // Acessos por hora (últimas 24h)
    const [acessosPorHora] = await pool.execute(`
      SELECT 
        HOUR(l.data_hora) as hora,
        COUNT(*) as total
      FROM logs_rfid l
      WHERE l.data_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY HOUR(l.data_hora)
      ORDER BY hora
    `);

    res.status(200).json({
      totalAcessos: totalAcessos[0].total,
      acessosPorTipo,
      novosUsuarios: novosUsuarios[0].total,
      acessosPorHora,
      periodo,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error.message);
    res.status(500).json({ mensagem: "Erro ao buscar estatísticas." });
  }
};
