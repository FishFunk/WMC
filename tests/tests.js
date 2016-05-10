QUnit.test( "Make User", function( assert ) {
	try{
		var generator = new DataGenerator();
		var usr = generator.MakeUser();
		assert.ok(usr != null);
	} catch (ex)
	{
		console.log(ex);
		assert.ok(false, "Test threw an exception.");
	}
});