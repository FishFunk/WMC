class Configuration 
{
  constructor(settings){
    this.settings = settings;
  }

  get StripeKey(){
    return environment == 'production' ? 
        'pk_live_aULtlGy6YPvc94K5Hjvqwokg' : 'pk_test_luqEThs0vblV173fgAHgPZBG';
  }

  get DATE_FORMAT(){
    return this.settings.DATE_FORMAT || "MM/DD/YY";
  }

  get DEFAULT_JOB_TIME_MINS(){
    return this.settings.DEFAULT_JOB_TIME_MINS || 120;
  }

  get MAX_JOB_TIME_PER_DAY_MINS(){
    return this.settings.MAX_JOB_TIME_PER_DAY_MINS || 720;
  }

  get MAX_JOB_TIME_PER_INTERVAL(){
    return this.settings.MAX_JOB_TIME_PER_INTERVAL || 180;
  }

  get AVG_JOB_DRIVING_TIME(){
    return this.settings.AVG_JOB_DRIVING_TIME || 30;
  }

  get AVG_JOB_SETUP_TIME(){
    return this.settings.JOB_SETUP_TIME || 10;
  }

  get WASH_DETAILS(){
    return this.settings.WASH_DETAILS || { price: 22, time: 30, title: "Exterior Hand Wash"};
  }

  get TIRE_SHINE_DETAILS(){
    return this.settings.TIRE_SHINE_DETAILS || { price: 8, time: 15, title: "Tire Shine"};
  }

  get INTERIOR_DETAILS(){
    return this.settings.INTERIOR_DETAILS || { price: 40, time: 45, title: "Interior Cleaning"};
  }

  get WAX_DETAILS(){
    return this.settings.WAX_DETAILS || {price: 30, time: 40, title: "Hand Wax"};
  }

  get SERVICES() {
    const data = this.settings.SERVICES || [
      { item: Constants.WASH, sortOrder: 1, price: 22, time: 50, title: "Exterior Hand Wash", description: "We use an advanced eco-friendly hand washing technique to thoroughly remove contaminants from the wheels and surface of your vehicle!" },
      { item: Constants.TIRE_SHINE, sortOrder: 2, price: 8, time: 20, title: "Tire Shine", description: "Make your car look new again with a hand applied gel coating that protects your tires from harmful UV rays and provides a beautiful shine." },
      { item: Constants.INTERIOR, sortOrder: 3, price: 45, time: 45, title: "Interior Cleaning", description: "A clean interior means happy passengers. Add this service and we'll vacuum, spot remove stains, clean windows, and wipe down the dash, seats, door jambs, and trim!" },
      { item: Constants.WAX, sortOrder: 4, price: 32, time: 45, title: "Hand Wax", description: "With this package we'll hand apply top of the line wax to your vehicle's body which provides extra shine and protection! We recommend waxing your vehicles every 3 to 6 months." }
      //{ item: Constants.RAIN_GUARD, sortOrder: 5, price: 10, time: 15, title: "Rain Guard", description: "Tired of windshield wiper streaks? Add this service and we'll put a protective sealant on your windows that repels water and snow." }
      //{ item: Constants.HEADLIGHT_RESTORE, sortOrder: 6, price: 25, time: 20, title: "Headlight Restoration", description: "Foggy headlights? No worries. We can polish them up like new!" }
    ];

    var serviceCopy = JSON.parse(JSON.stringify(data));
    serviceCopy.forEach(s => {
      if(s.item == Constants.WASH){
        s.checked = ko.observable(true);
        s.disable = ko.observable(false);
      } else {
        s.checked = ko.observable(false);
        s.disable = ko.observable(false);
      }
    });

    return _.sortBy(serviceCopy, (s) => s.sortOrder);
  }

  get CAR_SIZES(){
    return this.settings.CAR_SIZES || [
      {
        multiplier : 1,
        size : "Compact (2-4 door)"
      },
      {
        multiplier : 1.2,
        size : "Mid-Size"
      },
      {
        multiplier : 1.4,
        size : "Large (SUV)"
      }
    ];
  }

  get ZIP_WHITE_LIST(){
    return this.settings.ZIP_WHITE_LIST || [
      "22314",
      "22301",
      "22305",
      "22302",
      "22304",
      "22202",
      "22206",
      "22311",
      "22312",
      "22204",
      "22041",
      "22211",
      "22201",
      "22203",
      "22209",
      "22044",
      "22151",
      "22150",
      "22152",
      "22153",
      "22015",
      "22205",
      "22042",
      "22046",
      "22003",
      "22207",
      "22213",
      "22031",
      "22043",
      "22027",
      "22101",
      "22182",
      "22030",
      "22032",
      "22039",
      "20124"
    ];
  }

  get SCHEDULE(){
    return this.settings.SCHEDULE || [
      {
        day : 0, // Sunday
        blockedTimeSlots : []
      },
      {
        day : 1,
        blockedTimeSlots : []
      },
      {
        day : 2,
        blockedTimeSlots : []
      },
      {
        day : 3,
        blockedTimeSlots : []
      },
      {
        day : 4,
        blockedTimeSlots : []
      },
      {
        day : 5,
        blockedTimeSlots : []
      },
      {
        day : 6,
        blockedTimeSlots : []
      }
    ];
  }

  get BLOCKED_DAYS(){
      return this.settings.BLOCKED_DAYS || [
        '08/30/17'
      ];
  }
}