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

		this.incompleteGiftMsg = ko.observable("");

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
				if(s.item == Constants.TIRE_SHINE || 
				   s.item == Constants.WAX)
				{
					s.disable(!bool);
				}
			});
		});

	    this.addInterior.subscribe((bool)=>{
			this.Services().forEach((s)=>{
				if(s.item == Constants.SHAMPOO || 
				   s.item == Constants.CONDITIONER)
				{
					s.disable(!bool);
				}
			});
		});

		this.Rows = _.partition(this.Services(), (s)=>{
			return s.sortOrder <= Math.ceil(this.Services().length / 2);
		});


		// Car Info
		this.carSizes = Configuration.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);

		// Contact Info
		this.email = ko.observable("");

		// Location Info
		this.zip = ko.observable(this.storageHelper.ZipCode);

		this.orderTotal = ko.computed(()=>{
			let total = 0.00;
			let serviceCost = _.reduce(this.Services(), function(memo, s){ 
				if(s.checked() && !s.disable()){
					memo += s.price;
				} 
				return memo;
			}, 0);

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
		this.Services().forEach(s => s.checked(false));

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
		
		this.Services().forEach(s =>{
			if(s.checked() && !s.disable()){
				summary += s.title + "<br>";
			}
		});

		return summary;	
	}
}