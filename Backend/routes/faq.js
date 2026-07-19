const express = require('express');
const router = express.Router();
const { getAllFAQs, addNewFAQ, deleteFAQ } = require('../controllers/faqController');
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');

router.get('/', getAllFAQs);
router.post('/', authMiddleware, requireRoles('Admin'), addNewFAQ);
router.delete('/:id', authMiddleware, requireRoles('Admin'), deleteFAQ);

module.exports = router;
