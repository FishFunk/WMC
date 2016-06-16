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
		spinner.Show();
		webSvc.VerifyAdmin(this.usr(), this.pwd())
	        .then(admin=>{
	        	if(admin){
	        		self.success = true;
	        		self.$modal.modal('hide');
	        		self.consoleVm.Load();
	        	} else {
	        		bootbox.alert("Invalid Credentials. User and password are case sensitive.");
	        	}
	        })
	        .fail(err=>console.log(err))
	        .always(()=>spinner.Hide());
	}
}