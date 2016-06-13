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
				bootbox.alert("This is embarrassing... something went wrong and our app will not work correctly.\
					Please make sure you have a good internet connection and refresh the page.");
			});

	} catch (ex) {
	    alert("Uh oh... looks like your browser doesn't support our app. Try updating it to the latest version!");
	}
});