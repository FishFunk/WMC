var mongoose = require('mongoose');
var Usr = mongoose.model('User');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.updateUser = function(req, res){
	if(req.body)
	{
		Usr.update({email: req.email},
		{
			appointments: req.body.appointments,
			cars: req.body.cars,
			phone: req.body.phone,
			fullName: req.body.fullName,
			pwd: req.body.pwd,
			locations: req.body.locations,
			lastLogin: new Date()
		}, function(err, usr){
			if(err){
				sendJsonResponse(res, internalErrorCode, "DB Failure - updateUser", err);
			} else {
				sendJsonResponse(res, noContentSuccessCode, "Success");
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "No request body");
	}
};

module.exports.getAllAppointments = function(req, res){
	Usr.find()
	   .select('appointments')
	   .exec(function(err, docs){
		if(err){
			sendJsonResponse(res, internalErrorCode, "DB Failure - getAllAppointments", err);
		} else {
			var result = [];
			docs.forEach(function(doc){
				result = result.concat(doc.appointments);
			});
			sendJsonResponse(res, readSuccessCode, "Success", result);
		}
	});
};

module.exports.createUser = function(req, res){
	if(req.body)
	{
		Usr.create({
			appointments: req.body.appointments,
			cars: req.body.cars,
			email: req.body.email,
			phone: req.body.phone,
			fullName: req.body.fullName,
			pwd: req.body.pwd,
			locations: req.body.locations,
			lastLogin: new Date()
		}, function(err, usr){
			if(err){
				sendJsonResponse(res, internalErrorCode, "DB Failure - createUser", err);
			} else {
				sendJsonResponse(res, createSuccessCode, "Success", usr);
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "No request body");
	}
};

module.exports.getUserByEmail = function(req, res){
	if(req.body && req.body.email)
	{
		Usr.findOne({email: req.body.email}, function(err, usr){
			if(!usr)
			{
				sendJsonResponse(res, noContentSuccessCode, "User email not found");
			}
			else if (err)
			{
				sendJsonResponse(res, internalErrorCode, err, "DB Failure - getUserByEmail");
			} else {
				sendJsonResponse(res, readSuccessCode, "Success", usr);
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "No email in request");
	}
};

module.exports.getUserByEmailAndPwd = function(req, res){
	if(req.body && req.body.email && req.body.pwd)
	{
		Usr.findOne({email: req.body.email, pwd: req.body.pwd}, function(err, usr){
			if(!usr){
				sendJsonResponse(res, noContentSuccessCode, "No matching usr and pwd");
			}

			if(err){
				sendJsonResponse(res, internalErrorCode, "DB Error - getUserByEmailAndPwd", err);
			} else {
				sendJsonResponse(res, readSuccessCode, "Success", usr);
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "Missing data in request");
	}
};


var sendJsonResponse = function(res, status, msg, data){
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};