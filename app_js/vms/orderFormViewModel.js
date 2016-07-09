class OrderFormViewModel {
	constructor(storageHelper, webSvc){
		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
		    key: environment == 'production' ? 
		    	'pk_live_aULtlGy6YPvc94K5Hjvqwokg' : 'pk_test_luqEThs0vblV173fgAHgPZBG',
		    image: '/img/square_logo.png',
		    locale: 'auto',
		    token: this._completeOrder.bind(this)
		});

		// Close Checkout on page navigation:
		$(window).on('popstate', function(){
			self.stripeHandler.close();
		});

		this.webSvc = webSvc;
		this.storageHelper = storageHelper;

		this.$orderFormModal = $('#order-form-modal');

		this.$orderFormModal.on('show.bs.modal', ()=>{
			self._prePopulateUserData();
		});

		this.TIRE_SHINE_COST = Constants.TIRE_SHINE_DETAILS.price;
		this.INTERIOR_COST = Constants.INTERIOR_DETAILS.price;
		this.WAX_COST = Constants.WAX_DETAILS.price;
		this.WASH_COST = Constants.WASH_DETAILS.price;

		this.disableEmailInput = ko.observable(false);
		this.incompleteFormMsg = ko.observable("");

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

		this.dateMoment = null;

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

		this.couponCode = ko.observable("");
		this.coupon = ko.observable(null);

		this.orderTotal = ko.computed(()=>{
			let total = 0;
			let serviceCost = parseFloat((self.WASH_COST + 
					(self.addShine() ? self.TIRE_SHINE_COST : 0) + 
					(self.addWax() ? self.WAX_COST : 0) + 
					(self.addInterior() ? self.INTERIOR_COST : 0)));

			self.cars().forEach((car)=>{
				if(car.selected()){
					var carSize = _.find(Constants.CAR_SIZES, (obj) => obj.size == car.size || obj.multiplier == car.multiplier);
					if(carSize){
						total += serviceCost * carSize.multiplier;
					}
				}
			});

			if(self.coupon()){
				if(self.coupon().discountPercentage == 100){
					// First Time Free Wash Discount
					total -= self.WASH_COST;
				} else {
					var percent = self.coupon().discountPercentage / 100;
					total = total - (total * percent);
				}
			}

			return Math.floor(total);
		});

		this.orderSummary = ko.computed(()=>{
			let summary = "";
			let promoMsg = "";

			if(self.coupon()){
				if(self.coupon().discountPercentage == 100){
					promoMsg = "First Timer Discount - First Wash Free!"
				} else {
					promoMsg = "Promo discount: " + self.couponCode().discountPercentage.toString() + "%";
				}
			}

			self.cars().forEach((car)=>{
				if(car.selected()){
					var carSize = _.find(Constants.CAR_SIZES, (obj) => obj.size == car.size || obj.multiplier == car.multiplier);
					summary += $.validator.format(
						"<strong>{7} between {8}</strong><hr>" +
						"<strong>{5} {6}</strong><br>" +
						"Exterior Hand Wash<br>{0}{1}{2}{3} = {4}x cost multiplier.<br>" +
						"{9}", 
						(self.addShine() ? "Deep Tire Clean & Shine<br>" : ""),
						(self.addWax() ? "Hand Wax & Buff<br>" : ""),
						(self.addInterior() ? "Full Interior Cleaning<br>" : ""),
						carSize.size,
						carSize.multiplier.toString(),
						car.make,
						car.model,
						self.dateMoment.format("ddd MMM Do"),
						self.selectedTimeRange().range,
						promoMsg);
				}
			});

			return summary;
		});
	}

	OnAfterRender(elements, self){
		self.$addVehicleForm = $('#add-vehicle-form');
		self.$addLocationForm = $('#add-location-form');
		self.$contactDetailsForm = $('#contact-details-form');
		self.$orderDetailsForm = $('#order-details-form');

		$('#phone').mask('(999) 999-9999? ext:99999', {placeholder: " "});

		$('#datetimepicker').datetimepicker({
			minDate: moment().subtract(1, 'days'),
			maxDate: moment().add(60, 'days'),
			format: Constants.DATE_FORMAT,
			allowInputToggle: true,
			focusOnShow: false,
			ignoreReadonly: true
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

	OnSubmit(payNow){
		var self = this;

		if(!this.$orderDetailsForm.valid()){
			this.incompleteFormMsg('Please select a date of service.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.cars() || this.cars().length === 0){
			this.incompleteFormMsg('Please add at least one vehicle.');
			$('#incomplete-form-alert').show();
			return;
		}
		
		var selectedCars = _.filter(this.cars(), (car)=> car.selected());
		if(selectedCars.length === 0){
			this.incompleteFormMsg('Please select at least one vehicle to service.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.locations() || this.locations().length === 0){
			this.incompleteFormMsg('Please add a location.');
			return;
		}

		var selectedLocation = _.find(this.locations(), (loc) => loc.selected());
		if(!selectedLocation){
			this.incompleteFormMsg('Please select your desired location.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!Utils.VerifyZip(selectedLocation.zip)){
			this.incompleteFormMsg(Constants.BAD_ZIP_MSG);
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.$contactDetailsForm.valid()){
			this.incompleteFormMsg('Please complete the contact information.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(payNow){
			this._openCheckout();
		} else {
			this._completeOrder();
		}
	}

	OnFormCancel(){
		try{
			this.storageHelper.LoggedInUser = null;
			this.$orderFormModal.modal('hide');
			window.location = "#page-top";

			// Reset observables
			this._resetObservables();

			// Reset Forms
			this.$orderDetailsForm.validate().resetForm();
			this.$contactDetailsForm.validate().resetForm();

			$('#incomplete-form-alert').hide();
			$('#invalid-coupon-alert').hide();
			$('#success-coupon-alert').hide();

		} catch (ex){
			console.log("Failed to reset fields OnFormCancel()");
			console.log(ex);
		}
	}

	OnApplyCoupon(){
		var self = this;
		$('#invalid-coupon-alert').hide();
		$('#success-coupon-alert').hide();

		if(this.couponCode && this.couponCode().length > 0){
			this.webSvc.VerifyCoupon(this.couponCode())
				.then((coupon)=>{
					if(!coupon){
						$('#invalid-coupon-alert').show();
					} else {
						$('#success-coupon-alert').show();
						this.coupon(coupon);
					}
				})
				.fail(err => {
					console.log(err);
				});
		}
	}

	_openCheckout(){
		this.stripeHandler.open({
			key: "pk_test_luqEThs0vblV173fgAHgPZBG",
			name: 'WMC Checkout',
			amount: this.orderTotal() * 100,
			zipCode: true,
			email: this.email()
	    });
	}

	_completeOrder(token){
		try
		{
			var self = this;
			spinner.Show();
			async.series([
					// TODO: Is this the best order?
					token ? 
						this._executeCharge.bind(this, token) : 
						callback=>{
							// user chose to pay later
							callback();
						},
					this._verifyUser.bind(this),
					this._updateUserData.bind(this),
					this._sendEmailConfirmation.bind(this)
				],
				possibleError=>{
					if(possibleError){
						self._onOrderFailure(possibleError);		
					} else {
						self._onOrderSuccess();
					}
		      	});
		} catch (ex) {
			this._onOrderFailure(ex);	
		}
	}

	_onOrderFailure(error){
		spinner.Hide();
		dialogPresenter.ShowOrderFailure();
		console.log(error);
	}

	_onOrderSuccess(){
		spinner.Hide();
		dialogPresenter.ShowOrderSuccess();
		this.OnFormCancel();		
	}

	_sendEmailConfirmation(callback){
		this.webSvc.SendConfirmationEmail(
			this.storageHelper.LoggedInUser.email, 
			this.storageHelper.LoggedInUser.appointments)
			.then(()=> callback())
			.fail(err => callback(err));
	}

	_verifyUser(callback){
		var self = this;

		if(this.storageHelper.LoggedInUser){
			callback();
		} else {
			this.webSvc.GetUserByEmail(this.email())
				.then((usr)=>{
					if(usr){
						self.storageHelper.LoggedInUser = usr;
						callback();
					} else {
						// create new guest user
						var guestUsr = self._makeGuestUserSchema();
						self.storageHelper.LoggedInUser = guestUsr;
						self.webSvc.CreateUser(guestUsr)
							.then(()=>callback())
							.fail((err)=>callback(err));
					}
				})
				.fail((err)=>callback(err));
		}
	}

	_executeCharge(token, callback){
      	this.webSvc.ExecuteCharge(token, this.orderTotal() * 100, this.last())
	      	.then(()=>callback())
	      	.fail((err)=>callback(err));
	}

	_updateUserData(callback){
		var currentUsr = this.storageHelper.LoggedInUser;

		var newAppt = this._makeAppointmentSchema();
		currentUsr.appointments != null ? 
				currentUsr.appointments.push(newAppt) : currentUsr.appointments = [newAppt];

		currentUsr.cars = this.cars();
		currentUsr.phone = this.phone();
		currentUsr.locations = this.locations();
		currentUsr.firstName = this.first();
		currentUsr.lastName = this.last();

		this.storageHelper.LoggedInUser = currentUsr;

		this.webSvc.UpdateUser(currentUsr)
			.then(()=>callback())
			.fail((err) =>callback(err));
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

			if(usr.email){
				this.disableEmailInput(true);
			}

			$('#phone').trigger('input');
		}
	}

	_resetObservables(){
		this.disableEmailInput(false);
		this.incompleteFormMsg("");

		// Order Details
		this.addShine(false);
		this.addWax(false);
		this.addInterior(false);
		this.showBillingAddress(false);

		this.description = ko.observable("");
		this.selectedTimeRange(this.timeRangeOptions[0]);

		this.dateMoment = null;

		// Car Info
		this.showAddVehicleForm(false);
		this.cars([]);
		this.make("");
		this.model("");
		this.color("");
		this.tag("");
		this.selectedCarSize(this.carSizes[0]);
		this.carYear(this.carYears[1]);

		// Contact Info
		this.first("");
		this.last("");
		this.email("");
		this.phone("");

		// Location Info
		this.showAddLocationForm(false);
		this.locations([]);
		this.title(this.locationTitleOptions[0]);
		this.street("");
		this.city("");
		this.state("");
		this.zip("");

		this.couponCode("");
		this.coupon(null);
	}

	_onDatepickerChange(event){
		if(event){
			this.dateMoment = event.date;
			this._updatePickerAndTimerangeOptions(event.date);
		}
	}

	_updatePickerAndTimerangeOptions(momentObj){
		var hourOfDay = moment().hour();
		var today = moment().format(Constants.DATE_FORMAT);
		var selectedDate = momentObj.format(Constants.DATE_FORMAT);

		var appointments = this.storageHelper.AppointmentsByDate[selectedDate] || [];

		const maxMinutesPerInterval = Constants.MAX_JOB_TIME_PER_INTERVAL;
		var morningAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.MORNING_TIME_RANGE.key);
		var afternoonAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.AFTERNOON_TIME_RANGE.key);
		var eveningAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.EVENING_TIME_RANGE.key);
		var nightAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.NIGHT_TIME_RANGE.key);

		Constants.MORNING_TIME_RANGE.disabled(
			(_.reduce(morningAppts, (total, appt) => {return total + appt.timeEstimate}, 0) > maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 11));
		Constants.AFTERNOON_TIME_RANGE.disabled(
			(_.reduce(afternoonAppts, (total, appt) => {return total + appt.timeEstimate}, 0) > maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 14));
		Constants.EVENING_TIME_RANGE.disabled(
			(_.reduce(eveningAppts, (total, appt) => {return total + appt.timeEstimate}, 0) > maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 17));
		Constants.NIGHT_TIME_RANGE.disabled(
			(_.reduce(nightAppts, (total, appt) => {return total + appt.timeEstimate}, 0) > maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 20));

		for(let i = 0; i < this.timeRangeOptions.length; i++){
			const option = this.timeRangeOptions[i];
			if(!option.disabled()){
				this.selectedTimeRange(option);
				break;
			}
		}
	}

	_initValidation(){
		this.$orderDetailsForm.validate({
			rules:{
				date: "required"
			},
			errorPlacement: function(){}
		});

		this.$contactDetailsForm.validate({
			rules:{
				first: "required",
				last: "required",
				date: "required",
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

	_makeGuestUserSchema(){
		return {
			isGuest: true,
			email: this.email(),
			pwd: Utils.GenerateUUID()
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
		const selectedCars = _.filter(this.cars(), (car)=> car.selected());
		const selectedLocation = _.find(this.locations(), (loc)=> loc.selected());
		return {
			cars: selectedCars,
			date: this.dateMoment.toDate(),
			location: selectedLocation,
			price: this.orderTotal(),
			services: this._buildServicesArray(),
			timeEstimate: this._getTimeEstimate(),
			timeRange: this.selectedTimeRange().range,
			timeRangeKey: this.selectedTimeRange().key,
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

	_getTimeEstimate(){
		var totalTime = Constants.WASH_DETAILS.time;
		if(this.addShine()){
			totalTime += Constants.TIRE_SHINE_DETAILS.time;
		}
		if(this.addWax()){
			totalTime += Constants.WAX_DETAILS.time;
		}
		if(this.addInterior()){
			totalTime += Constants.INTERIOR_DETAILS.time;
		}
		return totalTime;
	}

	_buildServicesArray(){
		var services = [Constants.WASH_DETAILS.title];
		if(this.addShine()){
			services.push(Constants.TIRE_SHINE_DETAILS.title);
		}
		if(this.addWax()){
			services.push(Constants.WAX_DETAILS.title);
		}
		if(this.addInterior()){
			services.push(Constants.INTERIOR_DETAILS.title);
		}
		return services;
	}
}