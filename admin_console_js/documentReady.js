var spinner = null;
var webSvc = null;
var Configuration;

window.jQuery(document).ready(($)=>{
	spinner = new LoadingSpinner();
	webSvc = new WebService();

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

	webSvc.GetSystemSettings()
		.then(settings =>{
			Configuration = new Configuration(settings);
	    	var vm = new AdminConsoleVm();
		    ko.applyBindings(vm);
		    vm.Load();
		})
		.fail(err => console.log(error));
});