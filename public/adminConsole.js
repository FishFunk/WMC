window.jQuery(document).ready(($)=>{
    var vm = new AdminConsoleVm();
    ko.applyBindings(vm);

    vm.Load();
});

class AdminConsoleVm{
	constructor(){
		this.loginVm = new LoginViewModel(this);
		this.days = ko.observableArray();
	}

	get LoginViewModel(){
		return this.loginVm;
	}

	Load(){
		if(!this.loginVm.VerifyUser){
			return;
		}

		var self = this;
		self.days([]);
		_executeAjaxCall('GET', "/api/getAllAppointments")
	        .then(appts=>{
	        	var dict = {};
	            _.each(appts, (a)=>{
	                a.date = moment(a.date).format("MM/DD/YYYY");
	                dict[a.date] ? dict[a.date].push(a) : dict[a.date] = [a];
	            });

	            for (var key in dict) {
				    if (dict.hasOwnProperty(key)) {
				        self.days.push(new Day(key, dict[key]));
				    }
				}

				self.days(_.sortBy(self.days(), (day)=> day.date));

				console.log(self.days());
	        })
	        .fail(err=>console.log(err));
	}

	DeleteOld(){
		if(!this.loginVm.VerifyUser){
			return;
		}

		var self = this;
		bootbox.confirm("Are you sure you want to delete expired appointments??", 
			(bool)=>{
				if(bool){
					_executeAjaxCall('DELETE', "/api/deleteExpiredAppointments")
	        			.fail(err=>console.log(err));
				}
			});
	}
}

class Day{
	constructor(date, appts){
		this.day = moment(date).format('dddd');
		this.date = date;
		this.appts = appts;
	}
}

class LoginViewModel{
	constructor(consoleVm){
		this.consoleVm = consoleVm;
		this.$modal = $("#login-modal");
		this.usr = ko.observable("");
		this.pwd = ko.observable("");
		this.success = false;
	}

	get VerifyUser(){
		if(!this.success){
			this.$modal.modal();
		}
		return this.success;
	}

	OnVerify(){
		var self = this;
		_executeAjaxCall('POST', "/api/verifyAdmin", {usr: this.usr(), pwd: this.pwd()})
	        .then(admin=>{
	        	if(admin){
	        		self.success = true;
	        		self.$modal.modal('hide');
	        		self.consoleVm.Load();
	        	} else {
	        		bootbox.alert("Invalid Credentials. User and password are case sensitive.");
	        	}
	        })
	        .fail(err=>console.log(err));
	}
}

function _executeAjaxCall(type, ext, data){
	var deferred = $.Deferred();
	$.ajax({
		url: document.location.origin + ext,
		type: type,
		contentType: "application/json; charset=UTF-8",
		dataType: 'json',
		success: function _onSuccess(res, textStatus, jqXHR){
			console.info(res, textStatus, jqXHR);
			var result = res ? res.data : null;
			deferred.resolve(result);
		},
		error: function _onError(jqXHR, textStatus, err){
			console.error(jqXHR, textStatus, err);
			deferred.reject(err);
		},
		timeout: 10000,
		data: JSON.stringify(data)
	});
	return deferred.promise();
}