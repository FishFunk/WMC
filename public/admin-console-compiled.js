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
			bootbox.confirm("Are you sure you want to delete expired appointments??", function (bool) {
				if (bool) {
					spinner.Show();
					webSvc.DeleteExpiredAppointments().fail(function (err) {
						return console.log(err);
					}).always(function () {
						return spinner.Hide();
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

window.jQuery(document).ready(function ($) {
   spinner = new LoadingSpinner();
   webSvc = new WebService();
   var vm = new AdminConsoleVm();

   ko.applyBindings(vm);
   vm.Load();
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
