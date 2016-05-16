window.jQuery(document).ready(($)=>{

	// Initialize Application
	Bootstrapper.Run()
		.then(()=>{
			var timer = setTimeout(()=>{
				$('#splash').fadeOut(1000);
				clearTimeout(timer);
			},2000)
		})
		.fail((err)=>{
			console.error(err);
			bootbox.alert("This is embarrassing... something went wrong and our app will not work correctly.\
				Please make sure you have a good internet connection and refresh the page.");
		});
});

// Main ViewModel Class
class MainViewModel {
	constructor(storageHelper, logInVm, orderFormVm){
		
		this.WASH_COST = Constants.WASH_DETAILS.price;
		this.TireShinePriceHtml = "<sup>$</sup>"+Constants.TIRE_SHINE_DETAILS.price;
		this.InteriorPriceHtml = "<sup>$</sup>"+Constants.INTERIOR_DETAILS.price;
		this.WaxPriceHtml = "<sup>$</sup>"+Constants.WAX_DETAILS.price;

		this.LogInViewModel = logInVm;
		this.OrderFormViewModel = orderFormVm;

		this.storageHelper = storageHelper;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");

		this.verifyZip = ko.observable("");

		if(this.storageHelper.LoggedInUser){
			this.zipVerified = ko.observable(true);
		} else {
			this.zipVerified = ko.observable(false);
		}
	}

	OnPageScroll(data, event) {
	    var $anchor = $(event.currentTarget);
	    $('html, body').stop().animate({
	        scrollTop: $($anchor.attr('href')).offset().top
	    }, 1500, 'easeInOutExpo');
	    event.preventDefault();
    };

	OnShowOrderForm(){
		if(this.storageHelper.LoggedInUser){
			this.$orderFormModal.modal();
		} else {
			this.$loginModal.modal();
		}
	};

	OnVerifyZip(){
		var zip = this.verifyZip().trim();
		if(_.contains(Constants.ZIP_WHITE_LIST, zip)){
			this.zipVerified(true);
		} else {
			bootbox.alert(
				s.sprintf("Sorry about this but we don't service your area yet! \
			We're still young and growing so check back soon. \
			Feel free to <a href=%s>contact us</a> to expedite the process. <BR><BR> Sincerely, <BR> - The WMC Team", 
			"javascript:$('.modal').modal('hide');$('#contact-nav').click();"));
		}
	};
}

class LogInViewModel {
	constructor(){
		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
	}

	OnContinueAsGuest(){
		this.$loginModal.removeClass('fade');
		this.$loginModal.modal('hide');
		this.$orderFormModal.modal('show');
	};


	OnCreateNewAccount(){
	};

	OnLogIn(){
	};
}

class OrderFormViewModel {
	constructor(storageHelper, webSvc){
		var self = this;

		this.webSvc = webSvc;
		this.$orderFormModal = $('#order-form-modal');

		this.storageHelper = storageHelper;

		this.TIRE_SHINE_COST = Constants.TIRE_SHINE_DETAILS.price;
		this.INTERIOR_COST = Constants.INTERIOR_DETAILS.price;
		this.WAX_COST = Constants.WAX_DETAILS.price;
		this.WASH_COST = Constants.WASH_DETAILS.price;

		// Order Details
		this.addShine = ko.observable(false);
		this.addWax = ko.observable(false);
		this.addInterior = ko.observable(false);
		this.showBillingAddress = ko.observable(false);

		this.description = ko.observable("");

		this.timeRangeOptions = [
			Constants.MORNING_TIME_RANGE,
			Constants.AFTERNOON_TIME_RANGE,
			Constants.EVENING_TIME_RANGE,
			Constants.NIGHT_TIME_RANGE
		];

		this.date = ko.observable(moment().format("MM/DD/YY"));

		// Car Info
		this.showAddVehicleForm = ko.observable(false);
		this.cars = ko.observableArray([]);
		this.make = ko.observable("");
		this.model = ko.observable("");
		this.color = ko.observable("");
		this.tag = ko.observable("");
		this.carSizes = Constants.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);
		this.carYears = [];
		var year = new Date().getFullYear() + 1;
		for (var i = 0; i < 25; i++) {
		    this.carYears.push((year - i).toString());
		}
		this.carYear = ko.observable(this.carYears[1]);

		// Contact Info
		this.email = ko.observable("");
		this.phone = ko.observable("");

		// Location Info
		this.showAddLocationForm = ko.observable(false);
		this.locations = ko.observableArray([]);
		this.locationTitleOptions = ["Home", "Work", "Other"];
		this.title = ko.observable(this.locationTitleOptions[0]);
		this.street = ko.observable("");
		this.city = ko.observable("");
		this.state = ko.observable("");
		this.zip = ko.observable("");

		// Billing Info
		this.billStreet = ko.observable("");
		this.billCity = ko.observable("");
		this.billState = ko.observable("");
		this.billZip = ko.observable("");

		this.ccName = ko.observable("");
		this.ccNumber = ko.observable("");
		
		this.ccExpiryMos = ["01","02","03","04","05","06","07","08","09","10","11","12"];
		this.ccExpiryMo = ko.observable(this.ccExpiryMos[0]);

		this.ccExpiryYrs = [];
		var year = new Date().getFullYear();
		for (var i = 0; i < 12; i++) {
		    this.ccExpiryYrs.push((i + year).toString());
		}
		this.ccExpiryYr = ko.observable(this.ccExpiryYrs[0]);

		this.cvv = ko.observable("");

		this.orderTotal = ko.computed(()=>{
			var total = parseFloat((self.WASH_COST + (self.addShine() ? self.TIRE_SHINE_COST : 0) + 
				(self.addWax() ? self.WAX_COST : 0) + 
				(self.addInterior() ? self.INTERIOR_COST : 0)) *
				(self.selectedCarSize().multiplier));
			return total >= 100 ? total.toPrecision(5) : total.toPrecision(4);
		});

		this.orderSummary = ko.computed(()=>{
			return $.validator.format("Exterior Hand Wash<br>{0}{1}{2}{3} = {4}x cost multiplier.", 
				(self.addShine() ? "Deep Tire Clean & Shine<br>" : ""),
				(self.addWax() ? "Hand Wax & Buff<br>" : ""),
				(self.addInterior() ? "Full Interior Cleaning<br>" : ""),
				self.selectedCarSize().size,
				self.selectedCarSize().multiplier.toString());
		});
	}

	OnAfterRender(elements, self){
		self.$addVehicleForm = $('#add-vehicle-form');
		self.$addLocationForm = $('#add-location-form');
		self.$orderDetailsForm = $('#order-details-form');
		$('#datetimepicker').datetimepicker({
			minDate: new Date(),
			format: 'MM/DD/YY'
		}).on('dp.change', self._onDatepickerChange.bind(self));
		self._initValidation();
	}

	MakeTempUserSchema(){
		return {
			appointments: [this._makeAppointmentSchema()],
			cars: [this._makeCarSchema()],
			email: this.email(),
			phone: this.phone(),
			fullName: this.fullName(),
			pwd: Utils.GenerateUUID(),
			locations: [_this._makeLocationSchema()]
		}
	}

	OnAddNewLocation(){
		this.showAddLocationForm(true);
	}

	OnCancelNewLocation(){
		this.$addVehicleForm.find("input").val("");
		this.$addLocationForm.validate().resetForm();
		this.showAddLocationForm(false);
	}

	OnSaveNewLocation(){
		if(this.$addLocationForm.valid()){
			const loc = this._makeLocationSchema();
			this.locations.push(loc);
			this.$addLocationForm.find("input").val("");
			this.showAddLocationForm(false);
		}
	}

	OnAddNewVehicle(){
		this.showAddVehicleForm(true);
	}

	OnCancelNewVehicle(){
		this.$addVehicleForm.find("input").val("");
		this.$addVehicleForm.validate().resetForm();
		this.showAddVehicleForm(false);
	}

	OnSaveNewVehicle(){
		if(this.$addVehicleForm.valid()){
			const newCar = this._makeCarSchema();
			this.cars.push(newCar);
			this.$addVehicleForm.find("input").val("");
			this.showAddVehicleForm(false);
		}
	}

	OnClickVehiclePanel(self, vehicleData){
		vehicleData.selected(!vehicleData.selected());
	}

	OnClickLocationPanel(self, locationData){
		_.each(self.locations(), (loc) =>{
			loc.selected(false);
		});
		locationData.selected(true);
	}

	OnSubmit(){
		var self = this;
		if(this.$orderDetailsForm.valid())
		{
			if(!this.LoggedInUser)
			{
				this.webSvc.GetUserByEmail(this.email())
					.then((usr)=>{
						var tmpUser = self.MakeTempUserSchema();
						if(usr){
							// email already exists - update current??
							// join temporary and existing data...
							self.storageHelper.LoggedInUser = usr;
						} else {
							// create new temp user
							var tmpUser = self.MakeTempUserSchema();
							tmpUser.IsGuest = true;
							self.storageHelper.LoggedInUser = tmpUser;
							self.webSvc.CreateUser(tmpUser)
								.then(()=>{
									bootbox.alert("Thank you! Your order has been placed.");
								})
								.fail((err)=>{
									bootbox.alert("There was a problem submitting your order.");
								});
						}
					})
					.fail((err)=>{
						bootbox.alert("There was a problem submitting your order.");
					});
			}
			else
			{
				// Update existing user
			}
		}
	};

	OnFormCancel(){
		this.$orderDetailsForm.validate().resetForm();
		this.$orderFormModal.modal('hide');
		window.location = "#page-top";			
	};

	_onDatepickerChange(event){
		var date = moment(event.date).format("MM/DD/YYYY");
		this.date(date);
		var appointments = this.storageHelper.AppointmentsByDate[date];
		if(appointments){
			const maxMinutesPerInterval = 180;
			var morningAppts = _.filter(appointments, (appt) => appt.key === Constants.MORNING_TIME_RANGE.key);
			var afternoonAppts = _.filter(appointments, (appt) => appt.key === Constants.AFTERNOON_TIME_RANGE.key);
			var eveningAppts = _.filter(appointments, (appt) => appt.key === Constants.EVENING_TIME_RANGE.key);
			var nightAppts = _.filter(appointments, (appt) => appt.key === Constants.NIGHT_TIME_RANGE.key);

			Constants.MORNING_TIME_RANGE.disabled(
				_.reduce(morningAppts, (memo, appt) => {return memo + appt.timeEstimate}, 0) > maxMinutesPerInterval);
			Constants.AFTERNOON_TIME_RANGE.disabled(
				_.reduce(afternoonAppts, (memo, appt) => {return memo + appt.timeEstimate}, 0) > maxMinutesPerInterval);
			Constants.EVENING_TIME_RANGE.disabled(
				_.reduce(eveningAppts, (memo, appt) => {return memo + appt.timeEstimate}, 0) > maxMinutesPerInterval);
			Constants.NIGHT_TIME_RANGE.disabled(
				_.reduce(nightAppts, (memo, appt) => {return memo + appt.timeEstimate}, 0) > maxMinutesPerInterval);
		}
	}

	_initValidation(){
		this.$orderDetailsForm.validate({
			rules:{
				email:{
					required: true,
					email: true
				},
				phone: "required",
				ccname: "required",
				ccnumber: {
					required: true,
					maxlength: 19
				},
				cvv: {
					required: true,
					maxlength: 4
				},
				billstreet: {
					required: "#billingCheckbox:unchecked"
				},
				billcity: {
					required: "#billingCheckbox:unchecked"
				},
				billstate: {
					required: "#billingCheckbox:unchecked"
				},
				billzip: {
					required: "#billingCheckbox:unchecked"
				}
			},
			messages:{
				email: "Please enter a valid email address.",
			}
		});
		this.$addVehicleForm.validate({
			rules:{
				make: "required",
				model: "required",
				color: "required"
			}
		});
		this.$addLocationForm.validate({
			rules:{
				street: "required",
				city: "required",
				state: "required",
				zip: "required"
			}
		});
	};

	_makeCarSchema(){
		return {
			color: this.color(),
			make: this.make(),
			model: this.model(),
			size: this.selectedCarSize().size,
			tag: this.tag(),
			year: parseInt(this.carYear()),
			selected: ko.observable(false)
		}
	}

	_makeAppointmentSchema(){
		return {
			cars: [this._makeCarSchema()],
			date: new Date(this.date()),
			location: this._makeLocationSchema(),
			price: this.orderTotal(),
			services: this._buildServicesArray(),
			timeEstimate: null, // TODO
			timeRange: this.selectedTimeRange(),
			description: this.description()
		}
	}

	_makeLocationSchema(){
		return {
			city: this.city(),
			state: this.state(),
			street: this.street(),
			title: this.title(),
			zip: this.zip(),
			selected: ko.observable(false)
		}
	}

	_buildServicesArray(){
		var services = ["Hand wash"];
		if(this.addShine()){
			services.push("Tire shine");
		}
		if(this.addWax()){
			services.push("Wax & Buff");
		}
		if(this.addInterior()){
			services.push("Interior");
		}
		return services;
	}
}

class LocalStorageHelper{
	constructor(storageType){
		if(typeof(Storage) === "undefined") {
			console.info("No local storage available.");
		} else {
			this.storageType = storageType;
		}
	}

	get AppointmentsByDate(){
		if(this.storageType && this.storageType.appointments){
			return JSON.parse(this.storageType.appointments);
		} else {
			return [];
		}
	}

	set AppointmentsByDate(apptsByDate){
		if(this.storageType){
			this.storageType.appointments = JSON.stringify(apptsByDate);
		}
	}

	get LoggedInUser(){
		if(this.storageType && this.storageType.loggedInUser){
			return JSON.parse(this.storageType.loggedInUser);
		} else {
			return null;
		}
	}

	set LoggedInUser(user){
		if(this.storageType){
			this.storageType.loggedInUser = JSON.stringify(user);
		}
	}
}
