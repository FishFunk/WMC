var mongoose = require('mongoose');
var Coupon = mongoose.model('Coupon');
var _ = require('underscore');
var ctrlMsgs = require('./messenger');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

// Admin console only
module.exports.getAllCoupons = (req, res)=>{
	try{
		Coupon.find({},
			(err, docs) =>{
				if(err){
					console.error(err);
					sendJsonResponse(res, internalErrorCode, "DB Failure - getAllCoupons", err);
				}
				else {
					sendJsonResponse(res, readSuccessCode, "Success", docs);
				}
			});
	}
	catch(ex){
		console.error(ex);
		sendJsonResponse(res, internalErrorCode, "Exception thrown - getAllCoupons", ex);
	}
};

// Admin console only
module.exports.createCoupon = (req, res)=>{
	if(req.body && req.body.coupon){
		Coupon.create(req.body.coupon, 
			(err, coupon)=>{
				if(err){
					console.error(err);
					sendJsonResponse(res, internalErrorCode, "DB Failure - createCoupon", err);
				} else {
					sendJsonResponse(res, createSuccessCode, "Coupon added", coupon);
				}
			});
	} else {
		sendJsonResponse(res, badRequestCode, "Invalid request body");
	}
};

// Admin console only
module.exports.deleteSingleCoupon = (req, res)=>{
	const id = req.query.id;
	if(id){
		Coupon.remove({ '_id' : id},
			(err)=>{
				if(err){
					console.error(err);
					sendJsonResponse(res, internalErrorCode, "DB Failure - deleteSingleAppointment", err);
				} else {
					sendJsonResponse(res, noContentSuccessCode, "Success");
				}
			});
	} else {
		sendJsonResponse(res, badRequestCode, "No ID param");
	}
};

module.exports.verifyCoupon = (req, res)=>{
	try{
		if(req.body && req.body.code)
		{
			var today = new Date();
			Coupon.findOne( { $or: [{code: req.body.code, startDate: { $lte: today }, endDate:  null },
				{code: req.body.code, startDate: { $lte: today }, endDate: { $gte: today } }] },
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
	} catch (ex) {
		sendJsonResponse(res, internalErrorCode, "Exception");
	}
};

module.exports.createOneTimeCoupon = (req, res)=>{
	try{
		if(req.body && req.body.email && req.body.amount && req.body.duration){
			var now = new Date();
			var end = new Date();
			const duration = parseInt(req.body.duration);
			end.setDate(now.getDate() + duration);

			const email = req.body.email;
			const coupon = {
				code: generateRandomCouponCode(),
				startDate: now,
				endDate: end,
				amount: req.body.amount,
				onlyUseOnce: true
			};

			Coupon.create(coupon, (err, coup)=>{
				if(err){
					console.error("DB Failure - createOneTimeCoupon");
					console.error(err);
					sendJsonResponse(res, internalErrorCode, "Failed to create coupon");
				} else {
					ctrlMsgs.sendCouponCode(coup, email, duration, res);
				}
			});
		} else {
			sendJsonResponse(res, badRequestCode, "Bad request body");
		}
	} catch (ex) {
		console.log("Failure creating one time coupon");
		console.error(ex);
		sendJsonResponse(res, internalErrorCode, "Exception");
	}
}

var generateRandomCouponCode = ()=>{
	var code = "";
	const chars = ['A','B','C','D','E','F','G','H','I','J', 
	'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
	'1','2','3','4','5','6','7','8','9','0'];

	const sample = _.sample(chars, 6);

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