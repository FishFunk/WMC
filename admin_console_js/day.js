class Day{
	constructor(date, appts){
		this.day = moment(date).format('dddd');
		this.date = date;
		this.appts = appts;
	}
}