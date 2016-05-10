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
class App {
	constructor(storageHelper, webSvc){
		var self = this;
		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
		this.$orderForm = $("#order-form");

		if(this.storageHelper.LoggedInUser){
			this.zipVerified = ko.observable(true);
		} else {
			this.zipVerified = ko.observable(false);
		}

		this.OrderFormVm = new OrderFormViewModel();

		this._initValidation();
	}

	OnFormCancel(){
		this.$orderFormModal.modal('hide');
		window.location = "#page-top";			
	};

	OnPageScroll(data, event) {
	    var $anchor = $(event.currentTarget);
	    $('html, body').stop().animate({
	        scrollTop: $($anchor.attr('href')).offset().top
	    }, 1500, 'easeInOutExpo');
	    event.preventDefault();
    };

	// Show Order Form Modal
	OnShowOrderForm(){
		if(this.storageHelper.LoggedInUser){
			this.$orderFormModal.modal();
		} else {
			this.$loginModal.modal();
		}
	};

	OnCreateNewAccount(){

	};

	OnLogIn(){
	};

	OnVerifyZip(){
		var zip = this.OrderFormVm.zip().trim();
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

	OnContinueAsGuest(){
		this.$loginModal.removeClass('fade');
		this.$loginModal.modal('hide');
		this.$orderFormModal.modal('show');
	};

	OnSubmit(){
		var self = this;
		if(this.$orderForm.valid())
		{
			if(!this.LoggedInUser)
			{
				this.webSvc.GetUserByEmail(this.OrderFormViewModel.email())
					.then((usr)=>{
						var tmpUser = self.OrderFormViewModel.MakeTempUserSchema();
						if(usr){
							// email already exists - update current??
							// join temporary and existing data...
							self.storageHelper.LoggedInUser = usr;
						} else {
							// create new temp user
							var tmpUser = self.OrderFormViewModel.MakeTempUserSchema();
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

	_initValidation(){
		this.$orderForm.validate({
			rules:{
				make: "required",
				model: "required",
				color: "required",
				street: "required",
				city: "required",
				state: "required",
				zip: "required",
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
	};
}

class OrderFormViewModel {
	constructor(){
		var self = this;

		this.TIRE_SHINE_COST = Constants.TIRE_SHINE_COST;
		this.INTERIOR_COST = Constants.INTERIOR_COST;
		this.WAX_COST = Constants.WAX_COST;
		this.WASH_COST = Constants.WASH_COST;

		this.addShine = ko.observable(false);
		this.addWax = ko.observable(false);
		this.addInterior = ko.observable(false);
		this.showBillingAddress = ko.observable(false);

		this.carSizeMultiples = [
			new CarSizeMultiple("Small (2-4 door)", 1.0),
			new CarSizeMultiple("SUV (5-door)", 1.2),
			new CarSizeMultiple("XXL", 1.5)
		];
		this.selectedCarSize = ko.observable(this.carSizeMultiples[0]);

		this.description = ko.observable("");

		this.timeRanges = ["9:00 - 12:00 PM", "12:00 - 3:00 PM", "3:00 - 6:00 PM", "6:00 - 9:00 PM"];
		this.selectedTimeRange = ko.observable(this.timeRanges[0]);

		this.date = ko.observable(moment().format("MM/DD/YY"));
		this.make = ko.observable("");
		this.model = ko.observable("");
		this.color = ko.observable("");
		this.tag = ko.observable("");

		this.email = ko.observable("");
		this.phone = ko.observable("");

		this.street = ko.observable("");
		this.city = ko.observable("");
		this.state = ko.observable("");
		this.zip = ko.observable("");

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
			var total = parseFloat((Constants.WASH_COST + (self.addShine() ? Constants.TIRE_SHINE_COST : 0) + 
				(self.addWax() ? Constants.WAX_COST : 0) + 
				(self.addInterior() ? Constants.INTERIOR_COST : 0)) *
				(self.selectedCarSize().multiple));
			return total >= 100 ? total.toPrecision(5) : total.toPrecision(4);
		});

		this.orderSummary = ko.computed(()=>{
			return $.validator.format("Exterior Hand Wash<br>{0}{1}{2}{3} = {4}x cost multiple.", 
				(self.addShine() ? "Deep Tire Clean & Shine<br>" : ""),
				(self.addWax() ? "Hand Wax & Buff<br>" : ""),
				(self.addInterior() ? "Full Interior Cleaning<br>" : ""),
				self.selectedCarSize().size,
				self.selectedCarSize().multiple.toString());
		});
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

	_makeCarSchema(){
		return {
			color: this.color(),
			make: this.make(),
			model: this.model(),
			size: this.selectedCarSize(),
			tag: this.tag(),
			year: parseInt(this.year())
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
			//title: this.title(), // TODO
			zip: this.zip()
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

	get Appointments(){
		if(this.storageType && this.storageType.appointments){
			return JSON.parse(this.storageType.appointments);
		} else {
			return [];
		}
	}

	set Appointments(appts){
		if(this.storageType){
			this.storageType.appointments = JSON.stringify(appts);
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

class CarSizeMultiple {
	constructor(size, multiple){
			this.size = size;
			this.multiple = multiple;
	};
}
