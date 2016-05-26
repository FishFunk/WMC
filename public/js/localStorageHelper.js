class LocalStorageHelper{
	constructor(storageType){
		if(typeof(Storage) === "undefined") {
			console.info("No local storage available.");
		} else {
			this.storageType = storageType;
		}
	}

	get ZipCode(){
		if(this.storageType && this.storageType.zip){
			return this.storageType.zip;
		} else {
			return "";
		}
	}

	set ZipCode(zip){
		if(this.storageType){
			this.storageType.zip = zip;
		}
	}

	get AppointmentsByDate(){
		if(this.storageType && this.storageType.appointments){
			return JSON.parse(this.storageType.appointments);
		} else {
			return [];
		}
	}

	set AppointmentsByDate(apptsByDate){
		if(this.storageType){
			this.storageType.appointments = JSON.stringify(apptsByDate);
		}
	}

	get LoggedInUser(){
		if(this.storageType && this.storageType.loggedInUser){
			return JSON.parse(this.storageType.loggedInUser);
		} else {
			return null;
		}
	}

	set LoggedInUser(user){
		if(this.storageType){
			this.storageType.loggedInUser = JSON.stringify(user);
		}
	}
}