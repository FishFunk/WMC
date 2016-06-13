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

	OnShowContactModal(){
		$('#contact-modal').modal();
	}

	OnVerifyZip(){
		if(Utils.VerifyZip(this.zip())){
			this.zipVerified(true);
			this.storageHelper.ZipCode = this.zip();
		} else {
			bootbox.alert(Constants.BAD_ZIP_MSG);
		}
	}
}
