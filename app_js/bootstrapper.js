var spinner = null;
var environment = "debug";

class Bootstrapper{
	static Run(){
		var deferred = $.Deferred();
		var webSvc = null;
		spinner = new LoadingSpinner();
		// Closes the Responsive Menu on Menu Item Click
		$('.navbar-collapse ul li a').click(()=>{
		    $('.navbar-toggle:visible').click();
		});

		// Highlight the top nav as scrolling occurs
		$('body').scrollspy({
		    target: '.navbar-fixed-top'
		});

	    function reposition() {
	        var modal = $(this),
	            dialog = modal.find('.modal-dialog');
	        modal.css('display', 'block');
	        
	        // Dividing by two centers the modal exactly, but dividing by three 
	        // or four works better for larger screens.
	        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
	    }
	    
	    // Reposition when a modal is shown
	    $('.modal').on('show.bs.modal', reposition);
	    // Reposition when the window is resized
	    $(window).on('resize', function() {
	        $('.modal:visible').each(reposition);
	    });

		// Load Templates
		async.series([
				(callback)=>{
					$('#order-form-tmpl')
					.load('./templates/order-form-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback("Application failed to initialize.");
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#vehicle-tmpl')
					.load('./templates/vehicle-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback("Application failed to initialize.");
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#location-tmpl')
					.load('./templates/location-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback("Application failed to initialize.");
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					webSvc = new WebService();
					webSvc.GetEnvironment()
						.then((env)=>{
							environment = env;
							callback();
						})
						.fail(err => callback(err));
				},
				(callback)=>{
					// Cache Appointment Data
					var storageHelper = new LocalStorageHelper(sessionStorage);
					var orderFormVm = new OrderFormViewModel(storageHelper, webSvc);
					var logInVm = new LogInViewModel(storageHelper, webSvc);
					
					var mainVm = new MainViewModel(storageHelper, logInVm, orderFormVm);

					ko.applyBindings(mainVm);

					webSvc.GetAllAppointments()
						.then((appointments)=> {
							var apptsByDate = _.groupBy(appointments, (x)=> moment(x.date).format("MM/DD/YYYY"));
							storageHelper.AppointmentsByDate = apptsByDate;
							callback();
						})
						.fail((err)=>{
							callback(err);
					});

				}
			],
			(possibleError)=>{
				if(possibleError){
					deferred.reject(possibleError);
				} else {
					deferred.resolve();
				}
			});

		return deferred.promise();
	}
}
