const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');
const authMiddleware = require('../middleware/auth');

// Public tracking by token does not require login (allows WhatsApp customer direct check)
router.get('/track/:token', repairController.trackByToken);

// Protected routes for dashboard management
router.use(authMiddleware);
router.get('/', repairController.getAll);
router.post('/', repairController.create);
router.put('/:id', repairController.update);
router.delete('/:id', repairController.delete);

module.exports = router;
