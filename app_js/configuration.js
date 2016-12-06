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
}