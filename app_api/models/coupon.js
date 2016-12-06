var mongoose = require('mongoose');

var couponSchema = new mongoose.Schema({
	code: { type: String, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date },
	amount: {type: Number, required: true},
	onlyUseOnce: { type: Boolean }
});

mongoose.model('Coupon', couponSchema);