const ASYNC_INTERUPTION_MARKER = "ASYNC_INTERUPTION_MARKER",
      CHARGE_FAILURE_MARKER = "CARD_CHARGE_FAILURE",
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
      }

class Constants {
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
}