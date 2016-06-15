var mongoose = require('mongoose');
var Usr = mongoose.model('Admin');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.verifyAdmin = (req, res)=>{
	if(req.body && req.body.usr && req.body.pwd)
	{
		Usr.findOne({usr: req.body.usr, pwd: req.body.pwd}, 
			(err, admin)=>{
			if(err){
				sendJsonResponse(res, internalErrorCode, "DB Failure - verifyAdmin", err);
			} else if (!admin) {
				sendJsonResponse(res, noContentSuccessCode, "No matching usr and pwd");
			} else {
				sendJsonResponse(res, readSuccessCode, "Success", admin);
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "Invalid request body");
	}
};

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};