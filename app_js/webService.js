class WebService {
	constructor(){
		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	GetFutureAppointments(){
		return this._executeAjaxCall('GET', "/api/getFutureApptDatesAndTimes");
	}

	CreateUser(user){
		return this._executeAjaxCall('POST', "/api/createNewUser", user);
	}

	GetUserByEmail(email){
		return this._executeAjaxCall('POST', "/api/getUserByEmail", {email: email});
	}

	GetUserByEmailAndPwd(email, pwd){
		return this._executeAjaxCall('POST', "/api/getUserByEmailAndPwd", {email: email, pwd: pwd});
	}

	SendConfirmationEmail(email, newAppt){
		return this._executeAjaxCall('POST', "/api/sendConfirmationEmail", {email: email, newAppt: newAppt})
	}

	UpdateUser(user){
		return this._executeAjaxCall('PUT', "/api/updateUser", user);
	}

	ForgotPassword(email){
		return this._executeAjaxCall('POST', "/api/forgotPassword", {email: email});
	}

	GetEnvironment(){
		return this._executeAjaxCall('GET', "/api/getEnvironment");
	}

	GetSystemSettings(){
		return this._executeAjaxCall('GET', "/api/getSystemSettings");
	}

	ExecuteCharge(stripeToken, price, lastName){
		return this._executeAjaxCall('POST', "/api/executeCharge", {
				stripeToken: stripeToken.id,
				price: price,
				lastName: lastName,
				email: stripeToken.email
			});
	}

	VerifyCoupon(code){
		return this._executeAjaxCall('POST', "/api/verifyCoupon", { code: code });
	}

	// 'data' is an optional param
	_executeAjaxCall(type, ext, data){
		this.deferred = $.Deferred();
		$.ajax({
			url: this.baseUrl + ext,
			type: type,
			contentType: "application/json; charset=UTF-8",
			dataType: 'json',
			error: this._onError.bind(this),
			success: this._onSuccess.bind(this),
			timeout: 10000,
			data: JSON.stringify(data)
		});
		return this.deferred.promise();
	}

	_onSuccess(res, textStatus, jqXHR){
		console.info(res, textStatus, jqXHR);
		if(this.deferred){
			var result = res ? res.data : null;
			this.deferred.resolve(result);
		}
	}

	_onError(jqXHR, textStatus, err){
		console.error(jqXHR, textStatus, err);
		if(this.deferred){
			this.deferred.reject(err);
		}
	}
}
