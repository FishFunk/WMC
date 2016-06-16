class LogInViewModel {
	constructor(storageHelper, webSvc){
		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
		this.$loginForm = $("#login-form");
		this.$createAcctForm = $("#create-acct-form");
		this.$forgotPwdForm = $("#forgot-pwd-form");

		this.ShowLogin = ko.observable(true);
		this.ShowCreateAcct = ko.observable(false);
		this.ShowForgotPwd = ko.observable(false);

		this.email = ko.observable();
		this.pwd = ko.observable();

		this.firstName = ko.observable("");
		this.lastName = ko.observable("");
		this.phone = ko.observable("");
		this.verifyPwd = ko.observable("");
		this.verifyEmail = ko.observableArray("");

		this._initValidation();
	}

	OnContinueAsGuest(){
		this._resetForms();
		this._toggleModals();
	}


	OnShowCreateAcct(){
		this._resetForms();
		this.ShowForgotPwd(false);
		this.ShowLogin(false);
		this.ShowCreateAcct(true);
	}

	OnCancelCreateAcct(){
		this._resetForms();
		this.ShowForgotPwd(false);
		this.ShowCreateAcct(false);
		this.ShowLogin(true);
	}

	OnCreateAcct(){
		var self = this;
		if(this.$createAcctForm.valid()){
			spinner.Show();
			async.series([
					this._checkIfEmailExists.bind(this),
					this._createNewUser.bind(this)
				],
				possibleError=>{
					spinner.Hide();
					if(possibleError === Constants.ASYNC_INTERUPTION_MARKER){
						bootbox.alert("That email is already in use! Did you forget your password?");
					} else if (possibleError) {
						bootbox.alert("There was a problem creating your account.");
					} else {
						self._toggleModals();
					}
				});
		}
	}

	OnLogIn(){
		var self = this;
		if(this.$loginForm.valid()){
			spinner.Show()
			this.webSvc.GetUserByEmailAndPwd(this.email(), this.pwd())
				.then((user)=>{
					if(user){
						self.storageHelper.LoggedInUser = user;
						self._resetForms();
						self._toggleModals();
					} else {
						bootbox.alert("Hmmm, we didn't find an account matching those credentials. \
							Please verify your info and try again or click the 'Forgot Password' link.");
						self._resetForms();
						self.$loginForm.valid();
					}
				})
				.fail(err =>{
					self._resetForms();
					bootbox.alert("Uh oh... something went wrong!");
				})
				.always(()=>spinner.Hide());
		}
	}

	OnShowForgotPwd(){
		this._resetForms();
		this.ShowLogin(false);
		this.ShowCreateAcct(false);
		this.ShowForgotPwd(true);
	}

	OnCancelForgotPwd(){
		this._resetForms();
		this.ShowCreateAcct(false);
		this.ShowForgotPwd(false);
		this.ShowLogin(true);
	}

	OnSubmitForgotPwd(){
		if(this.$forgotPwdForm.valid()){
			var self = this;
			spinner.Show();
			this.webSvc.ForgotPassword(this.email())
				.then(()=>{
					bootbox.alert("Nice! Check your email ;)");
					self._resetForms();
					self.OnCancelForgotPwd();
				})
				.fail(err => {
					bootbox.alert("Uh oh, there was a problem...");
					console.log(err)
					self._resetForms();
				})
				.always(()=>spinner.Hide());
		}
	}

	_checkIfEmailExists(callback){
		this.webSvc.GetUserByEmail(this.email())
			.then((usr)=>{
				if(usr){
					callback(Constants.ASYNC_INTERUPTION_MARKER);
				} else {
					callback();
				}
			})
			.fail(err=>{
				callback(err);
			});
	}

	_createNewUser(callback){
		var self = this;
		var newUser = {
			email: this.email(),
			pwd: this.pwd()
		}
		this.webSvc.CreateUser(newUser)
			.then((newUser)=>{
				self.storageHelper.LoggedInUser = newUser;
				callback();
			})
			.fail(err=>{
				callback(err);
			});
	}

	_resetForms(){
		this.$loginForm.find("input").val("");
		this.$loginForm.validate().resetForm();
		this.$createAcctForm.find("input").val("");
		this.$createAcctForm.validate().resetForm();
		this.$forgotPwdForm.find("input").val("");
		this.$forgotPwdForm.validate().resetForm();
	}

	_toggleModals(){
		this.$loginModal.removeClass('fade');
		this.$loginModal.modal('hide');
		this.$orderFormModal.modal('show');
	}

	_initValidation(){
		var self = this;
		$.validator.addMethod("pwdLength", (value)=>{
			return value && value.length >= 8;
		});
		$.validator.addMethod("pwdEqual", ()=>{
			return self.pwd() === self.verifyPwd();
		}, "Passwords do not match!");
		$.validator.addMethod("emailEqual", ()=>{
			return Utils.IsStrEqual(self.email(), self.verifyEmail());
		}, "Emails do not match!");
		
		this.$createAcctForm.validate({
			rules: {
				email: {
					required: true,
					email: true
				},
				verifyEmail: {
					required: true,
					emailEqual: true
				},
				pwd: {
					required: true,
					pwdLength: true
				},
				verifyPwd: { 
					required: true,
					pwdEqual: true 
				}
			},
			messages: {
				email: "Please enter a valid email address.",
				pwd: "Password must be at least 8 characters."
			}
		});

		this.$loginForm.validate({
			rules:{
				email:{
					required: true,
					email: true
				},
				pwd: "required"
			},
			messages:{
				email: "Please enter a valid email address.",
				pwd: "Password required."
			}
		});

		this.$forgotPwdForm.validate({
			rules: {
				email: {
					required: true,
					email: true
				},
				verifyEmail: {
					required: true,
					emailEqual: true
				}
			},
			messages:{
				email: "Please enter a valid email address."
			}
		});
	}
}