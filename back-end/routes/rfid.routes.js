const express = require("express");
const router = express.Router();
const rfidController = require("../controllers/rfid.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/leitura", rfidController.registrarLeitura);
router.get("/leituras-recentes", rfidController.getLeiturasRecentes);
router.get("/historico", authMiddleware.protect, rfidController.getHistoricoAcessos);
router.get("/estatisticas", authMiddleware.protect, rfidController.getEstatisticasAcessos);

module.exports = router;
