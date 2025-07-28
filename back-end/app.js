const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("./db");

const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const rfidRoutes = require("./routes/rfid.routes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

// Configuração do CORS
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", authMiddleware.protect, userRoutes);
app.use("/api/dashboard", authMiddleware.protect, dashboardRoutes);
app.use("/api/rfid", rfidRoutes);

// WebSocket para comunicação em tempo real
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado:", socket.id);
  });

  // Emitir alerta de novo usuário
  socket.on("novoUsuarioDetectado", (data) => {
    console.log("⚠️ Novo usuário detectado via WebSocket:", data);
    io.emit("alertaNovoUsuario", data);
  });

  // Emitir confirmação de usuário cadastrado
  socket.on("usuarioCadastrado", (data) => {
    console.log("✅ Usuário cadastrado via WebSocket:", data);
    io.emit("usuarioCadastradoConfirmado", data);
  });
});

// Função para emitir alertas (usada pelo controller RFID)
app.locals.emitirAlertaNovoUsuario = (dados) => {
  io.emit("alertaNovoUsuario", dados);
};

app.use((req, res, next) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor." });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
