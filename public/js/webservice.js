class WebService {
	constructor(){
		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	GetAllAppointments(){
		return this._executeAjaxCall('GET', "/api/getFutureApptDatesAndTimes");
	}

	CreateUser(user){
		return this._executeAjaxCall('PUT', "/api/createUser", user);
	}

	GetUserByEmail(email){
		return this._executeAjaxCall('POST', "/api/getUserByEmail", {email: email});
	}

	GetUserByEmailAndPwd(email, pwd){
		return this._executeAjaxCall('POST', "/api/getUserByEmailAndPwd", {email: email, pwd: pwd});
	}

	// 'data' is an optional param
	_executeAjaxCall(type, ext, data){
		this.deferred = $.Deferred();
		$.ajax({
			url: this.baseUrl + ext,
			type: type,
			dataType: 'JSON',
			error: this._onError.bind(this),
			success: this._onSuccess.bind(this),
			timeout: 10000,
			data: data
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