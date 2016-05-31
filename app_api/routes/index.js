var express = require('express');
var router = express.Router();
var ctrlUsers = require('../controllers/users');
var ctrlMoney = require('../controllers/money');
var ctrlMsgs = require('../controllers/messenger');

// API Routes
router.post('/createNewUser', ctrlUsers.createNewUser);
router.post('/getUserByEmail', ctrlUsers.getUserByEmail);
router.post('/getUserByEmailAndPwd', ctrlUsers.getUserByEmailAndPwd);

router.get('/getFutureApptDatesAndTimes', ctrlUsers.getFutureApptDatesAndTimes);

router.put('/updateUser', ctrlUsers.updateUser);

router.post('/executeCharge', ctrlMoney.executeCharge);

router.post('/sendConfirmationEmail', ctrlMsgs.sendConfirmationEmail);

module.exports = router;