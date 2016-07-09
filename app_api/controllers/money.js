var token = "sk_test_b82cXGA1mx4nejrVn0AK6sxV";
if(process.env.NODE_ENV === 'production')
{
	token = "sk_live_kwp9bgtUP5QdHOiEHq4ChhLG";
}

var stripe = require("stripe")(token);

const badRequestCode = 400;
const internalErrorCode = 500;
const createSuccessCode = 201;
const readSuccessCode = 200;
const noContentSuccessCode = 204;

module.exports.executeCharge = (req, res)=>{
	if(req.body && req.body.stripeToken && req.body.price)
	{
		var token = req.body.stripeToken;
		var price = req.body.price;
		var lastName = req.body.lastName || "???";
		var email = req.body.email || "???";

		var charge = stripe.charges.create({
		  amount: price, // amount in cents
		  currency: "usd",
		  source: token,
		  description: "WMC Charged: " + price.toString() +
		  			   ", Last Name: " + lastName + 
		  			   ", Email: " + email
		}, function(err, charge) {
		  if (err && err.type === 'StripeCardError') {
		    // The card has been declined
		    console.error(err);
		    sendJsonResponse(res, badRequestCode, "Card Declined", err);
		  } else if(err) {
		  	console.error(err);
		  	sendJsonResponse(res, internalErrorCode, "Unknown Stripe error", err);
		  } else {
		  	sendJsonResponse(res, noContentSuccessCode, "Charge success!");
		  }
		});
	} else {
		sendJsonResponse(res, badRequestCode, "No request body");
	}
};

var sendJsonResponse = (res, status, msg, data)=>{
	res.setHeader('Content-Type', 'application/json');
	res.status(status);
	res.send({
		msg: msg,
		data: data
	});
};