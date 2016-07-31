// Main ViewModel Class
class MainViewModel {

	get DialogPresenter(){
		return dialogPresenter;
	}

	constructor(storageHelper, logInVm, orderFormVm){
		
		// observables
		this.WASH_COST = Configuration.WASH_DETAILS.price;
		this.TireShinePriceHtml = "<sup>$</sup>"+Configuration.TIRE_SHINE_DETAILS.price;
		this.InteriorPriceHtml = "<sup>$</sup>"+Configuration.INTERIOR_DETAILS.price;
		this.WaxPriceHtml = "<sup>$</sup>"+Configuration.WAX_DETAILS.price;

		this.LogInViewModel = logInVm;
		this.OrderFormViewModel = orderFormVm;
		// observables

		this.storageHelper = storageHelper;
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

	OnVerifyZip(){
		if(Utils.VerifyZip(this.zip())){
			this.zipVerified(true);
			this.storageHelper.ZipCode = this.zip();
		} else {
			dialogPresenter.ShowBadZip();
		}
	}
}
