class GiftFormViewModel {

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

		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$giftFormModal = $('#gift-form-modal');

		this.TIRE_SHINE_COST = Configuration.TIRE_SHINE_DETAILS.price;
		this.INTERIOR_COST = Configuration.INTERIOR_DETAILS.price;
		this.WAX_COST = Configuration.WAX_DETAILS.price;
		this.WASH_COST = Configuration.WASH_DETAILS.price;

		this.TIRE_SHINE_TITLE = Configuration.TIRE_SHINE_DETAILS.title;
		this.INTERIOR_TITLE = Configuration.INTERIOR_DETAILS.title;
		this.WAX_TITLE = Configuration.WAX_DETAILS.title;
		this.WASH_TITLE = Configuration.WASH_DETAILS.title;

		this.incompleteGiftMsg = ko.observable("");

		// Order Details
		this.addWash = ko.observable(true);
		this.addShine = ko.observable(false);
		this.addWax = ko.observable(false);
		this.addInterior = ko.observable(false);

		// Car Info
		this.carSizes = Configuration.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);

		// Contact Info
		this.email = ko.observable("");

		// Location Info
		this.zip = ko.observable(this.storageHelper.ZipCode);

		this.orderTotal = ko.computed(()=>{
			let total = 0.00;
			let serviceCost = 
					(self.addWash() ? self.WASH_COST : 0) +
					(self.addShine() && self.addWash()? self.TIRE_SHINE_COST : 0) + 
					(self.addWax() && self.addWash() ? self.WAX_COST : 0) + 
					(self.addInterior() ? self.INTERIOR_COST : 0);

			total += self.selectedCarSize().multiplier * serviceCost;

			return total.toFixed(2);
		});

		this.orderSummary = ko.computed(()=>{
			let summary = "";

			summary += self._buildServicesSummary() + "<hr>";

			summary += $.validator.format(
				"<strong>{0}</strong>{1}<br>",
				self.selectedCarSize().size,
				self.selectedCarSize().multiplier > 1 ? " - additional " + Math.round(((self.selectedCarSize().multiplier - 1) * 100)).toString() + "%" : "");

			return summary;
		});
	}

	OnAfterRender(elements, self){
		self.$giftForm = $('#gift-form');
		self._initValidation();
	}

	OnSubmit(){
		var self = this;
		if(!this.addWash() && !this.addInterior()){
			this.incompleteGiftMsg('Interior and/or exterior cleaning must be selected.');
			$('#incomplete-gift-alert').show();
			return;
		}

		if(!this.$giftForm.valid()){
			this.incompleteGiftMsg('Please fill in required details.');
			$('#incomplete-gift-alert').show();
			return;
		}

		if(!Utils.VerifyZip(this.zip())){
			this.incompleteGiftMsg("Sorry but we currently don't service within that zip code.");
			$('#incomplete-gift-alert').show();
			return;
		}

		$('#incomplete-gift-alert').hide();

		this._openCheckout();
	}

	OnFormCancel(){
		try{
			$('#incomplete-gift-alert').hide();
			this.$giftFormModal.modal('hide');
			this.$giftForm.validate().resetForm();

			this._resetObservables();

			window.location = "#page-top";

		} catch (ex){
			console.log("Failed to reset fields OnFormCancel()");
			console.log(ex);
		}
	}

	_openCheckout(){
		const total = parseInt(this.orderTotal() * 100);
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
			spinner.Show();
			async.waterfall([
					this._executeCharge.bind(this, token),
					this._sendGiftConfirmation.bind(this)
				],
				possibleError=>{
					if(possibleError === Constants.CHARGE_FAILURE_MARKER){
						self.incompleteGiftMsg('That card information didn\'t work.');
						$('#incomplete-gift-alert').show();
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
		this.$giftFormModal.modal('hide');
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

	_sendGiftConfirmation(callback){
		this.webSvc.SendGiftEmail(this.email(), this.orderTotal())
			.then(()=> callback())
			.fail(err => callback(err));
	}

	_executeCharge(token, callback){
		const total = parseInt(this.orderTotal() * 100);
      	this.webSvc.ExecuteCharge(token, total)
	      	.then(()=>callback())
	      	.fail((err)=>{
	      		console.log(err);
	      		callback(Constants.CHARGE_FAILURE_MARKER);
	      	});
	}

	_resetObservables(){
		this.incompleteGiftMsg("");

		// Order Details
		this.addWash(true);
		this.addShine(false);
		this.addWax(false);
		this.addInterior(false);

		// Car Info
		this.selectedCarSize(this.carSizes[0]);

		// Contact Info
		this.email("");

		// Location Info
		this.zip("");
	}

	_initValidation(){
		this.$giftForm.validate({
			rules:{
				zip: "required",
				email: {
					required: true,
					email: true
				}
			},
			messages:{
				email: "Please enter a valid email address."
			}
		});
	}

	_buildServicesSummary(){
		var summary = "";
		if(this.addWash()){
			summary += Configuration.WASH_DETAILS.title + "<br>";
		}
		if(this.addShine()){
			summary += Configuration.TIRE_SHINE_DETAILS.title + "<br>";
		}
		if(this.addWax()){
			summary += Configuration.WAX_DETAILS.title + "<br>";
		}
		if(this.addInterior()){
			summary += Configuration.INTERIOR_DETAILS.title + "<br>";
		}

		return summary;	
	}
}