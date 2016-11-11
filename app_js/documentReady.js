window.jQuery(document).ready(($)=>{
	try {
		// Initialize Application
		Bootstrapper.Run()
			.then(()=>{
				var timer = setTimeout(()=>{
					$('#splash').fadeOut(1000);
					clearTimeout(timer);
				}, 1000);
			})
			.fail((err)=>{
				console.error(err);
				$('#splash').append('<div><h3>Website under maintenance. We apologize for the inconvenience</h3></div>');
			});
	} catch (ex) {
		console.error(ex);
	}
});