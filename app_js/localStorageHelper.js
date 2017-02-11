class LocalStorageHelper{
	constructor(storageType){
		try {
			storageType.test = "test";
			this.storageType = storageType;
		} catch (ex) {
			console.info("No local storage available. Using memory...");
			this.storageType = {};
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

	get IsNewUser(){
		if(this.storageType && this.storageType.isNewUser){
			return JSON.parse(this.storageType.isNewUser);
		} else {
			return false;
		}
	}

	set IsNewUser(bool){
		if(this.storageType){
			this.storageType.isNewUser = JSON.stringify(bool);
		}
	}
}