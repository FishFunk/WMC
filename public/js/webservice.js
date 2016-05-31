class WebService {
	constructor(){
		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	GetAllAppointments(){
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

	SendConfirmationEmail(email, appts){
		return this._executeAjaxCall('POST', "/api/sendConfirmationEmail", {email: email, appointments: appts})
	}

	UpdateUser(user){
		return this._executeAjaxCall('PUT', "/api/updateUser", user);
	}

	ExecuteCharge(stripeToken, price, lastName){
		return this._executeAjaxCall('POST', "/api/executeCharge", {
				stripeToken: stripeToken.id,
				price: price,
				lastName: lastName,
				email: stripeToken.email
			});
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