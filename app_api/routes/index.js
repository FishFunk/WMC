var express = require('express');
var router = express.Router();
var ctrlAdmin = require('../controllers/admin');
var ctrlUsers = require('../controllers/users');
var ctrlMoney = require('../controllers/money');
var ctrlMsgs = require('../controllers/messenger');

// API Routes
router.post('/createNewUser', ctrlUsers.createNewUser);
router.post('/getUserByEmail', ctrlUsers.getUserByEmail);
router.post('/getUserByEmailAndPwd', ctrlUsers.getUserByEmailAndPwd);

router.get('/getFutureApptDatesAndTimes', ctrlUsers.getFutureApptDatesAndTimes);
router.get('/getAllAppointments', ctrlUsers.getAllAppointments);

router.put('/updateUser', ctrlUsers.updateUser);

router.post('/executeCharge', ctrlMoney.executeCharge);

router.post('/sendConfirmationEmail', ctrlMsgs.sendConfirmationEmail);
router.post('/forgotPassword', ctrlMsgs.forgotPassword);

router.delete('/deleteExpiredAppointments', ctrlUsers.deleteExpiredAppointments);

router.post('/verifyAdmin', ctrlAdmin.verifyAdmin);

router.get('/getEnvironment', (req, res)=>{
	sendJsonResponse(res, 200, "Success", process.env.NODE_ENV || "debug");
});

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};

module.exports = router;