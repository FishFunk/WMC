const ORDER_SUCCESS_MSG = "Thank you! Your order has been placed. Please check your email for confirmation.",
      ORDER_FAILURE_MSG = "We're really sorry about this... Looks like there was a problem submitting your order.",
      BAD_ZIP_MSG = s.sprintf("Sorry about this but we don't service your area yet! We're still young and growing so check back soon. Feel free to <a href=%s>contact us</a> to expedite the process. <BR><BR> Sincerely, <BR> - The WMC Team", "javascript:$('.modal').modal('hide');$('#contact-nav').click();"),
      ASYNC_INTERUPTION_MARKER = "ASYNC_INTERUPTION_MARKER",
      DEFAULT_JOB_TIME_MINS = 120,
      MAX_JOB_TIME_PER_DAY_MINS = 720,
      WASH_DETAILS = {
        time: 30,
        price: 29
      },
      TIRE_SHINE_DETAILS = {
        time: 30,
        price: 25
      },
      INTERIOR_DETAILS = {
        time: 50,
        price: 75
      },
      WAX_DETAILS = {
        time: 50,
        price: 50
      },
      MORNING_TIME_RANGE = {
            range: "9:00 - 12:00 PM",
            key: 1,
            disabled: ko.observable(false)
      },
      AFTERNOON_TIME_RANGE = {
            range: "12:00 - 3:00 PM",
            key: 2,
            disabled: ko.observable(false)
      },
      EVENING_TIME_RANGE = {
            range: "3:00 - 6:00 PM",
            key: 3,
            disabled: ko.observable(false)
      },
      NIGHT_TIME_RANGE = {
            range: "6:00 - 9:00 PM",
            key: 4,
            disabled: ko.observable(false)
      },
      CAR_SIZES = [
        {
          size: "Compact (2-4 door)",
          multiplier: 1.0
        },
        {
          size: "SUV (5-door)",
          multiplier: 1.2
        },
        {
          size: "XXL",
          multiplier: 1.5
        }
      ],
      ZIP_WHITE_LIST = [
      "22314", // Alexandria
      "22301", // Del Ray
      "22305", // Arlandria
      "22302", // Rosemont
      "22304", // Landmark
      "22202", // Crystal City
      "22206", // Shirlington
      "22311", // Alexandria West
      "22312", // Lincolnia
      "22204", // South Arlington
      "22041", // Bailey's Crossroads
      "22211", // Arlington Cemetary
      "22201", // Clarendon
      "22203", // Ballston
      "22209", // Rosslyn
      "22044", // Seven Corners
      "22151", // North Springfield
      "22150", // Springfield
      "22152", // West Springfield
      "22153", // More West Springfield
      "22015", // Burke
      "22205", // Westover
      "22042", // West Falls Church
      "22046", // Falls Church
      "22003", // Annandale,
      "22207", // Woodland Acres
      "22213", // west Arlington
      "22031", // Mantua
      "22043", // Idylwood
      "22027", // Dunn Loring
      "22101", // McLean
      "22182", // Wolf Trap
      "22030", // Fairfax
      "22032", // Fairfax Memorial Park
      "22039", // Burke Lake Park
      "20124" // Clifton
      ]

class Constants {

  static get TIRE_SHINE_DETAILS() {
    return TIRE_SHINE_DETAILS;
  }

  static get INTERIOR_DETAILS() {
    return INTERIOR_DETAILS;
  }

  static get WAX_DETAILS() {
    return WAX_DETAILS;
  }

  static get WASH_DETAILS() {
    return WASH_DETAILS;
  }

  static get ZIP_WHITE_LIST(){
  	return ZIP_WHITE_LIST;
  }

  static get MORNING_TIME_RANGE(){
    return MORNING_TIME_RANGE;
  }

  static get AFTERNOON_TIME_RANGE(){
    return AFTERNOON_TIME_RANGE;
  }

  static get EVENING_TIME_RANGE(){
    return EVENING_TIME_RANGE;
  }

  static get NIGHT_TIME_RANGE(){
    return NIGHT_TIME_RANGE;
  }

  static get CAR_SIZES(){
    return CAR_SIZES;
  }

  static get ORDER_SUCCESS_MSG(){
    return ORDER_SUCCESS_MSG;
  }

  static get ORDER_FAILURE_MSG(){
    return ORDER_FAILURE_MSG;
  }

  static get BAD_ZIP_MSG(){
    return BAD_ZIP_MSG;
  }

  static get ASYNC_INTERUPTION_MARKER(){
    return ASYNC_INTERUPTION_MARKER;
  }
}