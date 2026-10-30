const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', leadController.getLeads);
router.put('/:id', leadController.updateStatus);

module.exports = router;
