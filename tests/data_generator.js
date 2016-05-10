"use strict";

var _ = require('underscore');

class DataGenerator{
	MakeUser(){
		var appts = [this.MakePassedAppointment(), this.MakeFutureAppointment()];
		return {
			appointments: appts,
			cars: [appts[0].cars[0], appts[1].cars[0]],
			email: this.MakeRandomEmail(),
			phone: _.random(1000000000).toString(),
			fullName: this.MakeRandomWord() + " " + this.MakeRandomWord(),
			pwd: this.MakeRandomWord(10),
			locations: [this.MakeLocation()],
			lastLogin: new Date()
		}
	};

	MakeFutureAppointment(){
		return 	{
			cars: [this.MakeCar()],
    		date: this.GetRandomFutureDate(),
    		location: this.MakeLocation(),
    		price: _.random(29, 250),
    		services: this.GetRandomServiceArray(),
    		timeRange: this.GetRandomTimeRange(),
    		timeEstimate: _.random(30, 120),
    		description: this.MakeRandomSentence()
		};
	};

	MakePassedAppointment(){
		return 	{
			cars: [this.MakeCar()],
    		date: this.GetRandomPassedDate(),
    		location: this.MakeLocation(),
    		price: _.random(29, 250),
    		services: this.GetRandomServiceArray(),
    		timeRange: this.GetRandomTimeRange(),
    		timeEstimate: _.random(30, 120),
    		description: this.MakeRandomSentence()
		};
	};

	MakeLocation(){
		return {
	    	city: this.MakeRandomWord(),
	    	state: this.MakeRandomWord(2),
	    	street: _.random(100, 9999).toString() + " " + this.MakeRandomWord() + " St.",
	    	title: this.MakeRandomWord(),
	    	zip: _.random(10000, 99999).toString()
		};
	};

	MakeCar(){
		return {
			color: this.MakeRandomWord(),
	    	make: this.MakeRandomWord(),
	    	model: this.MakeRandomWord(),
	    	size: this.MakeRandomWord(),
	    	tag: _.random(100,999).toString() + "-" + this.MakeRandomWord(4),
	    	year: this.MakeRandomWord()
		};
	};

	GetRandomFutureDate(){
		var now = new Date();
		now.setDate(now.getDate() + _.random(60));
		return now;
	};

	GetRandomPassedDate(){
		var now = new Date();
		now.setDate(now.getDate() - _.random(60));
		return now;
	};

	GetRandomTimeRange(){
		return _.sample(["9:00 - 12:00PM","12:00 - 3:00PM","3:00 - 6:00PM","6:00 - 9:00PM"]);
	};

	GetRandomServiceArray(){
		var result = ["Exterior Wash"];
		var addOns = _.sample(["Tire Shine", "Interior", "Wax & Buff"], _.random(1,3));
		if(typeof addOns === 'object'){
			result = result.concat(addOns);
		} else if (typeof addOns === 'string'){
			result.push(addOns);
		}

		return result;
	};

	MakeRandomEmail(){
		return this.MakeRandomWord() + "@" + this.MakeRandomWord() + ".com";
	};

	MakeRandomWord(len){
		var word = "";
		const aToZ = ['A','B','C','D','E','F','G','H','I','J', 
		'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		len = len != null ? len : _.random(3,15);
		for(let i=0; i<len; i++){
			const idx = _.random(25);
			word += aToZ[idx];
		}
		return word;
	};

	MakeRandomSentence(){
		var sentence = "";
		const wordCount = _.random(20);
		for(let i=0; i<wordCount; i++){
			sentence += this.MakeRandomWord() + " ";
		}
		return sentence;
	};

	GetRandomYear(){
		return _.random(1980, 2016);
	};
}

module.exports = new DataGenerator();