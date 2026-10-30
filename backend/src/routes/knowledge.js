const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/documents', knowledgeController.getDocuments);
router.post('/upload', knowledgeController.uploadDocument);
router.post('/simulate', knowledgeController.simulateSearch);
router.delete('/documents/:id', knowledgeController.deleteDocument);

module.exports = router;
