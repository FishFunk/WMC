class LogInViewModel {
	constructor(storageHelper, webSvc){
		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
		this.$loginForm = $("#login-form");
		this.$createAcctForm = $("#create-acct-form");
		this.$forgotPwdForm = $("#forgot-pwd-form");
		this.$loginFormAlert = $("#login-form-alert");
		this.$loginFormInfo = $("#login-form-info");

		this.ShowLogin = ko.observable(true);
		this.ShowCreateAcct = ko.observable(false);
		this.ShowForgotPwd = ko.observable(false);

		this.loginFormMsg = ko.observable("");

		this.email = ko.observable();
		this.pwd = ko.observable();

		this.firstName = ko.observable("");
		this.lastName = ko.observable("");
		this.phone = ko.observable("");
		this.verifyPwd = ko.observable("");
		this.verifyEmail = ko.observable("");

		this._initValidation();
	}

	OnDismissMsg(){
		this.$loginFormAlert.hide();
		this.$loginFormInfo.hide();
	}

	OnContinueAsGuest(){
		this.storageHelper.LoggedInUser = null;
		this.storageHelper.IsNewUser = false;
		this.OnDismissMsg();
		this._resetForms();
		this._toggleModals();
	}


	OnShowCreateAcct(){
		this._resetForms();
		this.ShowForgotPwd(false);
		this.ShowLogin(false);
		this.ShowCreateAcct(true);
		this.OnDismissMsg();
	}

	OnCancelCreateAcct(){
		this._resetForms();
		this.ShowForgotPwd(false);
		this.ShowCreateAcct(false);
		this.ShowLogin(true);
		this.OnDismissMsg();
	}

	OnCreateAcct(){
		var self = this;
		if(this.$createAcctForm.valid()){
			spinner.Show();
			async.series([
					this._checkIfUserExists.bind(this),
					this._createNewUser.bind(this)
				],
				possibleError=>{
					spinner.Hide();
					if(possibleError === Constants.ASYNC_INTERUPTION_MARKER){
						self.loginFormMsg("That email is already in use! Did you forget your password?");
						self.$loginFormAlert.show();
					} else if (possibleError) {
						self.loginFormMsg("There was a problem creating your account.");
						self.$loginFormAlert.show();
					} else {
						self.storageHelper.IsNewUser = true;
						self.OnCancelCreateAcct();
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
				.then((usr)=>{
					if(usr){
						self.storageHelper.LoggedInUser = usr;
						self.storageHelper.IsNewUser = false;
						self._resetForms();
						self._toggleModals();
					} else {
						self.loginFormMsg("Hmmm, we didn't find an account matching those credentials. \
							Please verify your info and try again or click 'Forgot Password'.");
						self.$loginFormAlert.show()
						self._resetForms();
					}
				})
				.fail(err =>{
					self._resetForms();
					self.loginFormMsg("Uh oh... something went wrong.");
					self.$loginFormAlert.show()
				})
				.always(()=>spinner.Hide());
		}
	}

	OnShowForgotPwd(){
		this._resetForms();
		this.ShowLogin(false);
		this.ShowCreateAcct(false);
		this.ShowForgotPwd(true);
		this.OnDismissMsg();
	}

	OnCancelForgotPwd(){
		this._resetForms();
		this.ShowCreateAcct(false);
		this.ShowForgotPwd(false);
		this.ShowLogin(true);
		this.OnDismissMsg();
	}

	OnSubmitForgotPwd(){
		if(this.$forgotPwdForm.valid()){
			var self = this;
			spinner.Show();
			this.webSvc.ForgotPassword(this.email())
				.then(()=>{
					self.loginFormMsg("Nice! Check your email ;)");
					self.$loginFormInfo.show();
					self._resetForms();
					self.ShowCreateAcct(false);
					self.ShowForgotPwd(false);
					self.ShowLogin(true);
				})
				.fail(err => {
					self.loginFormMsg("Uh oh... something went wrong.");
					self.$loginFormAlert.show();
					console.log(err)
					self._resetForms();
				})
				.always(()=>spinner.Hide());
		}
	}

	_checkIfUserExists(callback){
		this.webSvc.GetUserByEmail(this.email())
			.then((usr)=>{
				if(usr && !usr.isGuest){
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
			pwd: this.pwd(),
			isGuest: false
		};
		this.webSvc.CreateUser(newUser)
			.then((usr)=>{
				self.storageHelper.LoggedInUser = usr;
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
		this.$loginModal.addClass('fade');
		this.$orderFormModal.modal('show');

	}

	_initValidation(){
		var self = this;
		$.validator.addMethod("pwdLength", (value)=>{
			return value && value.length >= 6;
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
				pwd: "Password must be at least 6 characters."
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