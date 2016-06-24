// global variables
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
	        modal.css('-webkit-overflow-scrolling', '');
	        
	        // Dividing by two centers the modal exactly, but dividing by three 
	        // or four works better for larger screens.
	        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
	    }
	    
	    // Reposition when a modal is shown
	    $('.modal').on('show.bs.modal', reposition);
	    // Reposition when the window is resized
	    $(window).on('resize', ()=> {
	        $('.modal:visible').each(reposition);
	    });

		// iOS fix for modal bug with virtual keyboard
		if(navigator.userAgent.match(/iPhone|iPad|iPod/i)){
		    $('.modal').on('show.bs.modal', function() {
		        // Position modal absolute and bump it down to the scrollPosition
		        $(this)
		            .css({
		                position: 'absolute',
		                marginTop: $(window).scrollTop() + 'px',
		                bottom: 'auto'
		            });
		        // Position backdrop absolute and make it span the entire page
		        // after Boostrap positions it but before transitions finish
		        setTimeout(()=> {
		            $('.modal-backdrop').css({
		                position: 'absolute', 
		                top: 0, 
		                left: 0,
		                width: '100%',
		                height: Math.max(
		                    document.body.scrollHeight, document.documentElement.scrollHeight,
		                    document.body.offsetHeight, document.documentElement.offsetHeight,
		                    document.body.clientHeight, document.documentElement.clientHeight
		                ) + 'px'
		            });
		        }, 0);
		    });
		}

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
					var storageHelper = new LocalStorageHelper(sessionStorage);
					var orderFormVm = new OrderFormViewModel(storageHelper, webSvc);
					var logInVm = new LogInViewModel(storageHelper, webSvc);
					
					var mainVm = new MainViewModel(storageHelper, logInVm, orderFormVm);

					ko.applyBindings(mainVm);

					// Cache Appointment Data
					webSvc.GetFutureAppointments()
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
