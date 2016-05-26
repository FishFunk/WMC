var mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
	color: {type: String, required: true},
	make: {type: String, required: true},
	model: {type: String, required: true},
	size: String, // 2-door, SUV, etc.
	tag: String, // License plate
	year: {type: Number, required: true}
});

var locationSchema = new mongoose.Schema({
	city: {type: String, required: true},
	state: {type: String, required: true},
	street: {type: String, required: true},	
	title: String, // Home, work, etc.
	zip: {type: String, required: true}
});

var appointmentSchema = new mongoose.Schema({
	cars: [carSchema],
	date: { type: Date, required: true},
	location: locationSchema,
	price: Number,
	services: [String],
	timeEstimate: Number, // minutes
	timeRange: { type: String, required: true},
	timeRangeEnum: {type: Number, required: true},
	description: String
});

var userSchema = new mongoose.Schema({
	appointments: [appointmentSchema],
	cars: [carSchema],
	email: {type: String, required: true},
	phone: String,
	firstName: String,
	lastName: String,
	pwd: String,
	locations: [locationSchema],
	lastLogin: Date
});

mongoose.model('User', userSchema);