const express = require('express');
const router = express.Router();

const { authMiddleware, requireRoles } = require('../middlewares/Authentication');
const {getUser, logOut, userProfileUpdate, updateImageProfile, yearlyChartData, FetchRoleBasedData, getDonarDataByID} = require('../controllers/User');


router.get("/getUser", authMiddleware, getUser);
router.get("/role", authMiddleware, requireRoles('Admin'), FetchRoleBasedData);
router.post("/logout", authMiddleware, logOut);
router.post("/updateProfile", authMiddleware, userProfileUpdate);
router.post("/updateProfilePic", authMiddleware, updateImageProfile);
router.get("/donor/:donationId", authMiddleware, getDonarDataByID);
router.get("/yearly-chart-data",authMiddleware,requireRoles('Admin'),yearlyChartData);

module.exports = router;