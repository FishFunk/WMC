var mongoose = require('mongoose');
var Coupon = mongoose.model('Coupon');
var _ = require('underscore');
var ctrlMsgs = require('./messenger');

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
				console.error(err);
				sendJsonResponse(res, internalErrorCode, "DB Failure - verifyCoupon", err);
			} else if (!coupon) {
				sendJsonResponse(res, noContentSuccessCode, "Invalid coupon");
			} else {
				if(coupon.onlyUseOnce){
					Coupon.remove({_id: coupon._id}, (err)=>{
						if(err){
							console.error("Failed to remove one time coupon");
							console.error(err);
							sendJsonResponse(res, internalErrorCode, "Failed to remove one time coupon");
						} else {
							sendJsonResponse(res, readSuccessCode, "Success", coupon);
						}
					});
				} else {
					sendJsonResponse(res, readSuccessCode, "Success", coupon);
				}
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "Invalid request body");
	}
};

// Not exposed to API - used by user.js
module.exports.createTempCoupon = (email)=>{
	var now = new Date();
	var end = new Date();
	end.setHours(now.getHours() + 12);

	const couponCode = generateRandomCouponCode();

	if(email)
	{
		Coupon.create({
			code: couponCode,
			startDate: now,
			endDate: end,
			discountPercentage: 50,
			onlyUseOnce: true
		}, (err, coupon)=>{
			if(err){
				console.log("DB Failure - createTempCoupon");
				console.error(err);
			} else {
				ctrlMsgs.sendCouponCode(couponCode, email);
			}
		});
	} else {
		console.log("No email provided - createTempCoupon");
	}
}

var generateRandomCouponCode = ()=>{
	var code = "";
	const chars = ['A','B','C','D','E','F','G','H','I','J', 
	'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
	'1','2','3','4','5','6','7','8','9','0'];

	const sample = _.sample(chars, 7);

	_.each(sample, (char)=>{
		code += char;
	});

	return code;
}

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};