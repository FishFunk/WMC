var mongoose = require('mongoose');
var Usr = mongoose.model('User');
var _ = require('underscore');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.updateUser = (req, res)=>{
	if(req.body && req.body.email)
	{
		Usr.update({email: req.body.email.trim().toLowerCase()},
		{
			appointments: req.body.appointments || [],
			cars: req.body.cars,
			phone: req.body.phone,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			locations: req.body.locations,
			lastLogin: new Date()
		}, (err, usr)=>{
			if(err){
				console.error(err);
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
	   .select('appointments.date appointments.timeEstimate appointments.timeRange appointments.timeRangeKey')
	   .exec((err, docs)=>{
		if(err){
			console.error(err);
			sendJsonResponse(res, internalErrorCode, "DB Failure - getFutureAppointments", err);
		} else {
			var now = new Date();
			var userAppointments = _.flatten(_.map(docs, (d)=>{ return d.appointments }));
			var result = _.filter(userAppointments, (appt)=> {
				return appt.date > now;
			});
			
			sendJsonResponse(res, readSuccessCode, "Success", result);
		}
	});
};

// Used by admin console only
module.exports.getAllAppointments = (req, res)=>{
	Usr.find()
	   .select('firstName lastName phone email appointments')
	   .exec((err, docs)=>{
		if(err){
			console.error(err);
			sendJsonResponse(res, internalErrorCode, "DB Failure - getAllAppointments", err);
		} else {
			var userAppointments = [];

			_.each(docs, (doc)=>{
				_.each(doc.appointments, (appt)=>{
					// Add user info to appointment
					var apptCopy = JSON.parse(JSON.stringify(appt));
					apptCopy.firstName = doc.firstName;
					apptCopy.lastName = doc.lastName;
					apptCopy.phone = doc.phone;
					apptCopy.email = doc.email;
					userAppointments.push(apptCopy);
				});
			});

			sendJsonResponse(res, readSuccessCode, "Success", userAppointments);
		}
	});
};

// Used by admin console only
module.exports.deleteExpiredAppointments = (req, res)=>{
	var now = new Date();
 	now.setDate(now.getDate()-1);
	var now = now.toISOString();
	Usr.update({}, { $pull : { 'appointments': { 'date': { $lt: now } } } }, {multi: true},
		(err, docs)=>{
		if(err){
			console.error(err);
			sendJsonResponse(res, internalErrorCode, "DB Failure - deleteExpiredAppointments", err);
		} else {
			sendJsonResponse(res, noContentSuccessCode, "Success");
		}
	});
};

// Used by admin console only
module.exports.deleteSingleAppointment = (req, res)=>{
	const id = req.query.id;
	if(id){
		Usr.findOneAndUpdate({'appointments._id' : id}, { $pull : {'appointments' : { '_id' : id} } },
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

// Used by admin console only
module.exports.updateAppointment = (req, res)=>{
	try{
		if(req.body && req.body.appt){
			Usr.findOneAndUpdate({'appointments._id' : req.body.appt._id}, { $set : {'appointments.$' : req.body.appt } },
				(err)=>{
					if(err){
						console.error(err);
						sendJsonResponse(res, internalErrorCode, "DB Failure - deleteSingleAppointment", err);
					} else {
						sendJsonResponse(res, noContentSuccessCode, "Success");
					}
				});
		} else {
			sendJsonResponse(res, badRequestCode, "No request body");
		}
	} catch(ex){
		console.error(ex);
		sendJsonResponse(res, internalErrorCode, 'Failure updating appointment');
	}
};

// Used by admin console only
module.exports.getUserEmails = (req, res)=>{
	try{
		Usr.find()
		   .select('email')
		   .exec((err, docs)=>{
		   		if(err) {
					console.error(err);
					sendJsonResponse(res, internalErrorCode, "DB Failure - getUsersEmails", err);
				} else {
					var emails = _.map(docs, (d)=> { return d.email });
					sendJsonResponse(res, readSuccessCode, "Success", emails);
				}
		   });
	}
   catch(ex){
		console.error(ex);
		sendJsonResponse(res, internalErrorCode, 'Failure getting user emails');
   }
};

module.exports.createNewUser = (req, res)=>{
	if(req.body && req.body.email)
	{
		Usr.create({
			appointments: [],
			cars: [],
			email: req.body.email.trim().toLowerCase(),
			phone: "",
			firstName: "",
			lastName: "",
			pwd: req.body.pwd,
			locations: [],
			isGuest: req.body.isGuest,
			lastLogin: new Date()
		}, (err, usr)=>{
			if(err){
				console.error(err);
				sendJsonResponse(res, internalErrorCode, "DB Failure - createUser", err);
			} else {
				sendJsonResponse(res, createSuccessCode, "Success", usr);
			}
		});
	} else {
		sendJsonResponse(res, badRequestCode, "No email in request body");
	}
};

module.exports.getUserByEmail = (req, res)=>{
	if(req.body && req.body.email)
	{
		Usr.findOne({email: req.body.email.trim().toLowerCase()}, (err, usr)=>{
			if (err){
				console.error(err);
				sendJsonResponse(res, internalErrorCode, err, "DB Failure - getUserByEmail");
			} else if(!usr){
				sendJsonResponse(res, noContentSuccessCode, "User email not found");
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
		Usr.findOne({email: req.body.email.trim().toLowerCase(), pwd: req.body.pwd}, (err, usr)=>{
			if(err){
				console.error(err);
				sendJsonResponse(res, internalErrorCode, "DB Error - getUserByEmailAndPwd", err);
			} else if(!usr){
				sendJsonResponse(res, noContentSuccessCode, "No matching usr and pwd");
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