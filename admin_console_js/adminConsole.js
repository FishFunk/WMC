class AdminConsoleVm{
	constructor(){
		this.loginVm = new LoginViewModel(this);
		this.days = ko.observableArray();
		this.coupons = ko.observableArray();
		this.display = ko.observable("appointments");
		this.newCoupon = ko.observable(this._makeCouponSchema());
		
		this.emailSubject = ko.observable("");
		this.emailMessage = ko.observable("");
		this.senderEmails = ko.observableArray([
			    "donotreply@washmycarva.com",
                "daniel.fishman@washmycarva.com",
                "dinko.badic@washmycarva.com",
                "contact@washmycarva.com"
			]);
		this.userEmails = ko.observableArray([]);
		this.fromEmail = ko.observable(this.senderEmails()[0]);
		this.selectedUserEmails = ko.observableArray([]);
	}

	get LoginViewModel(){
		return this.loginVm;
	}

	get NewCoupon(){
		return this.newCoupon;
	}

	Load(){
		if(!this.loginVm.VerifyUser){
			return;
		}

		var self = this;
		self.days([]);
		spinner.Show();

		async.series([
				self.InitializeDatePickers.bind(self),
				self.LoadAppointments.bind(self),
				self.LoadCoupons.bind(self),
				self.LoadEmails.bind(self)
			],
			possibleError=>{
				if(possibleError){
					console.error(possibleError);
				}
				spinner.Hide();
			});
	}

	InitializeDatePickers(callback){
		var self = this;
		try{
			const options = {
				minDate: moment().subtract(1, 'days'),
				format: "MM/DD/YY",
				allowInputToggle: true,
				focusOnShow: false,
				ignoreReadonly: true,
				showClear: true,
				showClose: true
			};

			$('#coupon-start-date').datetimepicker(options)
				.on('dp.change', self._couponStartDateChange.bind(self));

			$('#coupon-end-date').datetimepicker(options)
				.on('dp.change', self._couponEndDateChange.bind(self));

			callback();
		}
		catch(ex){
			callback(ex);
		}
	}

	LoadAppointments(callback){
		var self = this;
		webSvc.GetAllAppointments()
	        .then(appts=>{
	        	appts = _.sortBy(appts, (a)=> a.date);
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
				callback();
	        })
	        .fail((err)=>callback(err));		
	}

	LoadCoupons(callback){
		var self = this;
		webSvc.GetAllCoupons()
			.then(result =>{
				self.coupons(result);
				callback();
			})
			.fail(err=>{
				callback(err);
			});
	}

	LoadEmails(callback){
		var self = this;
		webSvc.GetUserEmails()
			.then(result =>{
				self.userEmails(result);
				callback();
			})
			.fail(err=>{
				callback(err);
			});
	}

	DeleteOld(){
		if(!this.loginVm.VerifyUser){
			return;
		}

		var self = this;
		bootbox.confirm("Are you sure you want to delete expired appointments?", 
			(bool)=>{
				if(bool){
					spinner.Show();
					webSvc.DeleteExpiredAppointments()
						.then(()=>self.Load())
	        			.fail(err=>console.error(err))
	        			.always(()=>spinner.Hide());
				}
			});
	}

	OnEditAppointment(appointment){
		var self = this;
		const html = '<textarea id="edit-appointment-json" style="min-width:500px;min-height:400px;">' + JSON.stringify(appointment, null, 4) + '</textarea>'
		if(!appointment._id){
			bootbox.alert("Unable to update - no ID");
			return;
		}
		bootbox.dialog({
			title: "Edit Appointment",
			message: html,
			buttons: {
				cancel: {
					label: 'CANCEL',
					className: 'btn-default',
					callback: () => {}
				},
				submit: {
					label: 'DONE',
					className: 'btn-primary',
					callback: ()=>{
						try{
							const newJson = $('#edit-appointment-json').val();
							const appt = JSON.parse(newJson);

							const dateMoment = moment(appt.date);
							if(!dateMoment.isValid()){
								bootbox.alert("Invalid date");
								return;
							}

							appt.date = dateMoment.toDate();
							webSvc.UpdateAppointment(appt)
								.then(()=>{
									bootbox.alert("Update Successful!");
									self.Load();
								})
								.fail(err =>{
									console.error(err);
									bootbox.alert("Update Failed!");
								});
						} catch (ex){
							ex.Message = "Invalid JSON";
							console.error(ex);
						}
					}
				}
			}
		});
	}

	OnDeleteAppointment(targetId){
		var self = this;
		if(!this.loginVm.VerifyUser){
			return;
		}

		if(!targetId){
			bootbox.alert("No ID found for this appointment. Unable to delete.");
			return;
		}
		bootbox.confirm("Are you sure you want to delete this appointment?",
			(bool)=>{
				if(bool){
					webSvc.DeleteSingleAppointment(targetId)
						.then(()=>{
							self.Load();
						})
						.fail(err =>{
							console.log(err);
						});
				}
			});
	}

	OnDeleteCoupon(targetId){
		var self = this;
		
		if(!this.loginVm.VerifyUser){
			return;
		}
		
		if(!targetId){
			bootbox.alert("No ID found for this coupon. Unable to delete.");
			return;
		}

		bootbox.confirm("Are you sure you want to delete this coupon?",
			(bool)=>{
				if(bool){
					webSvc.DeleteSingleCoupon(targetId)
						.then(()=>{
							self.Load();
						})
						.fail(err =>{
							console.log(err);
						});
				}
			});
	}

	OnCreateNewCoupon(){
		if(!this.loginVm.VerifyUser){
			return;
		}

		$('#coupon-modal').modal('show');
	}

	OnSubmitNewCoupon(){
		var self = this;
		const coupon = this.newCoupon();
		if(!coupon.startDate || coupon.code.length < 5){
			bootbox.alert("Invalid coupon");
			return;
		}

		webSvc.CreateCoupon(coupon)
			.then(()=>{
				const msg = "Coupon created successfully!";
				bootbox.alert(msg);
				console.log(msg);
				$('#coupon-modal').modal('hide');
				self.newCoupon(self._makeCouponSchema());
				self.LoadCoupons((possibleError)=>{
					if(possibleError){
						console.error(possibleError);
					}
				});
			})
			.fail(err=>{
				const msg = "Error creating coupon.";
				bootbox.alert(msg);
				console.error(err);
			});
	}

	OnSendEmail(){
		if(this.selectedUserEmails().length == 0 || !this.fromEmail() || !this.emailMessage() || !this.emailSubject()){
			bootbox.alert("Fill out all the fields!");
			return;
		}

		bootbox.confirm("Are you sure you're ready to send this message?",
			(confirm)=>{
				if(confirm){
					webSvc.SendEmail(this.selectedUserEmails(), this.fromEmail(), this.emailSubject(), this.emailMessage())
						.then(()=>{
							bootbox.alert("Email sent!");
						})
						.fail(error => {
							console.error(error);
							bootbox.alert("Failed to send email(s)");
						});
				}
			});
	}

	_couponStartDateChange(e){
		if(e && e.date){
			const momentObj = e.date;
			this.newCoupon().startDate = momentObj.toDate();	
		}
	}

	_couponEndDateChange(e){
		if(e && e.date){
			const momentObj = e.date;
			this.newCoupon().endDate = momentObj.toDate();
		}
	}

	_makeCouponSchema(){
		return {
			startDate: new Date(),
			endDate: null,
			amount: 0,
			code: '',
			onlyUseOnce: false
		}
	}
}