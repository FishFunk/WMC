var express = require('express');
var router = express.Router();
var ctrlUsers = require('../controllers/users');

// API Routes
router.post('/createUser', ctrlUsers.createUser);
router.post('/getUserByEmail', ctrlUsers.getUserByEmail);
router.post('/getUserByEmailAndPwd', ctrlUsers.getUserByEmailAndPwd);

router.get('/getFutureApptDatesAndTimes', ctrlUsers.getFutureApptDatesAndTimes);

router.put('/updateUser', ctrlUsers.updateUser);

module.exports = router;