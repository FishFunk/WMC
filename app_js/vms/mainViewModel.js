// Main ViewModel Class
class MainViewModel {

	get DialogPresenter(){
		return dialogPresenter;
	}

	constructor(storageHelper, logInVm, orderFormVm, giftFormVm){
		
		// observables
		this.WASH_COST = Configuration.WASH_DETAILS.price;
		this.WashPriceHtml = "<sup>$</sup>"+this.WASH_COST;
		this.TireShinePriceHtml = "<sup>$</sup>"+Configuration.TIRE_SHINE_DETAILS.price;
		this.InteriorPriceHtml = "<sup>$</sup>"+Configuration.INTERIOR_DETAILS.price;
		this.WaxPriceHtml = "<sup>$</sup>"+Configuration.WAX_DETAILS.price;

		this.WASH_TITLE = Configuration.WASH_DETAILS.title;
		this.TIRE_SHINE_TITLE = Configuration.TIRE_SHINE_DETAILS.title;
		this.WAX_TITLE = Configuration.WAX_DETAILS.title;
		this.INTERIOR_TITLE = Configuration.INTERIOR_DETAILS.title;

		this.LogInViewModel = logInVm;
		this.OrderFormViewModel = orderFormVm;
		this.GiftFormViewModel = giftFormVm;

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
			this.zip("");
		}
	}
}
