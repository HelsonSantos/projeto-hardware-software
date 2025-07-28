const express = require('express');
const router = express.Router();
const rfidController = require("../controllers/rfid.controller");

router.post("/leitura", rfidController.receberLeitura);

module.exports = router;
