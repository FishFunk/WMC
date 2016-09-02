class Utils{
	static GetListOfDisabledDates(apptsByDate){
		if(!apptsByDate){
			return [];
		}

		var datesToDisable = [];

		for (var key in apptsByDate){
			if(apptsByDate.hasOwnProperty(key)){
				var time = 0;
				var appts = apptsByDate[key];
				_.each(appts, (a)=>{
					if(a.timeEstimate){
						time+=a.timeEstimate;
					} else {
						// default time estimate in minutes
						time+=Configuration.DEFAULT_JOB_TIME_MINS;
					}
				});
				if(time > Configuration.MAX_JOB_TIME_PER_DAY_MINS){
					datesToDisable.push(_.first(appts).date);
				}
			}
		}

		return datesToDisable;
	};

	static VerifyZip(zip){
		return _.contains(Configuration.ZIP_WHITE_LIST, zip.trim());
	}

	static IsStrEqual(str1, str2){
		var left = str1.trim().toUpperCase();
		var right = str2.trim().toUpperCase();
		return left === right;
	}

	static GenerateUUID(){
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};

	static IsHoliday(momentObj){
	    const _holidays = {
		    'M': {//Month, Day
		            '01/01': "New Year's Day",
		            '07/04': "Independence Day",
		            '11/11': "Veteran's Day",
		            '11/28': "Thanksgiving Day",
		            '11/29': "Day after Thanksgiving",
		            '12/24': "Christmas Eve",
		            '12/25': "Christmas Day",
		            '12/31': "New Year's Eve"
		    },
	        'W': {//Month, Week of Month, Day of Week
	            '1/3/1': "Martin Luther King Jr. Day",
	            '2/3/1': "Washington's Birthday",
	            '5/5/1': "Memorial Day",
	            '9/1/1': "Labor Day",
	            '10/2/1': "Columbus Day",
	            '11/4/4': "Thanksgiving Day"
	        }
	    };

	    const dateObj = momentObj.toDate();

        const diff = 1+ (0 | (dateObj.getDate() - 1) / 7),
            memorial = (dateObj.getDay() === 1 && (dateObj.getDate() + 7) > 30) ? "5" : null;

        return (_holidays['M'][momentObj.format('MM/DD')] || _holidays['W'][momentObj.format('M/'+ (memorial || diff) +'/d')]);
	}
}