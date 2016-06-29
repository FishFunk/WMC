class DialogPresenter{
	constructor(){
		this.title = ko.observable("");
		this.body = ko.observable("");
		this.$modal = $('#generic-modal');
	}

	ShowOrderFailure(){
		this.title("Oh no :(");
		this.body("We're really sorry about this... Looks like there was a problem submitting your order. Please contact us for support.");
		this.$modal.modal('show');
	}

	ShowOrderSuccess(){
		this.title("Thank you!");
		this.body("Your order has been placed. Please check your email for confirmation.");
		this.$modal.modal('show');
	}

	ShowBadZip(){
		this.title("Darn! We don't service that area yet.");
		this.body(s.sprintf('We\'re still young and growing so check back soon. Feel free to \
              <a href=%s>contact us</a> so we know where to target next.',
			"javascript:$('.modal').removeClass('fade');$('.modal').modal('hide');$('#contact-modal').modal('show');$('.modal').addClass('fade');"));
		this.$modal.modal('show');
	}
}