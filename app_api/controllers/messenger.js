var mongoose = require('mongoose');
var Usr = mongoose.model('User');
var SparkPost = require('sparkpost');
var sp;

if(process.env === 'production'){
	sp = new SparkPost(process.env.SPARKPOST_API_KEY);
} else {
	sp = new SparkPost('DEBUG_KEY');
}

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

module.exports.forgotPassword = (req, res)=>{
	sendJsonResponse(res, 404, "Not yet implemented");
}

module.exports.sendConfirmationEmail = (req, res)=>{
	if(req.body && req.body.email && req.body.appointments)
	{
		var userEmail = req.body.email
		var appts = req.body.appointments;

		sp.transmissions.send({
		  transmissionBody: {
		    content: {
		      from: 'donotreply@washmycarva.com',
		      subject: 'Your WMC Confirmation!',
		      html:
		      	'<html>\
		      		<body>\
		      		<p>Thanks for your WMC order! We hope you enjoy your soon-to-be sparkling clean vehicle!</p>\
		      		<h4>Your Appointment Details</h4>'
		      		+ formatAppts(req.body.appointments) +
		      		'</body>\
		      	</html>'
		    },
		    recipients: [
		      {address: userEmail},
		      {address: 'fishfry62@gmail.com'}
		    ]
		  }
		}, function(err, data) {
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

	var emailHtml = '\
	    <p>Thanks for your WMC order! We hope you enjoy your soon-to-be sparkling clean vehicle!</p>\
	    <h4>Your Appointment Details</h4>' +
	    apptHtml

	return emailHtml;
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