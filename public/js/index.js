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

		this.TIRE_SHINE_COST = 25;
		this.INTERIOR_COST = 75;
		this.WAX_COST = 50

		this.isGuest = ko.observable(false);
		this.showBillingAddress = ko.observable(false);
		this.addShine = ko.observable(false);
		this.addWax = ko.observable(false);
		this.addInterior = ko.observable(false);
		this.carSizeMultiples = [
			new CarSizeMultiple("Small (2-4 door)", 1.0),
			new CarSizeMultiple("SUV (5-door)", 1.2),
			new CarSizeMultiple("XXL", 1.5)
		];
		this.selectedCarSize = ko.observable(this.carSizeMultiples[0]);
		this.orderTotal = ko.computed(function(){
			var total = parseFloat((32 + (self.addShine() ? self.TIRE_SHINE_COST : 0) + 
				(self.addWax() ? self.WAX_COST : 0) + 
				(self.addInterior() ? self.INTERIOR_COST : 0)) *
				(self.selectedCarSize().multiple));
			return total >= 100 ? total.toPrecision(5) : total.toPrecision(4);
		});

		this.orderSummary = ko.computed(function(){
			return $.validator.format("Exterior Hand Wash{0}{1}{2}. {3} = {4}x cost multiple.", 
				(self.addShine() ? ", Deep Tire Clean & Shine" : ""),
				(self.addWax() ? ", Hand Wax & Buff" : ""),
				(self.addInterior() ? ", Full Interior Cleaning" : ""),
				self.selectedCarSize().size,
				self.selectedCarSize().multiple.toString());
		});

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
					console.log(data);
				})
				.fail(function(err){
					console.log(err);
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
			// additionanl validation
			// weather
			// is date/time overbooked
			// etc...
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

class LocalStorageHelper{
	constructor(storageType){
		if(typeof(Storage) === "undefined") {
			console.log("No local storage available.");
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
		var self = this;
		this.baseUrl = document.location.origin;
		this.ajaxOptions = {
			type: 'GET',
			dataType: 'JSON',
			error: self._onError.bind(self),
			success: self._onSuccess.bind(self),
			timeout: 10000
		}
		this.deferred = null;
	}

	GetAllAppointments(){
		this.deferred = $.Deferred();
		this.ajaxOptions.url = this.baseUrl + "/api/getAllAppointments";
		$.ajax(this.ajaxOptions);
		return this.deferred.promise();
	}

	_onSuccess(data, textStatus, jqXHR){
		console.log(data, textStatus, jqXHR);
		if(this.deferred){
			this.deferred.resolve(data);
		}
	}

	_onError(jqXHR, textStatus, err){
		console.log(jqXHR, textStatus, err);
		if(this.deferred){
			this.deferred.reject(err);
		}
	}
}

