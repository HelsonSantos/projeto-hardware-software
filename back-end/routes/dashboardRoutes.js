const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.post('/acessos', dashboardController.registerAccess);         
router.get('/resumo', dashboardController.getDashboardSummary);     
router.get('/fluxo-por-hora', dashboardController.getFlowByHour);    
router.get('/acessos-recentes', dashboardController.getRecentAccesses);

module.exports = router;