window.jQuery(document).ready(function($) {

	// Initialize UI Items

	// Closes the Responsive Menu on Menu Item Click
	$('.navbar-collapse ul li a').click(function() {
	    $('.navbar-toggle:visible').click();
	});

	// Highlight the top nav as scrolling occurs
	$('body').scrollspy({
	    target: '.navbar-fixed-top'
	});

	// Set min date and format for date picker
	$('#datetimepicker').datetimepicker({
		minDate: new Date(),
		format: 'MM/DD/YY'
	});

	// Populate dropdown with 12 expiry years from current year
	var populateExpYearOptions = function(){
		var $expiry = $("#exp-year");
		var year = new Date().getFullYear();

		for (var i = 0; i < 12; i++) {
		    $expiry.append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"))
		}
	};

	populateExpYearOptions();

	var storageHelper = new LocalStorageHelper(sessionStorage);
	var webSvc = new WebService();
	ko.applyBindings(new App(storageHelper, webSvc));
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

		this.isGuest = ko.observable(false);

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
		if(this.storageHelper.GetIsUserLoggedIn()){
			this.$orderFormModal.modal();
			this.webSvc.GetAllAppointments()
				.then(function(data){
					console.info(data);
				})
				.fail(function(err){
					console.error(err);
				});
		} else {
			this.$loginModal.modal();
		}
	};

	OnCreateNewAccount(){

	};

	OnContinueAsGuest(){
		this.isGuest(true);
		this.storageHelper.SetIsUserLoggedIn(true);
		this.$loginModal.removeClass('fade');
		this.$loginModal.modal('hide');
		this.$orderFormModal.modal('show');
	};

	OnSubmit(){
		if(this.$orderForm.valid())
		{
			if(this.isGuest())
			{
				// Create tmp user
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
					maxLength: 19
				},
				cvv: {
					required: true,
					maxLength: 4
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
		
		this.TIRE_SHINE_COST = 25;
		this.INTERIOR_COST = 75;
		this.WAX_COST = 50

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

		this.carConditions = ["Light Dirt", "Medium Dirt", "Heavy Dirt", "Filthy"];
		this.condition = ko.observable(this.carConditions[0]);

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

		this.orderTotal = ko.computed(function(){
			var total = parseFloat((32 + (self.addShine() ? self.TIRE_SHINE_COST : 0) + 
				(self.addWax() ? self.WAX_COST : 0) + 
				(self.addInterior() ? self.INTERIOR_COST : 0)) *
				(self.selectedCarSize().multiple));
			return total >= 100 ? total.toPrecision(5) : total.toPrecision(4);
		});

		this.orderSummary = ko.computed(function(){
			return $.validator.format("Exterior Hand Wash<br>{0}{1}{2}{3} = {4}x cost multiple.", 
				(self.addShine() ? "Deep Tire Clean & Shine<br>" : ""),
				(self.addWax() ? "Hand Wax & Buff<br>" : ""),
				(self.addInterior() ? "Full Interior Cleaning<br>" : ""),
				self.selectedCarSize().size,
				self.selectedCarSize().multiple.toString());
		});
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

	SetIsUserLoggedIn(bool){
		if(this.storageType){
			this.storageType.isUserLoggedIn = bool.toString();			
		}
	}

	GetIsUserLoggedIn(bool){
		if(this.storageType){
			return Boolean(this.storageType.isUserLoggedIn);
		} else {
			return false;
		}
	}
}

class CarSizeMultiple {
	constructor(size, multiple){
			this.size = size;
			this.multiple = multiple;
	};
}


class WebService {
	constructor(){
		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	GetAllAppointments(){
		return this._executeAjaxCall('GET', "/api/getAllAppointments");
	}

	CreateUser(user){
		return this._executeAjaxCall('PUT', "/api/createUser", user);
	}

	// 'data' is an optional param
	_executeAjaxCall(type, ext, data){
		this.deferred = $.Deferred();
		$.ajax({
			url: this.baseUrl + ext,
			type: type,
			dataType: 'JSON',
			error: this._onError.bind(this),
			success: this._onSuccess.bind(this),
			timeout: 10000,
			data: data ? JSON.stringify(data) : undefined
		});
		return this.deferred.promise();
	}

	_onSuccess(data, textStatus, jqXHR){
		console.info(data, textStatus, jqXHR);
		if(this.deferred){
			this.deferred.resolve(data);
		}
	}

	_onError(jqXHR, textStatus, err){
		console.error(jqXHR, textStatus, err);
		if(this.deferred){
			this.deferred.reject(err);
		}
	}
}

