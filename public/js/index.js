/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

window.jQuery(document).ready(function($) {
	var DEBUG_MODE = true;
	var CarSizeMultiple = function(size, multiple){
			this.size = size;
			this.multiple = multiple;
		};

	function App(){
		var self = this;

		this.TIRE_SHINE_COST = 25;
		this.INTERIOR_COST = 75;
		this.WAX_COST = 50

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

		this.onFormCancel = function(){
			$('#order-form-modal').modal('hide');
			window.location = "#page-top";			
		};

		this.populateExpYearOptions = function(){
			var $expiry = $("#exp-year");
			var year = new Date().getFullYear();

			for (var i = 0; i < 12; i++) {
			    $expiry.append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"))
			}
		};

		this.onPageScroll = function(data, event) {
		    var $anchor = $(event.currentTarget);
		    $('html, body').stop().animate({
		        scrollTop: $($anchor.attr('href')).offset().top
		    }, 1500, 'easeInOutExpo');
		    event.preventDefault();
	    };

		// Show Order Form Modal
		this.onShowOrderForm = function(){
			$('#order-form-modal').modal('show');
		};

		this.onSubmit = function(){
			if($('#order-form').valid())
			{
				// additionanl validation
				// weather
				// is date/time overbooked
				// etc...
			}
		};

		// Closes the Responsive Menu on Menu Item Click
		$('.navbar-collapse ul li a').click(function() {
		    $('.navbar-toggle:visible').click();
		});

		// Highlight the top nav as scrolling occurs
		$('body').scrollspy({
		    target: '.navbar-fixed-top'
		});

		$('#datetimepicker').datetimepicker({
			minDate: new Date(),
			format: 'MM/DD/YY'
		});

		$('#order-form').validate({
			rules:{
				make: "required",
				model: "required",
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

		// Load FB SDK
		window.fbAsyncInit = function() {
		    FB.init({
		      appId      : 'WashMyCar',
		      xfbml      : true,
		      version    : 'v2.5'
		    });

		    FB.getLoginStatus(function(response) {
			  if (response.status === 'connected') {
			    console.log('Logged in.');
			  }
			  else {
			    FB.login();
			  }
			});
		};

		(function(d, s, id){
		    var js, fjs = d.getElementsByTagName(s)[0];
		    if (d.getElementById(id)) {return;}
		    js = d.createElement(s); js.id = id;
		    js.src = "//connect.facebook.net/en_US/sdk.js";
		    fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	};

	var app = new App();
	app.populateExpYearOptions();
	ko.applyBindings(app);
});


