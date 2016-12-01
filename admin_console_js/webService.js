class WebService {
	constructor(){
		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	GetAllAppointments(){
		return this._executeAjaxCall('GET', "/api/getAllAppointments");
	}

	VerifyAdmin(usr, pwd){
		return this._executeAjaxCall('POST', "/api/verifyAdmin", {usr: usr, pwd: pwd});
	}

	DeleteExpiredAppointments(user){
		return this._executeAjaxCall('DELETE', "/api/deleteExpiredAppointments");
	}

	DeleteSingleAppointment(id){
		return this._executeAjaxCall('DELETE', "/api/deleteSingleAppointment?id=" + id);
	}

	DeleteSingleCoupon(id){
		return this._executeAjaxCall('DELETE', "/api/deleteSingleCoupon?id=" + id);
	}

	UpdateAppointment(appt){
		return this._executeAjaxCall('POST', "/api/updateAppointment", { appt: appt });
	}

	GetSystemSettings(){
		return this._executeAjaxCall('GET', "/api/getSystemSettings");
	}

	GetAllCoupons(){
		return this._executeAjaxCall('GET', '/api/getAllCoupons');
	}

	CreateCoupon(coupon){
		return this._executeAjaxCall('POST', '/api/createCoupon', {coupon: coupon});
	}

	SendEmail(to, from, subject, msg){
		return this._executeAjaxCall('POST', '/api/sendEmail', {to: to, from: from, subject: subject, msg: msg});
	}
	
	GetUserEmails(){
		return this._executeAjaxCall('GET', '/api/getUserEmails');
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
