// Main ViewModel Class
class MainViewModel {

	get DialogPresenter(){
		return dialogPresenter;
	}

	constructor(storageHelper, logInVm, orderFormVm, giftFormVm) {
		// observables
		this.Services = Configuration.SERVICES;
		this.WASH_COST = _.find(this.Services, (s) => s.item == Constants.WASH).price;
		if(this.Services.length % 2 != 0){
			_.last(this.Services).fullSpan = "col-md-12";
		}

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
