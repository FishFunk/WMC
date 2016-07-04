var mongoose = require('mongoose');

var couponSchema = new mongoose.Schema({
	code: { type: String, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date },
	discountPercentage: {type: Number, required: true}
});

mongoose.model('Coupon', couponSchema);