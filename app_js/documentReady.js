window.jQuery(document).ready(($)=>{

	try {
		// Initialize Application
		Bootstrapper.Run()
			.then(()=>{
				var timer = setTimeout(()=>{
					$('#splash').fadeOut(1000);
					clearTimeout(timer);
				}, 2000)
			})
			.fail((err)=>{
				console.error(err);
			});

	} catch (ex) {
		console.error(ex);
	}
});