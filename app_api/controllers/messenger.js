var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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
	sendJsonResponse(res, 404, "Not yet implemented");
}

module.exports.sendConfirmationEmail = (req, res)=>{
	if(DEBUG_MODE){
		sendJsonResponse(res, noContentSuccessCode, 'DEBUG MODE - Confirmation email(s) sent!');
		return;
	}

	if(req.body && req.body.email && req.body.appointments){
		var userEmail = req.body.email
		var appts = req.body.appointments;

		transport.sendMail({
          from: 'WashMyCar <donotreply@washmycarva.com>',
          to: userEmail,
          bcc: [process.env.BCC_EMAIL_1, process.env.BCC_EMAIL_2],
          subject: 'Order Confirmation',
	      html:
	      	'<html>\
	      		<body>\
	      		<p>Thanks for your WMC order! We hope you enjoy your soon-to-be sparkling clean vehicle!</p>\
	      		<h4>Your Appointment Details</h4>'
	      		+ formatAppts(req.body.appointments) +
	      		'</body>\
	      	</html>'
        }, function(err, responseStatus) {
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