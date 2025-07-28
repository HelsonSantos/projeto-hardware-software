#!/usr/bin/env node

const mysql = require("mysql2/promise");

async function testDatabase() {
  try {
    // Configuração da conexão
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "projeto_hardware_software",
    });

    console.log("✅ Conectado ao banco de dados!");

    // Verificar se a tabela logs_rfid existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'logs_rfid'
    `);

    if (tables.length === 0) {
      console.log("❌ Tabela logs_rfid não existe!");
      return;
    }

    console.log("✅ Tabela logs_rfid existe!");

    // Verificar estrutura da tabela
    const [columns] = await connection.execute(`
      DESCRIBE logs_rfid
    `);

    console.log("📋 Estrutura da tabela logs_rfid:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.Field}: ${col.Type} ${
          col.Null === "YES" ? "NULL" : "NOT NULL"
        }`
      );
    });

    // Verificar se há dados
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM logs_rfid
    `);

    console.log(`📊 Total de registros: ${count[0].total}`);

    // Testar query simples
    const [testQuery] = await connection.execute(`
      SELECT id, uid, tipo, data_hora FROM logs_rfid LIMIT 5
    `);

    console.log("🔍 Teste de query simples:");
    testQuery.forEach((row) => {
      console.log(
        `  - ID: ${row.id}, UID: ${row.uid}, Tipo: ${row.tipo}, Data: ${row.data_hora}`
      );
    });

    // Testar query com JOIN
    const [testJoin] = await connection.execute(`
      SELECT 
        l.id,
        l.uid,
        l.tipo,
        l.data_hora,
        u.nome,
        u.matricula
      FROM logs_rfid l
      LEFT JOIN usuarios u ON l.uid = u.tagRfid
      ORDER BY l.data_hora DESC
      LIMIT 5
    `);

    console.log("🔍 Teste de query com JOIN:");
    testJoin.forEach((row) => {
      console.log(
        `  - ID: ${row.id}, UID: ${row.uid}, Tipo: ${row.tipo}, Nome: ${
          row.nome || "Não cadastrado"
        }`
      );
    });

    await connection.end();
    console.log("✅ Teste concluído!");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testDatabase();
