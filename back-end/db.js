// rfid-backend/db.js

const mysql = require("mysql2/promise");

// Configuração da Conexão com o Banco de Dados MySQL
const dbConfig = {
  host: "localhost",
  user: "root", // Ou seu usuário MySQL
  password: "admin", // Sua senha do MySQL
  database: "pj-hs", // Nome do banco de dados que você criou
  waitForConnections: true, // Se não houver conexões disponíveis, espere
  connectionLimit: 10, // Máximo de 10 conexões no pool
  queueLimit: 0, // Sem limite para fila de requisições
};

// Cria um pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig);

// Testar a conexão com o banco de dados ao iniciar o módulo
pool
  .getConnection()
  .then((connection) => {
    console.log("Conectado ao banco de dados MySQL!");
    connection.release(); // Libera a conexão de volta para o pool
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados MySQL:", err.message);
    // Em um ambiente de produção, você pode querer logar isso e notificar
    process.exit(1); // Encerra a aplicação se a conexão falhar
  });

module.exports = pool;
