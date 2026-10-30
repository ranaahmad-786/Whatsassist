const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.get('/whatsapp', webhookController.verify);
router.post('/whatsapp', webhookController.handleIncoming);

module.exports = router;
