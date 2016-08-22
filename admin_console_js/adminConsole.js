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
		spinner.Show();
		webSvc.GetAllAppointments()
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
	        .fail(err=>console.log(err))
	        .always(()=>spinner.Hide());
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
							const data = JSON.parse(newJson);
							webSvc.UpdateAppointment(data)
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
}