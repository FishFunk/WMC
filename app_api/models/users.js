var mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
	color: {type: String, required: true},
	make:{ type: String, required: true},
	model: {type: String, required: true},
	year: {type: Number, required: true},
	tag: String
});

var locationSchema = new mongoose.Schema({
	city: {type: String, required: true},
	state: {type: String, required: true},
	street: {type: String, required: true},	
	title: String,
	zip: {type: String, required: true}
});

var appointmentSchema = new mongoose.Schema({
	cars: [carSchema],
	date: { type: Date, required: true},
	location: locationSchema,
	services: [String],
	timeRange: { type: String, required: true},
	usr: {type: String, required: true}
});

var userSchema = new mongoose.Schema({
	appointments: [appointmentSchema],
	cars: [carSchema],
	email: {type: String, required: true},
	phone: {type: String, required: true},
	fullName: String,
	usr: {type: String, required: true},
	pwd: {type: String, required: true},
	locations: [locationSchema]
});

mongoose.model('User', userSchema);