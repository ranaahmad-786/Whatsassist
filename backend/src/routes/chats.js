const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/sessions', chatController.getSessions);
router.get('/sessions/:sessionId/messages', chatController.getMessages);
router.post('/sessions/:sessionId/takeover', chatController.toggleTakeover);
router.post('/sessions/:sessionId/reply', chatController.sendHumanReply);

// Management: Clear, Delete Session, Delete Customer
router.delete('/sessions/:sessionId/messages', chatController.clearSessionMessages);
router.delete('/sessions/:sessionId', chatController.deleteSession);
router.delete('/customers/:customerId', chatController.deleteCustomer);

module.exports = router;
