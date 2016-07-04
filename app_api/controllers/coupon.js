var mongoose = require('mongoose');
var Coupon = mongoose.model('Coupon');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.verifyCoupon = (req, res)=>{
	if(req.body && req.body.code)
	{
		var today = new Date();
		Coupon.findOne({code: req.body.code, startDate: { $lte: today}, endDate: { $gte: today} }, 
			(err, coupon)=>{
			if(err){
				console.log(err);
				sendJsonResponse(res, internalErrorCode, "DB Failure - verifyCoupon", err);
			} else if (!coupon) {
				sendJsonResponse(res, noContentSuccessCode, "Invalid coupon");
			} else {
				sendJsonResponse(res, readSuccessCode, "Success", coupon);
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