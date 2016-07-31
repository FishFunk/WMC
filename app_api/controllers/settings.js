var mongoose = require('mongoose');
var Settings = mongoose.model('Settings');
var _ = require('underscore');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.getSystemSettings = (req, res)=>{
	Settings.find({}, 
		(err, settings)=>{
			if(err){
				sendJsonResponse(res, internalErrorCode, err);
			} else {
				const result = _.reduce(settings, (obj, setting)=>{
					obj[setting.key] = setting.value;
					return obj;
				}, {});
				sendJsonResponse(res, readSuccessCode, "success", result);
			}
		});
};


var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};