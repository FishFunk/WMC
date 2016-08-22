"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdminConsoleVm = function () {
	function AdminConsoleVm() {
		_classCallCheck(this, AdminConsoleVm);

		this.loginVm = new LoginViewModel(this);
		this.days = ko.observableArray();
	}

	_createClass(AdminConsoleVm, [{
		key: "Load",
		value: function Load() {
			if (!this.loginVm.VerifyUser) {
				return;
			}

			var self = this;
			self.days([]);
			spinner.Show();
			webSvc.GetAllAppointments().then(function (appts) {
				var dict = {};
				_.each(appts, function (a) {
					a.date = moment(a.date).format("MM/DD/YYYY");
					dict[a.date] ? dict[a.date].push(a) : dict[a.date] = [a];
				});

				for (var key in dict) {
					if (dict.hasOwnProperty(key)) {
						self.days.push(new Day(key, dict[key]));
					}
				}

				self.days(_.sortBy(self.days(), function (day) {
					return day.date;
				}));

				console.log(self.days());
			}).fail(function (err) {
				return console.log(err);
			}).always(function () {
				return spinner.Hide();
			});
		}
	}, {
		key: "DeleteOld",
		value: function DeleteOld() {
			if (!this.loginVm.VerifyUser) {
				return;
			}

			var self = this;
			bootbox.confirm("Are you sure you want to delete expired appointments?", function (bool) {
				if (bool) {
					spinner.Show();
					webSvc.DeleteExpiredAppointments().then(function () {
						return self.Load();
					}).fail(function (err) {
						return console.error(err);
					}).always(function () {
						return spinner.Hide();
					});
				}
			});
		}
	}, {
		key: "OnEditAppointment",
		value: function OnEditAppointment(appointment) {
			var self = this;
			var html = '<textarea id="edit-appointment-json" style="min-width:500px;min-height:400px;">' + JSON.stringify(appointment, null, 4) + '</textarea>';
			if (!appointment._id) {
				bootbox.alert("Unable to update - no ID");
				return;
			}
			bootbox.dialog({
				title: "Edit Appointment",
				message: html,
				buttons: {
					cancel: {
						label: 'CANCEL',
						className: 'btn-default',
						callback: function callback() {}
					},
					submit: {
						label: 'DONE',
						className: 'btn-primary',
						callback: function callback() {
							try {
								var newJson = $('#edit-appointment-json').val();
								var data = JSON.parse(newJson);
								webSvc.UpdateAppointment(data).then(function () {
									bootbox.alert("Update Successful!");
									self.Load();
								}).fail(function (err) {
									console.error(err);
									bootbox.alert("Update Failed!");
								});
							} catch (ex) {
								ex.Message = "Invalid JSON";
								console.error(ex);
							}
						}
					}
				}
			});
		}
	}, {
		key: "OnDeleteAppointment",
		value: function OnDeleteAppointment(targetId) {
			var self = this;
			if (!targetId) {
				bootbox.alert("No ID found for this appointment. Unable to delete.");
				return;
			}
			bootbox.confirm("Are you sure you want to delete this appointment?", function (bool) {
				if (bool) {
					webSvc.DeleteSingleAppointment(targetId).then(function () {
						self.Load();
					}).fail(function (err) {
						console.log(err);
					});
				}
			});
		}
	}, {
		key: "LoginViewModel",
		get: function get() {
			return this.loginVm;
		}
	}]);

	return AdminConsoleVm;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Configuration = function () {
  function Configuration(settings) {
    _classCallCheck(this, Configuration);

    this.settings = settings;
  }

  _createClass(Configuration, [{
    key: "DATE_FORMAT",
    get: function get() {
      return this.settings.DATE_FORMAT || "MM/DD/YY";
    }
  }, {
    key: "DEFAULT_JOB_TIME_MINS",
    get: function get() {
      return this.settings.DEFAULT_JOB_TIME_MINS || 120;
    }
  }, {
    key: "MAX_JOB_TIME_PER_DAY_MINS",
    get: function get() {
      return this.settings.MAX_JOB_TIME_PER_DAY_MINS || 720;
    }
  }, {
    key: "MAX_JOB_TIME_PER_INTERVAL",
    get: function get() {
      return this.settings.MAX_JOB_TIME_PER_INTERVAL || 180;
    }
  }, {
    key: "WASH_DETAILS",
    get: function get() {
      return this.settings.WASH_DETAILS || { price: 19, time: 30, title: "Hand wash" };
    }
  }, {
    key: "TIRE_SHINE_DETAILS",
    get: function get() {
      return this.settings.TIRE_SHINE_DETAILS || { price: 20, time: 30, title: "Tire shine" };
    }
  }, {
    key: "INTERIOR_DETAILS",
    get: function get() {
      return this.settings.INTERIOR_DETAILS || { price: 40, time: 50, title: "Interior cleaning" };
    }
  }, {
    key: "WAX_DETAILS",
    get: function get() {
      return this.settings.WAX_DETAILS || { price: 30, time: 50, title: "Hand Wax & Buff" };
    }
  }, {
    key: "CAR_SIZES",
    get: function get() {
      return this.settings.CAR_SIZES || [{
        "multiplier": 1,
        "size": "Compact (2-4 door)"
      }, {
        "multiplier": 1.2,
        "size": "SUV (5-door)"
      }, {
        "multiplier": 1.4,
        "size": "XXL"
      }];
    }
  }, {
    key: "ZIP_WHITE_LIST",
    get: function get() {
      return this.settings.ZIP_WHITE_LIST || ["22314", "22301", "22305", "22302", "22304", "22202", "22206", "22311", "22312", "22204", "22041", "22211", "22201", "22203", "22209", "22044", "22151", "22150", "22152", "22153", "22015", "22205", "22042", "22046", "22003", "22207", "22213", "22031", "22043", "22027", "22101", "22182", "22030", "22032", "22039", "20124"];
    }
  }]);

  return Configuration;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ASYNC_INTERUPTION_MARKER = "ASYNC_INTERUPTION_MARKER",
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
};

var Constants = function () {
      function Constants() {
            _classCallCheck(this, Constants);
      }

      _createClass(Constants, null, [{
            key: "MORNING_TIME_RANGE",
            get: function get() {
                  return MORNING_TIME_RANGE;
            }
      }, {
            key: "AFTERNOON_TIME_RANGE",
            get: function get() {
                  return AFTERNOON_TIME_RANGE;
            }
      }, {
            key: "EVENING_TIME_RANGE",
            get: function get() {
                  return EVENING_TIME_RANGE;
            }
      }, {
            key: "NIGHT_TIME_RANGE",
            get: function get() {
                  return NIGHT_TIME_RANGE;
            }
      }]);

      return Constants;
}();
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Day = function Day(date, appts) {
	_classCallCheck(this, Day);

	this.day = moment(date).format('dddd');
	this.date = date;
	this.appts = appts;
};
"use strict";

var spinner = null;
var webSvc = null;
var Configuration;

window.jQuery(document).ready(function ($) {
	spinner = new LoadingSpinner();
	webSvc = new WebService();

	webSvc.GetSystemSettings().then(function (settings) {
		Configuration = new Configuration(settings);
		var vm = new AdminConsoleVm();
		ko.applyBindings(vm);
		vm.Load();
	}).fail(function (err) {
		return console.log(error);
	});
});
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoginViewModel = function () {
	function LoginViewModel(consoleVm) {
		_classCallCheck(this, LoginViewModel);

		this.consoleVm = consoleVm;
		this.$modal = $("#login-modal");
		this.usr = ko.observable("");
		this.pwd = ko.observable("");
		this.success = false;
	}

	_createClass(LoginViewModel, [{
		key: "OnVerify",
		value: function OnVerify() {
			var self = this;
			spinner.Show();
			webSvc.VerifyAdmin(this.usr(), this.pwd()).then(function (admin) {
				if (admin) {
					self.success = true;
					self.$modal.modal('hide');
					self.consoleVm.Load();
				} else {
					bootbox.alert("Invalid Credentials. User and password are case sensitive.");
				}
			}).fail(function (err) {
				return console.log(err);
			}).always(function () {
				return spinner.Hide();
			});
		}
	}, {
		key: "VerifyUser",
		get: function get() {
			if (!this.success) {
				this.$modal.modal();
			}
			return this.success;
		}
	}]);

	return LoginViewModel;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoadingSpinner = function () {
    function LoadingSpinner() {
        _classCallCheck(this, LoadingSpinner);

        var width = 12;
        var length = 12;
        var innerRadius = 30;
        var totalRadius = width + length + innerRadius;

        this.spinner = null;

        this.options = {
            lines: 13 // The number of lines to draw
            , length: length // The length of each line
            , width: width // The line thickness
            , radius: innerRadius // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: "#0076A3" // #rgb or #rrggbb or array of colors
            , opacity: 0.35 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 0.8 // Rounds per second
            , trail: 45 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: "spinner" // The CSS class to assign to the spinner
            // Library computes an inline style for top/left where it adds the radius of the spinner to the numeric portion of the following top/left properties and assigns those value as the css top/left attributes.
            // E.g. top: "50" with radius of 72 becomes top: 122px
            , top: '-' + totalRadius.toString(),
            left: '-' + totalRadius.toString(),
            shadow: true // Whether to render a shadow
            , hwaccel: true // Whether to use hardware acceleration
            , position: "relative" // Element positioning
        };

        this.spinnerOverlay = $("#page-load-spinner");
        this.spinnerContainer = document.getElementById("spinner-container");
    }

    _createClass(LoadingSpinner, [{
        key: "Show",
        value: function Show() {
            if ($(this.spinnerOverlay).is(":visible")) {
                return;
            }

            this.spinnerOverlay.show();

            if (!this.spinner) {
                this.spinner = new Spinner(this.options).spin(this.spinnerContainer);
            } else {
                this.spinner.spin(this.spinnerContainer);
            }
        }
    }, {
        key: "Hide",
        value: function Hide() {
            this.spinnerOverlay.hide();

            if (!this.spinner) {
                return;
            }

            this.spinner.stop();
        }
    }]);

    return LoadingSpinner;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebService = function () {
	function WebService() {
		_classCallCheck(this, WebService);

		this.baseUrl = document.location.origin;
		this.deferred = null;
	}

	_createClass(WebService, [{
		key: 'GetAllAppointments',
		value: function GetAllAppointments() {
			return this._executeAjaxCall('GET', "/api/getAllAppointments");
		}
	}, {
		key: 'VerifyAdmin',
		value: function VerifyAdmin(usr, pwd) {
			return this._executeAjaxCall('POST', "/api/verifyAdmin", { usr: usr, pwd: pwd });
		}
	}, {
		key: 'DeleteExpiredAppointments',
		value: function DeleteExpiredAppointments(user) {
			return this._executeAjaxCall('DELETE', "/api/deleteExpiredAppointments");
		}
	}, {
		key: 'DeleteSingleAppointment',
		value: function DeleteSingleAppointment(id) {
			return this._executeAjaxCall('DELETE', "/api/deleteSingleAppointment?id=" + id);
		}
	}, {
		key: 'UpdateAppointment',
		value: function UpdateAppointment(appt) {
			return this._executeAjaxCall('POST', "/api/updateAppointment", { appt: appt });
		}
	}, {
		key: 'GetSystemSettings',
		value: function GetSystemSettings() {
			return this._executeAjaxCall('GET', "/api/getSystemSettings");
		}

		// 'data' is an optional param

	}, {
		key: '_executeAjaxCall',
		value: function _executeAjaxCall(type, ext, data) {
			this.deferred = $.Deferred();
			$.ajax({
				url: this.baseUrl + ext,
				type: type,
				contentType: "application/json; charset=UTF-8",
				dataType: 'json',
				error: this._onError.bind(this),
				success: this._onSuccess.bind(this),
				timeout: 10000,
				data: JSON.stringify(data)
			});
			return this.deferred.promise();
		}
	}, {
		key: '_onSuccess',
		value: function _onSuccess(res, textStatus, jqXHR) {
			console.info(res, textStatus, jqXHR);
			if (this.deferred) {
				var result = res ? res.data : null;
				this.deferred.resolve(result);
			}
		}
	}, {
		key: '_onError',
		value: function _onError(jqXHR, textStatus, err) {
			console.error(jqXHR, textStatus, err);
			if (this.deferred) {
				this.deferred.reject(err);
			}
		}
	}]);

	return WebService;
}();
