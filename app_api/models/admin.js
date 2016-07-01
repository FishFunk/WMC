var mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	phone: { type: String, required: true },
	usr: { type: String, required: true, minlength: 8},
	pwd: { type: String, required: true, minlength: 8}
});

mongoose.model('Admin', adminSchema);