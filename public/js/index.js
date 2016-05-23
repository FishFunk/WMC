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

		this.zip = ko.observable("");

		if(this.storageHelper.ZipCode){
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
    }

	OnShowOrderForm(){
		if(this.storageHelper.LoggedInUser){
			this.$orderFormModal.modal();
		} else {
			this.$loginModal.modal();
		}
	}

	OnVerifyZip(){
		if(Utils.VerifyZip(this.zip())){
			this.zipVerified(true);
			this.storageHelper.ZipCode = zip;
		} else {
			bootbox.alert(Constants.BAD_ZIP_MSG);
		}
	}
}

class LogInViewModel {
	constructor(storageHelper, webSvc){
		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
		this.$loginForm = $("#login-form");
		this.email = ko.observable("VBF@YPP.com");
		this.pwd = ko.observable("TKVSVKCCFF");
		this._initValidation();
	}

	OnContinueAsGuest(){
		this._toggleModals();
	}


	OnCreateNewAccount(){
	}

	OnLogIn(){
		var self = this;
		if(this.$loginForm.valid()){
			this.webSvc.GetUserByEmailAndPwd(this.email(), this.pwd())
				.then((user)=>{
					if(user){
						self.storageHelper.LoggedInUser = user;
						self._resetForm();
						self._toggleModals();
					} else {
						bootbox.alert("Hmmm, we didn't find an account matching those credentials. \
							Please verify your info and try again or click the 'Forgot Password' link.");
						self._resetForm();
						self.$loginForm.valid();
					}
				})
				.fail(err =>{
					self._resetForm();
					bootbox.alert("Uh oh... something went wrong!");
				});
		}
	}

	_resetForm(){
		this.$loginForm.find("input").val("");
		this.$loginForm.validate().resetForm();
	}

	_toggleModals(){
		this.$loginModal.removeClass('fade');
		this.$loginModal.modal('hide');
		this.$orderFormModal.modal('show');
	}

	_initValidation(){
		this.$loginForm.validate({
			rules:{
				email:{
					required: true,
					email: true
				},
				pwd: "required",
			},
			messages:{
				email: "Please enter a valid email address.",
				pwd: "Password required."
			},
			errorPlacement: (error, element)=>{
				return true;
			}
		});
	}
}

class OrderFormViewModel {
	constructor(storageHelper, webSvc){
		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
		    key: 'pk_test_luqEThs0vblV173fgAHgPZBG',
		    image: '/img/wmc_logo.jpg',
		    locale: 'auto',
		    token: this._completeOrder.bind(this)
		});

		// Close Checkout on page navigation:
		$(window).on('popstate', function(){
			self.stripeHandler.close();
		});

		this.webSvc = webSvc;
		this.$orderFormModal = $('#order-form-modal');

		this.$orderFormModal.on('show.bs.modal', ()=>{
			self._prePopulateUserData();
		});

		this.storageHelper = storageHelper;

		var usr = storageHelper.LoggedInUser;

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
		this.selectedTimeRange = ko.observable(this.timeRangeOptions[0]);

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
		this.first = ko.observable("");
		this.last = ko.observable("");
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
		this.zip = ko.observable(this.storageHelper.ZipCode);

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
		$('#phone').mask('(999) 999-9999? ext:99999', {placeholder: " "});
		$('#datetimepicker').datetimepicker({
			minDate: new Date(),
			format: 'MM/DD/YY'
		}).on('dp.change', self._onDatepickerChange.bind(self));
		self._initValidation();
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
			var loc = this._makeLocationSchema();
			_.each(this.locations(), (l) => l.selected(false));
			loc.selected(true);
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
			newCar.selected(true);
			this.cars.push(newCar);
			this.$addVehicleForm.find("input").val("");
			this.showAddVehicleForm(false);
		}
	}

	OnClickVehiclePanel(self, vehicleData){
		vehicleData.selected(!vehicleData.selected());
	}

	OnDeleteVehiclePanel(self, vehicleData){
		self.cars(_.reject(self.cars(), (car)=> _.isEqual(car, vehicleData)));
	}

	OnClickLocationPanel(self, locationData){
		_.each(self.locations(), (loc) =>{
			loc.selected(false);
		});
		locationData.selected(true);
	}

	OnDeleteLocationPanel(self, locationData){
		self.locations(_.reject(self.locations(), (loc)=> _.isEqual(loc, locationData)));
	}

	OnSubmit(){
		var self = this;
		
		var selectedCars = _.filter(this.cars(), (car)=> car.selected());
		if(selectedCars.length === 0){
			bootbox.alert("Please add and select at least one vehicle.");
			return;
		}

		var selectedLocation = _.find(this.locations(), (loc) => loc.selected());
		if(!selectedLocation){
			bootbox.alert("Please add and select a location.");
			return;
		}

		if(!Utils.VerifyZip(this.zip())){
			bootbox.alert(Constants.BAD_ZIP_MSG);
			return;
		}

		if(this.$orderDetailsForm.valid())
		{
			this._openCheckout();

			if(!this.storageHelper.LoggedInUser)
			{
				this.webSvc.GetUserByEmail(this.email())
					.then((usr)=>{
						if(usr){
							self.storageHelper.LoggedInUser = usr;
							self._updateUserData();
						} else {
							// create new temp user
							var tmpUser = self._makeTempUserSchema();
							self.storageHelper.LoggedInUser = tmpUser;
							self.webSvc.CreateUser(tmpUser)
								.fail((err)=>{
									console.log(err);
								});
						}
					})
					.fail((err)=>{
						console.log(err);
					});
			}
			else
			{
				// Update existing user
				this._updateUserData();
			}
		}
	}

	OnFormCancel(){
		try{
			this.$orderFormModal.modal('hide');
			window.location = "#page-top";

			// Manually clear observables
			this.addShine(false);
			this.addWax(false);
			this.addInterior(false);
			this.showBillingAddress(false);
			this.description("");
			this.showAddVehicleForm(false);
			this.showAddLocationForm(false);
			// this.date(moment().format("MM/DD/YY"));
			// $('#datetimepicker').data("DateTimePicker").date(this.date());
			// $('#datetimepicker > input').val(this.date());
			$('#datetimepicker').data("DateTimePicker").date(new Date());
			this.selectedCarSize(this.carSizes[0]);
			this.selectedTimeRange(this.timeRangeOptions[0]);
			this.carYear(this.carYears[1]);

			// Reste Forms
			this.$orderDetailsForm.validate().resetForm();
		} catch (ex){
			console.log("Failed to reset fields OnFormCancel()");
			console.log(ex);
		}
	}

	_openCheckout(){
		this.stripeHandler.open({
			key: "pk_test_luqEThs0vblV173fgAHgPZBG",
			name: 'WMC',
			description: '2 widgets',
			amount: this.orderTotal() * 100,
			zipCode: true,
			email: this.email()
	    });
	}

	_completeOrder(token){
		var self = this;
      	this.webSvc.ExecuteCharge(token, this.orderTotal() * 100, this.last())
	      	.then(()=>{
				bootbox.alert(Constants.ORDER_SUCCESS_MSG);
				self.OnFormCancel();
	      	})
	      	.fail((err)=>{
				bootbox.alert(Constants.ORDER_FAILURE_MSG);
				console.log(err);
	      	});
	}

	_updateUserData(){
		var self = this;
		var currentUsr = this.storageHelper.LoggedInUser;
		var newAppt = this._makeAppointmentSchema();

		if(currentUsr.appointments){
			currentUsr.appointments.push(newAppt);
		} else {
			currentUsr.appointments = [newAppt];
		}

		currentUsr.cars = this.cars();
		currentUsr.phone = this.phone();
		currentUsr.locations = this.locations();
		currentUsr.firstName = this.first();
		currentUsr.lastName = this.last();

		this.webSvc.UpdateUser(currentUsr)
			.fail((err) =>{
				console.log(err);
			});
	}

	_prePopulateUserData(){
		var usr = this.storageHelper.LoggedInUser;
		if(usr){
			var locations = usr.locations || [];
			var cars = usr.cars || [];
			_.each(locations, (loc)=> loc.selected = ko.observable(false));
			_.each(cars, (car)=> car.selected = ko.observable(false));

			this.locations(locations);
			this.cars(cars);
			this.email(usr.email || "");
			this.phone(usr.phone || "");
			this.first(usr.firstName || "");
			this.last(usr.lastName || "");

			$('#phone').trigger('input');
		}
	}

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
				first: "required",
				last: "required",
				email:{
					required: true,
					email: true
				},
				phone: "required"
			},
			messages:{
				email: "Please enter a valid email address."
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
	}

	_makeTempUserSchema(){
		return {
			appointments: [this._makeAppointmentSchema()],
			cars: this.cars(),
			email: this.email(),
			phone: this.phone(),
			firstName: this.first(),
			lastName: this.last(),
			pwd: Utils.GenerateUUID(),
			locations: this.locations()
		}
	}

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
			timeRange: this.selectedTimeRange().range,
			timeRangeEnum: this.selectedTimeRange().key,
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

	get ZipCode(){
		if(this.storageType && this.storageType.zip){
			return this.storageType.zip;
		} else {
			return "";
		}
	}

	set ZipCode(zip){
		if(this.storageType){
			this.storageType.zip = zip;
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
