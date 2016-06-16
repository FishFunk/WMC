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
		bootbox.confirm("Are you sure you want to delete expired appointments??", 
			(bool)=>{
				if(bool){
					spinner.Show();
					webSvc.DeleteExpiredAppointments()
	        			.fail(err=>console.log(err))
	        			.always(()=>spinner.Hide());
				}
			});
	}
}