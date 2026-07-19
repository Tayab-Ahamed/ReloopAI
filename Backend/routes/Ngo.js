const express = require('express');
const router = express.Router();

const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
const {
  getPendingNgos,
  updateNgoVerification,
  getNgoById,
  getTotalNgos,
} = require('../controllers/Ngo');

const requireAdmin = [authMiddleware, requireRoles('Admin')];

router.get('/pending', ...requireAdmin, getPendingNgos);
router.get('/totalngos', ...requireAdmin, getTotalNgos);
router.get('/:id', ...requireAdmin, getNgoById);
router.patch('/:id/verification', ...requireAdmin, updateNgoVerification);

module.exports = router;
