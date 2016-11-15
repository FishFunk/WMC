var spinner = null;
var webSvc = null;
var Configuration;

window.jQuery(document).ready(($)=>{
	spinner = new LoadingSpinner();
	webSvc = new WebService();

	webSvc.GetSystemSettings()
		.then(settings =>{
			Configuration = new Configuration(settings);
	    	var vm = new AdminConsoleVm();
		    ko.applyBindings(vm);
		    vm.Load();
		})
		.fail(err => console.log(error));
});