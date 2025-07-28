const express = require("express");
const router = express.Router();
const rfidController = require("../controllers/rfid.controller");

router.post("/leitura", rfidController.registrarLeitura);
router.get("/leituras-recentes", rfidController.getLeiturasRecentes);
router.get("/historico", rfidController.getHistoricoAcessos);
router.get("/estatisticas", rfidController.getEstatisticasAcessos);

module.exports = router;
