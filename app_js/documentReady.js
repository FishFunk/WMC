window.jQuery(document).ready(($)=>{
	try {
		// Initialize Application
		Bootstrapper.Run()
			.fail((err)=>{
				console.error(err);
				$('#splash')
				.removeAttr('hidden')
				.append('<div><h3>Website is under maintenance. We apologize for the inconvenience</h3></div>');
			});
	} catch (ex) {
		console.error(ex);
	}
});