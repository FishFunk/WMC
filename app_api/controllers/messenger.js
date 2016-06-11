var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mongoose = require('mongoose');
var Usr = mongoose.model('User');

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

const ul = "<ul>";
const _ul = "</ul>";
const li = "<li>";
const _li = "</li>";
const br = "<br/>";
const strong = "<strong>";
const _strong = "</strong>";

var transport;
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

if(DEBUG_MODE){
	console.log("Running in DEBUG MODE");
} else {
	transport = mailer.createTransport(
		smtpTransport({
			service: '1und1',
			auth: {
				user: process.env.CONFIRM_EMAIL,
				pass: process.env.CONFIRM_PWD
			}
		}));

	transport.verify((error, success)=>{
		if(error){
			console.log(error);
		} else {
			console.log('Server ready for messages');
		}
	});
}

module.exports.forgotPassword = (req, res)=>{
	if(DEBUG_MODE){
		sendJsonResponse(res, noContentSuccessCode, 'DEBUG MODE - Password reminder email sent!');
		return;
	}
	if(req.body && req.body.email)
	{
		Usr.findOne({email: req.body.email.trim().toLowerCase()})
			.select('email pwd')
			.exec((err, usr)=>{
			if(err){
				sendJsonResponse(res, internalErrorCode, "DB Failure - unable to retrieve password", err);
			} else if (!usr) {
				sendJsonResponse(res, badRequestCode, "No matching user email - unable to retrieve password", err);
			}
			else {
				transport.sendMail({
					from: 'WashMyCar <donotreply@washmycarva.com>',
					to: usr.email,
					subject: 'Forgot Password',
					html:
	      			'<html style="font-family: sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">\
	      			<body>\
					<div style="padding-right: 15px; padding-left: 15px; margin-right: auto; margin-left: auto;">\
				    	<div style="text-align: center;">\
				    	<img src="https://mysterious-journey-72211.herokuapp.com/img/wmc_logo.jpg" style="width:150px;">\
				    	</div>\
					    <hr>\
					    <p>Forgot your password, eh? Don\'t worry it happens to the best of us! The good news is we\'ve got you covered. Below are your WMC credentials.</p>\
					    <u>Email:</u><h4>' + req.body.email + '</h4>\
					    <u>Pwd:</u><h4>' + usr.pwd + '</h4>\
					    <p>Now keep it in a safe place! Thanks for choosing WMC! We look forward to servicing you.</p>\
    					<a href="http://www.washmycarva.com" value="Go to WMC" style="color: rgb(255, 255, 255);background-color: rgb(0, 126, 255);border-color: rgb(0, 100, 255);display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: normal; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; border-radius: 4px;">Go to WMC</a>\
					    <hr>\
					    <p>If you didn\'t request to retrieve your password, please contact us immediately!</p>\
					    Phone: <a href="tel:+10000000000">000.000.0000</a>\
					    Email: <a href="mailto:contact@washmycarva.com">contact@washmycarva.com!</a>\
					  </div>\
					</body>\
					</html>'
				},
					(err, responseStatus)=>{
						sendJsonResponse(res, noContentSuccessCode, "Success");
					});
			}
		});
	} else 
	{
		sendJsonResponse(res, badRequestCode, "No request body");
	}
}

module.exports.sendConfirmationEmail = (req, res)=>{
	if(DEBUG_MODE){
		sendJsonResponse(res, noContentSuccessCode, 'DEBUG MODE - Confirmation email(s) sent!');
		return;
	}

	if(req.body && req.body.email && req.body.appointments){
		var userEmail = req.body.email;
		var appts = req.body.appointments;

		transport.sendMail({
          from: 'WashMyCar <donotreply@washmycarva.com>',
          to: userEmail,
          bcc: [process.env.BCC_EMAIL_1, process.env.BCC_EMAIL_2],
          subject: 'Order Confirmation',
	      html:
	      	'<html style="font-family: sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">\
	      		<body>\
				<div style="padding-right: 15px; padding-left: 15px; margin-right: auto; margin-left: auto;">\
				    <div style="text-align: center;">\
				    <img src="https://mysterious-journey-72211.herokuapp.com/img/wmc_logo.jpg" style="width:150px;">\
				    </div>\
				    <hr>\
	      			<p>Thanks for your WMC order! We hope you enjoy your soon-to-be sparkling clean vehicle!</p>\
	      			<legend>Your Appointment Details</legend>'
	      			+ formatAppts(req.body.appointments) +
	      		'</div>\
	      		</body>\
	      	</html>'
        },(err, responseStatus)=>{
		  if (err) {
		    sendJsonResponse(res, internalErrorCode, 'Failed to send confirmation email(s).', err);
		    console.log(err);
		  } else {
		    sendJsonResponse(res, noContentSuccessCode, 'Confirmation email(s) sent!');
		  }
        });
	} else {
		sendJsonResponse(res, badRequestCode, "Bad request body");
	}
};

var formatAppts = (appts)=>{
	var apptHtml = "";

	appts.forEach(apt =>{
	  var dt = new Date(apt.date);
	  apptHtml  += ul +
	    li + strong + 'Where: ' + _strong + formatLocation(apt.location) + _li +
	    li + strong + 'Date: ' + _strong + dt.toLocaleDateString("en-US") + _li + 
	    li + strong + 'Time: ' + _strong + apt.timeRange + _li + 
	    li + strong + 'Cars:' + _strong + formatCars(apt.cars) + _li +
	    li + strong + 'Services:'  + _strong + formatServices(apt.services) + _li +
	    li + strong + 'Cost: $' + _strong + apt.price.toString() + _li +
	    _ul + '<hr>'
	});

	return apptHtml;
}

var formatServices = (services)=>{
	var html = ul;

	services.forEach((svc)=>{
	  html += li + svc + _li;
	});

	html += _ul;

	return html;
}

var formatCars = (cars)=>{
	var html = ul;
	cars.forEach((car)=>{
	  html += li + car.color + " " + car.make + " " + car.model + _li;
	});

	html += _ul;

	return html;
}

var formatLocation = (loc)=>{
	return br + loc.street + br + loc.city + ',' + " " + loc.state + loc.zip; 
}

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};



