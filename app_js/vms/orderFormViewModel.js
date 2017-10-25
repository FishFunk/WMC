class OrderFormViewModel {

	get SelectedCars(){
		return _.filter(this.cars(), (car)=> car.selected());
	}

	constructor(storageHelper, webSvc){
		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
		    key: Configuration.StripeKey,
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

		this.disableEmailInput = ko.observable(false);
		this.incompleteFormMsg = ko.observable("");

		this.showNewUserAlert = ko.observable(false);

		// Order Details
		this.Services = ko.observableArray(Configuration.SERVICES);
		this.addWash = ko.computed(()=>{
			return _.find(this.Services(), (s) => s.item == Constants.WASH).checked();
		});
		this.addInterior = ko.computed(()=>{
			return _.find(this.Services(), (s) => s.item == Constants.INTERIOR).checked();
		});

		this.addWash.subscribe((bool)=>{
			this.Services().forEach((s)=>{
				if(s.item != Constants.INTERIOR && s.item != Constants.WASH)
				{
					s.disable(!bool);
				}
			});
		});

		this.Rows = _.partition(this.Services(), (s)=>{
			return s.sortOrder <= Math.ceil(this.Services().length / 2);
		});

		this.description = ko.observable("");

		this.timeRangeOptions = [
			Constants.TIME_RANGE_PLACE_HOLDER,
			Constants.MORNING_TIME_RANGE,
			Constants.AFTERNOON_TIME_RANGE,
			Constants.EVENING_TIME_RANGE,
			Constants.NIGHT_TIME_RANGE
		];
		this.selectedTimeRange = ko.observable(Constants.TIME_RANGE_PLACE_HOLDER);

		this.dateMoment = null;

		// Car Info
		this.showAddVehicleForm = ko.observable(false);
		this.cars = ko.observableArray([]);
		this.make = ko.observable("");
		this.model = ko.observable("");
		this.color = ko.observable("");
		this.carSizes = Configuration.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);

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
		this.zip = ko.observable(this.storageHelper.ZipCode);

		// Subscriptions
		this.hideSubscriptionForm = ko.observable(true);
		this.subIntervals = [1,2,3];
		this.selectedSubInterval = ko.observable(this.subIntervals[0]);
		this.subSpans = [
			{
				days: 7,
				display: "Week(s)"
			},
			{
				days: 28,
				display: "Month(s)"
			}
		];
		this.selectedSubSpan = ko.observable(this.subSpans[0]);

		// Coupon
		this.couponCode = ko.observable("");
		this.coupon = ko.observable(null);

		this.orderTotal = ko.computed(()=>{
			let total = 0.00;
			let serviceCost = _.reduce(this.Services(), function(memo, s){ 
				if(s.checked()){
					memo += s.price;
				} 
				return memo;
			}, 0);
			_.each(self.SelectedCars, (car)=>{
				var carSize = _.find(self.carSizes, (s)=> s.size == car.size || s.multiplier == car.multiplier);
				total += carSize.multiplier * serviceCost;
			});

			return total.toFixed(2);
		});

		this.discountedTotal = ko.computed(()=>{
			var total = self.orderTotal();
			if(!self.coupon()){
				return total;
			}

			var couponAmount = self.coupon().amount;
			if(couponAmount > total){
				total = 0.00
			} else {
				total -= couponAmount;
			}

			return total.toFixed(2);
		});

		this.discountRemaining = ko.computed(() =>{
			if(!self.coupon()){
				return 0.00;
			}

			var couponAmount = self.coupon().amount;
			var result = couponAmount - self.orderTotal()

			return result < 0 ? 0.00 : result.toFixed(2);
		});

		this.orderSummary = ko.computed(()=>{
			let summary = "";

			if(!self.hideSubscriptionForm()) {
				if(self.dateMoment){
					summary = $.validator.format("<strong>{0} every {1} {2} starting {3}</strong><hr>",
					self.selectedTimeRange().range,
					self.selectedSubInterval(),
					self.selectedSubSpan().display,
					self.dateMoment.format("ddd MMM Do"));
				}

			} else {
				if(self.dateMoment){
					summary = $.validator.format("<strong>{0} {1}</strong><br>",
						self.dateMoment.format("ddd MMM Do"),
						self.selectedTimeRange().range);
				}
			}

			const selectedCars = self.SelectedCars;
			if(selectedCars.length > 0){
				summary += self._buildServicesSummary() + "<hr>";
			}

			selectedCars.forEach((car)=>{
				var carSize = _.find(Configuration.CAR_SIZES, (obj) => obj.size == car.size || obj.multiplier == car.multiplier);
				summary += $.validator.format(
					"<strong>{0} {1}</strong><br>{2}{3}<br>",
					car.make,
					car.model,
					carSize.size,
					carSize.multiplier > 1 ? " - additional " + Math.round(((carSize.multiplier - 1) * 100)).toString() + "%" : "");
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
			maxDate: moment().add(30, 'days'),
			format: Configuration.DATE_FORMAT,
			disabledDates: Configuration.BLOCKED_DAYS,
			allowInputToggle: true,
			focusOnShow: false,
			ignoreReadonly: true
		}).on('dp.change', self._onDatepickerChange.bind(self));

		self._initValidation();
		
		try{
			var code;
			if(URLSearchParams != undefined){
				var urlParams = new URLSearchParams(window.location.search);
				code = urlParams.get('coupon');
			} else {
			    var query = window.location.search.substring(1);
			    var vars = query.split('&');
			    for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if (decodeURIComponent(pair[0]) == 'coupon') {
				    code = decodeURIComponent(pair[1]);
				}
			    }
			}
			if(code){
				code = code.trim().toUpperCase();
				self.couponCode(code);
				self.$orderFormModal.modal('show');
			}
		} catch (ex) {
			console.log(ex);
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

		if(!this.addWash() && !this.addInterior()){
			this.incompleteFormMsg('Interior and/or exterior cleaning must be selected.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.$orderDetailsForm.valid()){
			this.incompleteFormMsg('Please fill in required order details.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.cars() || this.cars().length === 0){
			this.incompleteFormMsg('Please add at least one vehicle.');
			$('#incomplete-form-alert').show();
			return;
		}
		
		if(this.SelectedCars.length === 0){
			this.incompleteFormMsg('Please select at least one vehicle to service.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.locations() || this.locations().length === 0){
			this.incompleteFormMsg('Please add a location.');
			$('#incomplete-form-alert').show();
			return;
		}

		var selectedLocation = _.find(this.locations(), (loc) => loc.selected());
		if(!selectedLocation){
			this.incompleteFormMsg('Please select your desired location.');
			$('#incomplete-form-alert').show();
			return;
		}

		if(!Utils.VerifyZip(selectedLocation.zip)){
			this.incompleteFormMsg("Sorry but we currently don't service within that zip code.");
			$('#incomplete-form-alert').show();
			return;
		}

		if(!this.$contactDetailsForm.valid()){
			this.incompleteFormMsg('Please complete the contact information.');
			$('#incomplete-form-alert').show();
			return;
		}

		$('#incomplete-form-alert').hide();
		$('#invalid-coupon-alert').hide();

		if(payNow){
			this._openCheckout();
		} else {
			this._completeOrder();
		}
	}

	OnFormCancel(){
		try{
			$('#incomplete-form-alert').hide();
			$('#invalid-coupon-alert').hide();
			$('#success-coupon-alert').hide();

			this.$orderFormModal.modal('hide');
			this.$orderDetailsForm.validate().resetForm();
			this.$contactDetailsForm.validate().resetForm();

			this.storageHelper.LoggedInUser = null;
			this.storageHelper.IsNewUser = false;
			this.storageHelper.ZipCode = "";

			this._resetObservables();

			window.location = "#page-top";

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
						self.coupon(coupon);
					}
				})
				.fail(err => {
					console.log(err);
				});
		}
	}

	_openCheckout(){
		const total = parseInt(this.discountedTotal() * 100);
		this.stripeHandler.open({
			key: Configuration.StripeKey,
			name: 'WMC Checkout',
			amount: total,
			zipCode: true,
			email: this.email()
	    });
	}

	_completeOrder(token){
		try
		{
			var self = this;
			var prepaid = token != null;

			spinner.Show();
			async.waterfall([
					prepaid ? 
						this._executeCharge.bind(this, token) : 
						callback=>{
							callback();
						},
					this._verifyUser.bind(this),
					this._updateUserData.bind(this, prepaid),
					this._sendEmailConfirmation.bind(this)
				],
				possibleError=>{
					if(possibleError === Constants.CHARGE_FAILURE_MARKER){
						self.incompleteFormMsg('That card information didn\'t work.');
						$('#incomplete-form-alert').show();
					}
					else if(possibleError){
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
		this.$orderFormModal.modal('hide');
		setTimeout(()=>{
			spinner.Hide();
			dialogPresenter.ShowOrderFailure();
			console.log(error);
		}, 200);
	}

	_onOrderSuccess(){
		this.OnFormCancel();
		setTimeout(()=>{
			spinner.Hide();
			dialogPresenter.ShowOrderSuccess();
		}, 200);
	}

	_sendEmailConfirmation(user, newAppt, callback){
		this.webSvc.SendConfirmationEmail(user.firstName, user.email, user.phone, newAppt)
			.then(()=> callback())
			.fail(err => callback(err));
	}

	_verifyUser(callback){
		var self = this;
		if(this.storageHelper.LoggedInUser){
			callback(null, this.storageHelper.LoggedInUser);
		} else {
			this.webSvc.GetUserByEmail(this.email())
				.then((user)=>{
					if(user){
						callback(null, user);
					} else {
						// create new guest user
						var guestUser = self._makeGuestUserSchema();
						self.webSvc.CreateUser(guestUser)
							.then(()=>callback(null, guestUser))
							.fail((err)=>callback(err));
					}
				})
				.fail((err)=>callback(err));
		}
	}

	_executeCharge(token, callback){
		const total = parseInt(this.discountedTotal() * 100);
      	this.webSvc.ExecuteCharge(token, total, this.last())
	      	.then(()=>callback())
	      	.fail((err)=>{
	      		console.log(err);
	      		callback(Constants.CHARGE_FAILURE_MARKER);
	      	});
	}

	_updateUserData(prepaid, currentUsr, callback){
		var newAppt = this._makeAppointmentSchema(prepaid);
		currentUsr.appointments != null ? 
				currentUsr.appointments.push(newAppt) : currentUsr.appointments = [newAppt];

		if(!this.hideSubscriptionForm()){
			const startDate = new Date(newAppt.date);
			const subscription = this._makeSubscriptionSchema(startDate);
			currentUsr.subscriptions != null ? 
				currentUsr.subscriptions.push(subscription) : currentUsr.subscriptions = [subscription];
		}

		currentUsr.cars = this.cars();
		currentUsr.phone = this.phone();
		currentUsr.locations = this.locations();
		currentUsr.firstName = this.first();
		currentUsr.lastName = this.last();

		this.webSvc.UpdateUser(currentUsr)
			.then(()=>callback(null, currentUsr, newAppt))
			.fail((err) =>callback(err));
	}

	_prePopulateUserData(){
		var usr = this.storageHelper.LoggedInUser;
		if(usr){
			var locations = usr.locations || [];
			var cars = usr.cars || [];
			_.each(locations, (loc)=> loc.selected = ko.observable(false));
			_.each(cars, (car)=> car.selected = ko.observable(false));

			if(locations.length > 0){
				locations[0].selected(true);
			}

			if(cars.length > 0){
				cars[0].selected(true);
			}

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

		this.showNewUserAlert(this.storageHelper.IsNewUser);
	}

	_resetObservables(){
		this.showNewUserAlert(false);
		this.disableEmailInput(false);
		this.incompleteFormMsg("");

		// Order Details
		this.description = ko.observable("");
		this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);

		$('#datetimepicker').data("DateTimePicker").clear();

		// Car Info
		this.showAddVehicleForm(false);
		this.cars([]);
		this.make("");
		this.model("");
		this.color("");
		this.selectedCarSize(this.carSizes[0]);

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
		this.zip("");

		this.couponCode("");
		this.coupon(null);
	}

	_onDatepickerChange(event){
		if(event && event.date){
			this.dateMoment = event.date;
			this._updatePickerAndTimerangeOptions(event.date);
		}
	}

	_updatePickerAndTimerangeOptions(momentObj){
		if(Utils.IsHoliday(momentObj)){
			_.each(this.timeRangeOptions, (o)=>{
				o.disabled(true);
			});
			this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);
			return;
		}

		var hourOfDay = moment().hour();
		var today = moment().format(Configuration.DATE_FORMAT);
		var tmrw = moment().add(1,'day').format(Configuration.DATE_FORMAT);
		var selectedDate = momentObj.format(Configuration.DATE_FORMAT);
		var dayOfWeek = momentObj.day();
		var schedule = _.find(Configuration.SCHEDULE, (x) => x.day === dayOfWeek);

		var appointments = this.storageHelper.AppointmentsByDate[selectedDate] || [];

		const maxMinutesPerInterval = Configuration.MAX_JOB_TIME_PER_INTERVAL;
		var morningAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.MORNING_TIME_RANGE.key);
		var afternoonAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.AFTERNOON_TIME_RANGE.key);
		var eveningAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.EVENING_TIME_RANGE.key);
		var nightAppts = _.filter(appointments, (appt) => appt.timeRangeKey === Constants.NIGHT_TIME_RANGE.key);

		Constants.MORNING_TIME_RANGE.disabled(
			(_.reduce(morningAppts, (total, appt) => {return total + appt.timeEstimate}, 0) >= maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 1) ||
			(selectedDate == tmrw && hourOfDay >= 20) ||
			_.contains(schedule.blockedTimeSlots, Constants.MORNING_TIME_RANGE.key));
		Constants.AFTERNOON_TIME_RANGE.disabled(
			(_.reduce(afternoonAppts, (total, appt) => {return total + appt.timeEstimate}, 0) >= maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 9) ||
			(selectedDate == tmrw && hourOfDay >= 20) ||
			_.contains(schedule.blockedTimeSlots, Constants.AFTERNOON_TIME_RANGE.key));
		Constants.EVENING_TIME_RANGE.disabled(
			(_.reduce(eveningAppts, (total, appt) => {return total + appt.timeEstimate}, 0) >= maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 12) ||
			_.contains(schedule.blockedTimeSlots, Constants.EVENING_TIME_RANGE.key));
		Constants.NIGHT_TIME_RANGE.disabled(
			(_.reduce(nightAppts, (total, appt) => {return total + appt.timeEstimate}, 0) >= maxMinutesPerInterval) ||
			(selectedDate == today && hourOfDay >= 15) ||
			_.contains(schedule.blockedTimeSlots, Constants.NIGHT_TIME_RANGE.key));

		if(this.selectedTimeRange().disabled()){
			this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);
		}
	}

	_initValidation(){
		var self = this;
		
		$.validator.addMethod("timeRangeSelected", (value, element, arg)=>{
			const range = self.selectedTimeRange().range;
			return range != null && range.length > 0;
		}, "Please select a time range!");


		this.$orderDetailsForm.validate({
			rules:{
				date: "required",
				timeRange: "timeRangeSelected"
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
			selected: ko.observable(false)
		}
	}

	_makeAppointmentSchema(prepaid){
		const selectedCars = this.SelectedCars;
		const selectedLocation = _.find(this.locations(), (loc)=> loc.selected());
		return {
			cars: selectedCars,
			date: this.dateMoment.toDate(),
			location: selectedLocation,
			prepaid: prepaid,
			price: this.discountedTotal(),
			services: this._buildServicesArray(),
			timeEstimate: this._getTimeEstimate(),
			timeRange: this.selectedTimeRange().range,
			timeRangeKey: this.selectedTimeRange().key,
			description: this.description()
		}
	}

	_makeSubscriptionSchema(startDate){
		const selectedCars = this.SlectedCars;
		const selectedLocation = _.find(this.locations(), (loc)=> loc.selected());
		const daySpan = this.selectedSubInterval() * this.selectedSubSpan().days;
		const x = Math.round(365 / daySpan);
		let daysToAdd = daySpan;
		let futureDates = [];

		for(let i = 0; i < x; i++){
			let futureDate = new Date(startDate);
			futureDate.setDate(startDate.getDate() + daysToAdd);
			futureDates.push(futureDate);
			daysToAdd += daySpan;
		}

		return {
			cars: selectedCars,
			dates: futureDates,
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
			street: this.street(),
			title: this.title(),
			zip: this.zip(),
			selected: ko.observable(false)
		}
	}

	_getTimeEstimate(){
		var totalTime = 0;

		this.Services().forEach(s =>{
			if(s.checked()){
				totalTime += s.time;
			}
		});

		totalTime += Configuration.AVG_JOB_SETUP_TIME;

		totalTime += Configuration.AVG_JOB_DRIVING_TIME;

		return totalTime;
	}

	_buildServicesArray(){
		var services = [];

		this.Services().forEach(s =>{
			if(s.checked()){
				services.push(s.title);
			}
		});

		return services;
	}

	_buildServicesSummary(){
		var summary = "";
		
		this.Services().forEach(s =>{
			if(s.checked()){
				summary += s.title + "<br>";
			}
		});

		return summary;	
	}
}
