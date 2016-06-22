QUnit.test( "Make User", function( assert ) {
	try
	{
		// Arrange
		var generator = new DataGenerator();

		var users = [];
		for(let i=0; i<25; i++){
			const usr = generator.MakeUser();
			users.push(usr);
		}

		console.log(JSON.stringify(users));

		// Act
		var usr = generator.MakeUser();

		// Assert
		assert.ok(usr != null);
	} catch (ex)
	{
		console.log(ex);
		assert.ok(false, "Test threw an exception.");
	}
});


QUnit.test("Time Range Picker Disabled", function( assert ) {
	try
	{
		// Arrange
		var dataGenerator = new DataGenerator();
		var storageHelper = new LocalStorageHelper(sessionStorage);

		var appts = [
			dataGenerator.MakeFutureAppointment(), 
			dataGenerator.MakeFutureAppointment(), 
			dataGenerator.MakeFutureAppointment(),
			dataGenerator.MakeFutureAppointment()
		];

		_.each(appts, (a)=>{
				a.date = new Date();
				a.timeRange = Constants.MORNING_TIME_RANGE.timeRange;
				a.timeRangeKey = Constants.MORNING_TIME_RANGE.key;
				a.timeEstimate = 60;
			});

		appts = _.groupBy(appts, (a)=> moment(a.date).format("MM/DD/YYYY"));
		storageHelper.AppointmentsByDate = appts;

		var orderFormViewModel = new OrderFormViewModel(storageHelper, null);
		
		// Act
		orderFormViewModel._onDatepickerChange({date: new Date()});

		// Assert
		assert.ok(Constants.MORNING_TIME_RANGE.disabled(), "Morning time range selection is disabled");
	} catch (ex)
	{
		console.log(ex);
		assert.ok(false, "Test threw an exception.");
	}
});