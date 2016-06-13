window.jQuery(document).ready(($)=>{

	function showFailureMsg(){
		var msg = "This is embarrassing... something went wrong and our app will not work correctly.\
		Please make sure you have a good internet connection and refresh the page."
		if(bootbox){
			bootbox.alert(msg);
		} else {
			alert(msg);
		}	
	}

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
				showFailureMsg();
			});

	} catch (ex) {
		showFailureMsg();
	}
});