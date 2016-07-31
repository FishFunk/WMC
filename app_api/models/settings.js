var mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
	key: { type: String, required: true },
	value: { type: mongoose.Schema.Types.Mixed, required: true }
});

mongoose.model('Settings', settingSchema);