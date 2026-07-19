const express = require('express');
const router = express.Router();

const {getAllFeedbackWithDonor , getAllFeedbacksWithDonations} = require('../controllers/Feedback');
const { authMiddleware, requireRoles } = require('../middlewares/Authentication');


router.get('/getDonorFeedBack', authMiddleware, getAllFeedbackWithDonor);
router.get('/all-feedbacks', authMiddleware, requireRoles('Admin'), getAllFeedbacksWithDonations);


module.exports = router;