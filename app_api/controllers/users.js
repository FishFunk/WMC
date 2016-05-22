var mongoose = require('mongoose');
var Usr = mongoose.model('User');
var _ = require('underscore');
// var generator = require('../../tests/data_generator');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

// var addData = ()=>{
// 	for(var i=0; i<50; i++){
// 		var usr = generator.MakeUser();
// 		Usr.collection.insert(usr);
// 	}
// };

// addData();

module.exports.updateUser = (req, res)=>{
	if(req.body && req.body.email)
	{
		Usr.update({email: req.body.email},
		{
			appointments: req.body.appointments,
			cars: req.body.cars,
			phone: req.body.phone,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			locations: req.body.locations,
			lastLogin: new Date()
		}, (err, usr)=>{
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

module.exports.getFutureApptDatesAndTimes = (req, res)=>{
	Usr.find()
	   .select('appointments.date appointments.timeEstimate appointments.timeRange')
	   .exec((err, docs)=>{
		if(err){
			sendJsonResponse(res, internalErrorCode, "DB Failure - getAllAppointments", err);
		} else {
			var now = new Date();
			var futureAppts = [];
			var userAppointmentArrs = _.map(docs, (d)=>{ return d.appointments });
			_.each(userAppointmentArrs, (arr)=>{
				_.each(arr, (appt)=>{
					if(appt.date > now){
						futureAppts.push(appt);
					}
				});
			});
			
			sendJsonResponse(res, readSuccessCode, "Success", futureAppts);
		}
	});
};

module.exports.createUser = (req, res)=>{
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
		}, (err, usr)=>{
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

module.exports.getUserByEmail = (req, res)=>{
	if(req.body && req.body.email)
	{
		Usr.findOne({email: req.body.email}, (err, usr)=>{
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

module.exports.getUserByEmailAndPwd = (req, res)=>{
	if(req.body && req.body.email && req.body.pwd)
	{
		Usr.findOne({email: req.body.email, pwd: req.body.pwd}, (err, usr)=>{
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

var tryParse = function(data){
	var obj = null;
	try{
		obj = JSON.parse(data);
	} catch (ex){
		console.log(ex);
	}

	return obj;
}

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};