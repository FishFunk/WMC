var spinner = null;
var webSvc = null;

window.jQuery(document).ready(($)=>{
	spinner = new LoadingSpinner();
	webSvc = new WebService();
    var vm = new AdminConsoleVm();
    
    ko.applyBindings(vm);
    vm.Load();
});