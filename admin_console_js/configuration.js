class Configuration 
{
  constructor(settings){
    this.settings = settings;
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

  get WASH_DETAILS(){
    return this.settings.WASH_DETAILS || { price: 19, time: 30, title: "Hand wash"};
  }

  get TIRE_SHINE_DETAILS(){
    return this.settings.TIRE_SHINE_DETAILS || { price: 20, time: 30, title: "Tire shine"};
  }

  get INTERIOR_DETAILS(){
    return this.settings.INTERIOR_DETAILS || { price: 40, time: 50, title: "Interior cleaning"};
  }

  get WAX_DETAILS(){
    return this.settings.WAX_DETAILS || {price: 30, time: 50, title: "Hand Wax & Buff"};
  }

  get CAR_SIZES(){
    return this.settings.CAR_SIZES || [
    {
        "multiplier" : 1,
        "size" : "Compact (2-4 door)"
      },
      {
        "multiplier" : 1.2,
        "size" : "SUV (5-door)"
      },
      {
        "multiplier" : 1.4,
        "size" : "XXL"
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