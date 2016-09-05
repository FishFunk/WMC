// global variables
var spinner = null;
var environment = "debug";
var dialogPresenter = null;
var Configuration = {};

class Bootstrapper{
	static Run(){
		var deferred = $.Deferred();
		var webSvc = null;
		spinner = new LoadingSpinner();
		dialogPresenter = new DialogPresenter();

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
	    $(window).on('resize', function(){
	        $('.modal:visible').each(reposition);
	    });

		// Load Templates
		const failureMsg = "Application failed to initialize.";
		async.series([
				(callback)=>{
					$('#order-form-tmpl')
					.load('./templates/order-form-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback(failureMsg);
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#contact-modal-tmpl')
					.load('./templates/contact-modal-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback(failureMsg);
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#login-modal-tmpl')
					.load('./templates/login-modal-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback(failureMsg);
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#vehicle-tmpl')
					.load('./templates/vehicle-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback(failureMsg);
						} else {
							callback();
						}
					});
				},
				(callback)=>{
					$('#location-tmpl')
					.load('./templates/location-tmpl.html', (res, status, jqHXR)=>{
						if(status==="error"){
							callback(failureMsg);
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
					webSvc.GetSystemSettings()
						.then(settings =>{
							Configuration = new Configuration(settings);
							callback();
						})
						.fail(err => callback(err));
				},
				(callback)=>{
					var storageHelper = new LocalStorageHelper(sessionStorage);
					var orderFormVm = new OrderFormViewModel(storageHelper, webSvc);
					var logInVm = new LogInViewModel(storageHelper, webSvc);
					
					var mainVm = new MainViewModel(storageHelper, logInVm, orderFormVm);

					ko.applyBindings(mainVm);

					// Cache Appointment Data
					webSvc.GetFutureAppointments()
						.then((appointments)=> {
							var apptsByDate = _.groupBy(appointments, (x)=> moment(x.date).format(Configuration.DATE_FORMAT));
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
