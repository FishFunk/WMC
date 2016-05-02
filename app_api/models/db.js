var mongoose = require('mongoose');
require('./users');

var dbURI = 'mongodb://localhost/WMC';

if (process.env.NODE_ENV === 'production'){
	dbUri = process.env.MONGODB_URI;
}

mongoose.connection.on('connected', function(){
	console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err){
	console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function(){
	console.log('Mongoose disconnected');
});

// Nodemon restart/quit event
process.once('SIGUSR2', function(){
	gracefulShutdown('nodemon restart', function(){
		process.kill(process.pid, 'SIGUSR2');
	});
});

// App shutdown
process.on('SIGINT', function(){
	gracefulShutdown('App termination', function(){
		process.exit(0);
	});
});

// Heroku app shutdown
process.once('SIGTERM', function(){
	gracefulShutdown('Heroku app shutdown', function(){
		process.exit(0);
	});
});

var gracefulShutdown = function(msg, callback){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};


mongoose.connect(dbURI);