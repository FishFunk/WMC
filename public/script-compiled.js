'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bootstrapper = function () {
	function Bootstrapper() {
		_classCallCheck(this, Bootstrapper);
	}

	_createClass(Bootstrapper, null, [{
		key: 'Run',
		value: function Run() {
			var deferred = $.Deferred();
			// Closes the Responsive Menu on Menu Item Click
			$('.navbar-collapse ul li a').click(function () {
				$('.navbar-toggle:visible').click();
			});

			// Highlight the top nav as scrolling occurs
			$('body').scrollspy({
				target: '.navbar-fixed-top'
			});

			function reposition() {
				var modal = $(this),
				    dialog = modal.find('.modal-dialog');
				modal.css('display', 'block');

				// Dividing by two centers the modal exactly, but dividing by three
				// or four works better for larger screens.
				dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
			}

			// Reposition when a modal is shown
			$('.modal').on('show.bs.modal', reposition);
			// Reposition when the window is resized
			$(window).on('resize', function () {
				$('.modal:visible').each(reposition);
			});

			// Load Templates
			async.series([function (callback) {
				$('#order-form-tmpl').load('./templates/order-form-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback("Application failed to initialize.");
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#vehicle-tmpl').load('./templates/vehicle-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback("Application failed to initialize.");
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#location-tmpl').load('./templates/location-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback("Application failed to initialize.");
					} else {
						callback();
					}
				});
			}, function (callback) {
				// Cache Appointment Data
				var storageHelper = new LocalStorageHelper(sessionStorage);
				var webSvc = new WebService();
				var orderFormVm = new OrderFormViewModel(storageHelper, webSvc);
				var logInVm = new LogInViewModel(storageHelper, webSvc);

				var mainVm = new MainViewModel(storageHelper, logInVm, orderFormVm);

				ko.applyBindings(mainVm);

				webSvc.GetAllAppointments().then(function (appointments) {
					var apptsByDate = _.groupBy(appointments, function (x) {
						return moment(x.date).format("MM/DD/YYYY");
					});
					storageHelper.AppointmentsByDate = apptsByDate;
					callback();
				}).fail(function (err) {
					callback(err);
				});
			}], function (possibleError) {
				if (possibleError) {
					deferred.reject(possibleError);
				} else {
					deferred.resolve();
				}
			});

			return deferred.promise();
		}
	}]);

	return Bootstrapper;
}();
"use strict";

/**
 * cbpAnimatedHeader.min.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = function () {
  var b = document.documentElement,
      g = document.querySelector(".navbar-default"),
      e = false,
      a = 300;function f() {
    window.addEventListener("scroll", function (h) {
      if (!e) {
        e = true;setTimeout(d, 250);
      }
    }, false);
  }function d() {
    var h = c();if (h >= a) {
      classie.add(g, "navbar-shrink");
    } else {
      classie.remove(g, "navbar-shrink");
    }e = false;
  }function c() {
    return window.pageYOffset || b.scrollTop;
  }f();
}();
"use strict";

/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

(function (window) {

  'use strict';

  // class helper functions from bonzo https://github.com/ded/bonzo

  function classReg(className) {
    return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
  }

  // classList support for class management
  // altho to be fair, the api sucks because it won't accept multiple classes at once
  var hasClass, addClass, removeClass;

  if ('classList' in document.documentElement) {
    hasClass = function hasClass(elem, c) {
      return elem.classList.contains(c);
    };
    addClass = function addClass(elem, c) {
      elem.classList.add(c);
    };
    removeClass = function removeClass(elem, c) {
      elem.classList.remove(c);
    };
  } else {
    hasClass = function hasClass(elem, c) {
      return classReg(c).test(elem.className);
    };
    addClass = function addClass(elem, c) {
      if (!hasClass(elem, c)) {
        elem.className = elem.className + ' ' + c;
      }
    };
    removeClass = function removeClass(elem, c) {
      elem.className = elem.className.replace(classReg(c), ' ');
    };
  }

  function toggleClass(elem, c) {
    var fn = hasClass(elem, c) ? removeClass : addClass;
    fn(elem, c);
  }

  var classie = {
    // full names
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    // short names
    has: hasClass,
    add: addClass,
    remove: removeClass,
    toggle: toggleClass
  };

  // transport
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(classie);
  } else {
    // browser global
    window.classie = classie;
  }
})(window);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ORDER_SUCCESS_MSG = "Thank you! Your order has been placed. Please check your email for confirmation.",
    ORDER_FAILURE_MSG = "We're really sorry about this... Looks like there was a problem submitting your order. Please contact us for support.",
    BAD_ZIP_MSG = s.sprintf("Sorry about this but we don't service your area yet! We're still young and growing so check back soon. Feel free to <a href=%s>contact us</a> to expedite the process. <BR><BR> Sincerely, <BR> - The WMC Team", "javascript:$('.modal').modal('hide');$('#contact-nav').click();"),
    ASYNC_INTERUPTION_MARKER = "ASYNC_INTERUPTION_MARKER",
    DEFAULT_JOB_TIME_MINS = 120,
    MAX_JOB_TIME_PER_DAY_MINS = 720,
    MAX_JOB_TIME_PER_INTERVAL = 180,
    WASH_DETAILS = {
  title: "Hand wash",
  time: 30,
  price: 29
},
    TIRE_SHINE_DETAILS = {
  title: "Tire shine",
  time: 30,
  price: 25
},
    INTERIOR_DETAILS = {
  title: "Interior cleaning",
  time: 50,
  price: 75
},
    WAX_DETAILS = {
  title: "Hand wax & buff",
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
    CAR_SIZES = [{
  size: "Compact (2-4 door)",
  multiplier: 1.0
}, {
  size: "SUV (5-door)",
  multiplier: 1.2
}, {
  size: "XXL",
  multiplier: 1.5
}],
    ZIP_WHITE_LIST = ["22314", // Alexandria
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
];

var Constants = function () {
  function Constants() {
    _classCallCheck(this, Constants);
  }

  _createClass(Constants, null, [{
    key: "TIRE_SHINE_DETAILS",
    get: function get() {
      return TIRE_SHINE_DETAILS;
    }
  }, {
    key: "INTERIOR_DETAILS",
    get: function get() {
      return INTERIOR_DETAILS;
    }
  }, {
    key: "WAX_DETAILS",
    get: function get() {
      return WAX_DETAILS;
    }
  }, {
    key: "WASH_DETAILS",
    get: function get() {
      return WASH_DETAILS;
    }
  }, {
    key: "ZIP_WHITE_LIST",
    get: function get() {
      return ZIP_WHITE_LIST;
    }
  }, {
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
  }, {
    key: "CAR_SIZES",
    get: function get() {
      return CAR_SIZES;
    }
  }, {
    key: "ORDER_SUCCESS_MSG",
    get: function get() {
      return ORDER_SUCCESS_MSG;
    }
  }, {
    key: "ORDER_FAILURE_MSG",
    get: function get() {
      return ORDER_FAILURE_MSG;
    }
  }, {
    key: "BAD_ZIP_MSG",
    get: function get() {
      return BAD_ZIP_MSG;
    }
  }, {
    key: "ASYNC_INTERUPTION_MARKER",
    get: function get() {
      return ASYNC_INTERUPTION_MARKER;
    }
  }, {
    key: "MAX_JOB_TIME_PER_INTERVAL",
    get: function get() {
      return MAX_JOB_TIME_PER_INTERVAL;
    }
  }]);

  return Constants;
}();
"use strict";

window.jQuery(document).ready(function ($) {

	function showFailureMsg() {
		var msg = "This is embarrassing... something went wrong and our app will not work correctly.\
		Please make sure you have a good internet connection and refresh the page.";
		if (bootbox) {
			bootbox.alert(msg);
		} else {
			alert(msg);
		}
	}

	try {
		// Initialize Application
		Bootstrapper.Run().then(function () {
			var timer = setTimeout(function () {
				$('#splash').fadeOut(1000);
				clearTimeout(timer);
			}, 2000);
		}).fail(function (err) {
			console.error(err);
			showFailureMsg();
		});
	} catch (ex) {
		showFailureMsg();
	}
});
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalStorageHelper = function () {
	function LocalStorageHelper(storageType) {
		_classCallCheck(this, LocalStorageHelper);

		if (typeof Storage === "undefined") {
			console.info("No local storage available.");
		} else {
			this.storageType = storageType;
		}
	}

	_createClass(LocalStorageHelper, [{
		key: "ZipCode",
		get: function get() {
			if (this.storageType && this.storageType.zip) {
				return this.storageType.zip;
			} else {
				return "";
			}
		},
		set: function set(zip) {
			if (this.storageType) {
				this.storageType.zip = zip;
			}
		}
	}, {
		key: "AppointmentsByDate",
		get: function get() {
			if (this.storageType && this.storageType.appointments) {
				return JSON.parse(this.storageType.appointments);
			} else {
				return [];
			}
		},
		set: function set(apptsByDate) {
			if (this.storageType) {
				this.storageType.appointments = JSON.stringify(apptsByDate);
			}
		}
	}, {
		key: "LoggedInUser",
		get: function get() {
			if (this.storageType && this.storageType.loggedInUser) {
				return JSON.parse(this.storageType.loggedInUser);
			} else {
				return null;
			}
		},
		set: function set(user) {
			if (this.storageType) {
				this.storageType.loggedInUser = JSON.stringify(user);
			}
		}
	}]);

	return LocalStorageHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
	function Utils() {
		_classCallCheck(this, Utils);
	}

	_createClass(Utils, null, [{
		key: 'GetListOfDisabledDates',
		value: function GetListOfDisabledDates(apptsByDate) {
			if (!apptsByDate) {
				return [];
			}

			var datesToDisable = [];

			for (var key in apptsByDate) {
				if (apptsByDate.hasOwnProperty(key)) {
					var time = 0;
					var appts = apptsByDate[key];
					_.each(appts, function (a) {
						if (a.timeEstimate) {
							time += a.timeEstimate;
						} else {
							// default time estimate in minutes
							time += Contsants.DEFAULT_JOB_TIME_MINS;
						}
					});
					if (time > Constants.MAX_JOB_TIME_PER_DAY_MINS) {
						datesToDisable.push(_.first(appts).date);
					}
				}
			}

			return datesToDisable;
		}
	}, {
		key: 'VerifyZip',
		value: function VerifyZip(zip) {
			return _.contains(Constants.ZIP_WHITE_LIST, zip.trim());
		}
	}, {
		key: 'IsStrEqual',
		value: function IsStrEqual(str1, str2) {
			var left = str1.trim().toUpperCase();
			var right = str2.trim().toUpperCase();
			return left === right;
		}
	}, {
		key: 'GenerateUUID',
		value: function GenerateUUID() {
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
			});
			return uuid;
		}
	}]);

	return Utils;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogInViewModel = function () {
	function LogInViewModel(storageHelper, webSvc) {
		_classCallCheck(this, LogInViewModel);

		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");
		this.$loginForm = $("#login-form");
		this.$createAcctForm = $("#create-acct-form");
		this.$forgotPwdForm = $("#forgot-pwd-form");

		this.ShowLogin = ko.observable(true);
		this.ShowCreateAcct = ko.observable(false);
		this.ShowForgotPwd = ko.observable(false);

		this.email = ko.observable();
		this.pwd = ko.observable();

		this.firstName = ko.observable("");
		this.lastName = ko.observable("");
		this.phone = ko.observable("");
		this.verifyPwd = ko.observable("");
		this.verifyEmail = ko.observableArray("");

		this._initValidation();
	}

	_createClass(LogInViewModel, [{
		key: "OnContinueAsGuest",
		value: function OnContinueAsGuest() {
			this._resetForms();
			this._toggleModals();
		}
	}, {
		key: "OnShowCreateAcct",
		value: function OnShowCreateAcct() {
			this._resetForms();
			this.ShowForgotPwd(false);
			this.ShowLogin(false);
			this.ShowCreateAcct(true);
		}
	}, {
		key: "OnCancelCreateAcct",
		value: function OnCancelCreateAcct() {
			this._resetForms();
			this.ShowForgotPwd(false);
			this.ShowCreateAcct(false);
			this.ShowLogin(true);
		}
	}, {
		key: "OnCreateAcct",
		value: function OnCreateAcct() {
			var self = this;
			if (this.$createAcctForm.valid()) {
				async.series([this._checkIfEmailExists.bind(this), this._createNewUser.bind(this)], function (possibleError) {
					if (possibleError === Constants.ASYNC_INTERUPTION_MARKER) {
						bootbox.alert("That email is already in use! Did you forget your password?");
					} else if (possibleError) {
						bootbox.alert("There was a problem creating your account.");
					} else {
						self._toggleModals();
					}
				});
			}
		}
	}, {
		key: "OnLogIn",
		value: function OnLogIn() {
			var self = this;
			if (this.$loginForm.valid()) {
				this.webSvc.GetUserByEmailAndPwd(this.email(), this.pwd()).then(function (user) {
					if (user) {
						self.storageHelper.LoggedInUser = user;
						self._resetForms();
						self._toggleModals();
					} else {
						bootbox.alert("Hmmm, we didn't find an account matching those credentials. \
							Please verify your info and try again or click the 'Forgot Password' link.");
						self._resetForms();
						self.$loginForm.valid();
					}
				}).fail(function (err) {
					self._resetForms();
					bootbox.alert("Uh oh... something went wrong!");
				});
			}
		}
	}, {
		key: "OnShowForgotPwd",
		value: function OnShowForgotPwd() {
			this._resetForms();
			this.ShowLogin(false);
			this.ShowCreateAcct(false);
			this.ShowForgotPwd(true);
		}
	}, {
		key: "OnCancelForgotPwd",
		value: function OnCancelForgotPwd() {
			this._resetForms();
			this.ShowCreateAcct(false);
			this.ShowForgotPwd(false);
			this.ShowLogin(true);
		}
	}, {
		key: "OnSubmitForgotPwd",
		value: function OnSubmitForgotPwd() {
			if (this.$forgotPwdForm.valid()) {
				var self = this;
				this.webSvc.ForgotPassword(this.email()).then(function () {
					bootbox.alert("Nice! Check your email ;)");
					self._resetForms();
					self.OnCancelForgotPwd();
				}).fail(function (err) {
					bootbox.alert("Uh oh, there was a problem...");
					console.log(err);
					self._resetForms();
				});
			}
		}
	}, {
		key: "_checkIfEmailExists",
		value: function _checkIfEmailExists(callback) {
			this.webSvc.GetUserByEmail(this.email()).then(function (usr) {
				if (usr) {
					callback(Constants.ASYNC_INTERUPTION_MARKER);
				} else {
					callback();
				}
			}).fail(function (err) {
				callback(err);
			});
		}
	}, {
		key: "_createNewUser",
		value: function _createNewUser(callback) {
			var self = this;
			var newUser = {
				email: this.email(),
				pwd: this.pwd()
			};
			this.webSvc.CreateUser(newUser).then(function (newUser) {
				self.storageHelper.LoggedInUser = newUser;
				callback();
			}).fail(function (err) {
				callback(err);
			});
		}
	}, {
		key: "_resetForms",
		value: function _resetForms() {
			this.$loginForm.find("input").val("");
			this.$loginForm.validate().resetForm();
			this.$createAcctForm.find("input").val("");
			this.$createAcctForm.validate().resetForm();
			this.$forgotPwdForm.find("input").val("");
			this.$forgotPwdForm.validate().resetForm();
		}
	}, {
		key: "_toggleModals",
		value: function _toggleModals() {
			this.$loginModal.removeClass('fade');
			this.$loginModal.modal('hide');
			this.$orderFormModal.modal('show');
		}
	}, {
		key: "_initValidation",
		value: function _initValidation() {
			var self = this;
			$.validator.addMethod("pwdLength", function (value) {
				return value && value.length >= 8;
			});
			$.validator.addMethod("pwdEqual", function () {
				return self.pwd() === self.verifyPwd();
			}, "Passwords do not match!");
			$.validator.addMethod("emailEqual", function () {
				return Utils.IsStrEqual(self.email(), self.verifyEmail());
			}, "Emails do not match!");

			this.$createAcctForm.validate({
				rules: {
					email: {
						required: true,
						email: true
					},
					verifyEmail: {
						required: true,
						emailEqual: true
					},
					pwd: {
						required: true,
						pwdLength: true
					},
					verifyPwd: {
						required: true,
						pwdEqual: true
					}
				},
				messages: {
					email: "Please enter a valid email address.",
					pwd: "Password must be at least 8 characters."
				}
			});

			this.$loginForm.validate({
				rules: {
					email: {
						required: true,
						email: true
					},
					pwd: "required"
				},
				messages: {
					email: "Please enter a valid email address.",
					pwd: "Password required."
				}
			});

			this.$forgotPwdForm.validate({
				rules: {
					email: {
						required: true,
						email: true
					},
					verifyEmail: {
						required: true,
						emailEqual: true
					}
				},
				messages: {
					email: "Please enter a valid email address."
				}
			});
		}
	}]);

	return LogInViewModel;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Main ViewModel Class

var MainViewModel = function () {
	function MainViewModel(storageHelper, logInVm, orderFormVm) {
		_classCallCheck(this, MainViewModel);

		this.WASH_COST = Constants.WASH_DETAILS.price;
		this.TireShinePriceHtml = "<sup>$</sup>" + Constants.TIRE_SHINE_DETAILS.price;
		this.InteriorPriceHtml = "<sup>$</sup>" + Constants.INTERIOR_DETAILS.price;
		this.WaxPriceHtml = "<sup>$</sup>" + Constants.WAX_DETAILS.price;

		this.LogInViewModel = logInVm;
		this.OrderFormViewModel = orderFormVm;

		this.storageHelper = storageHelper;

		this.$loginModal = $("#login-modal");
		this.$orderFormModal = $("#order-form-modal");

		this.zip = ko.observable("");

		if (this.storageHelper.ZipCode) {
			this.zipVerified = ko.observable(true);
		} else {
			this.zipVerified = ko.observable(false);
		}
	}

	_createClass(MainViewModel, [{
		key: "OnPageScroll",
		value: function OnPageScroll(data, event) {
			var $anchor = $(event.currentTarget);
			$('html, body').stop().animate({
				scrollTop: $($anchor.attr('href')).offset().top
			}, 1500, 'easeInOutExpo');
			event.preventDefault();
		}
	}, {
		key: "OnShowOrderForm",
		value: function OnShowOrderForm() {
			if (this.storageHelper.LoggedInUser) {
				this.$orderFormModal.modal();
			} else {
				this.$loginModal.modal();
			}
		}
	}, {
		key: "OnShowContactModal",
		value: function OnShowContactModal() {
			$('#contact-modal').modal();
		}
	}, {
		key: "OnVerifyZip",
		value: function OnVerifyZip() {
			if (Utils.VerifyZip(this.zip())) {
				this.zipVerified(true);
				this.storageHelper.ZipCode = this.zip();
			} else {
				bootbox.alert(Constants.BAD_ZIP_MSG);
			}
		}
	}]);

	return MainViewModel;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OrderFormViewModel = function () {
	function OrderFormViewModel(storageHelper, webSvc) {
		_classCallCheck(this, OrderFormViewModel);

		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
			key: 'pk_test_luqEThs0vblV173fgAHgPZBG',
			image: '/img/wmc_logo.jpg',
			locale: 'auto',
			token: this._completeOrder.bind(this)
		});

		// Close Checkout on page navigation:
		$(window).on('popstate', function () {
			self.stripeHandler.close();
		});

		this.webSvc = webSvc;
		this.$orderFormModal = $('#order-form-modal');

		this.$orderFormModal.on('show.bs.modal', function () {
			self._prePopulateUserData();
		});

		this.storageHelper = storageHelper;

		var usr = storageHelper.LoggedInUser;

		this.TIRE_SHINE_COST = Constants.TIRE_SHINE_DETAILS.price;
		this.INTERIOR_COST = Constants.INTERIOR_DETAILS.price;
		this.WAX_COST = Constants.WAX_DETAILS.price;
		this.WASH_COST = Constants.WASH_DETAILS.price;

		/**** Observables ****/
		this.disableEmailInput = ko.observable(false);

		// Order Details
		this.addShine = ko.observable(false);
		this.addWax = ko.observable(false);
		this.addInterior = ko.observable(false);
		this.showBillingAddress = ko.observable(false);

		this.description = ko.observable("");

		this.timeRangeOptions = [Constants.MORNING_TIME_RANGE, Constants.AFTERNOON_TIME_RANGE, Constants.EVENING_TIME_RANGE, Constants.NIGHT_TIME_RANGE];
		this.selectedTimeRange = ko.observable(this.timeRangeOptions[0]);

		this.date = ko.observable(moment().format("MM/DD/YY"));

		// Car Info
		this.showAddVehicleForm = ko.observable(false);
		this.cars = ko.observableArray([]);
		this.make = ko.observable("");
		this.model = ko.observable("");
		this.color = ko.observable("");
		this.tag = ko.observable("");
		this.carSizes = Constants.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);
		this.carYears = [];
		var year = new Date().getFullYear() + 1;
		for (var i = 0; i < 25; i++) {
			this.carYears.push((year - i).toString());
		}
		this.carYear = ko.observable(this.carYears[1]);

		// Contact Info
		this.first = ko.observable("");
		this.last = ko.observable("");
		this.email = ko.observable("");
		this.phone = ko.observable("");

		// Location Info
		this.showAddLocationForm = ko.observable(false);
		this.locations = ko.observableArray([]);
		this.locationTitleOptions = ["Home", "Work", "Other"];
		this.title = ko.observable(this.locationTitleOptions[0]);
		this.street = ko.observable("");
		this.city = ko.observable("");
		this.state = ko.observable("");
		this.zip = ko.observable(this.storageHelper.ZipCode);

		this.orderTotal = ko.computed(function () {
			var total = 0;
			var serviceCost = parseFloat(self.WASH_COST + (self.addShine() ? self.TIRE_SHINE_COST : 0) + (self.addWax() ? self.WAX_COST : 0) + (self.addInterior() ? self.INTERIOR_COST : 0));

			self.cars().forEach(function (car) {
				if (car.selected()) {
					var carSize = _.find(Constants.CAR_SIZES, function (obj) {
						return obj.size == car.size || obj.multiplier == car.multiplier;
					});
					if (carSize) {
						total += serviceCost * carSize.multiplier;
					}
				}
			});

			if (total < 10) {
				return total.toPrecision(3);
			}

			return total >= 100 ? total.toPrecision(5) : total.toPrecision(4);
		});

		this.orderSummary = ko.computed(function () {
			var summary = "";
			self.cars().forEach(function (car) {
				if (car.selected()) {
					var carSize = _.find(Constants.CAR_SIZES, function (obj) {
						return obj.size == car.size || obj.multiplier == car.multiplier;
					});
					summary += $.validator.format("<strong>{5} {6}</strong><br>" + "Exterior Hand Wash<br>{0}{1}{2}{3} = {4}x cost multiplier.<br>", self.addShine() ? "Deep Tire Clean & Shine<br>" : "", self.addWax() ? "Hand Wax & Buff<br>" : "", self.addInterior() ? "Full Interior Cleaning<br>" : "", carSize.size, carSize.multiplier.toString(), car.make, car.model);
				}
			});

			return summary;
		});
	}

	_createClass(OrderFormViewModel, [{
		key: 'OnAfterRender',
		value: function OnAfterRender(elements, self) {
			self.$addVehicleForm = $('#add-vehicle-form');
			self.$addLocationForm = $('#add-location-form');
			self.$orderDetailsForm = $('#order-details-form');
			$('#phone').mask('(999) 999-9999? ext:99999', { placeholder: " " });
			$('#datetimepicker').datetimepicker({
				minDate: new Date(),
				format: 'MM/DD/YY'
			}).on('dp.change', self._onDatepickerChange.bind(self));
			self._initValidation();
		}
	}, {
		key: 'OnAddNewLocation',
		value: function OnAddNewLocation() {
			this.showAddLocationForm(true);
		}
	}, {
		key: 'OnCancelNewLocation',
		value: function OnCancelNewLocation() {
			this.$addVehicleForm.find("input").val("");
			this.$addLocationForm.validate().resetForm();
			this.showAddLocationForm(false);
		}
	}, {
		key: 'OnSaveNewLocation',
		value: function OnSaveNewLocation() {
			if (this.$addLocationForm.valid()) {
				var loc = this._makeLocationSchema();
				_.each(this.locations(), function (l) {
					return l.selected(false);
				});
				loc.selected(true);
				this.locations.push(loc);
				this.$addLocationForm.find("input").val("");
				this.showAddLocationForm(false);
			}
		}
	}, {
		key: 'OnAddNewVehicle',
		value: function OnAddNewVehicle() {
			this.showAddVehicleForm(true);
		}
	}, {
		key: 'OnCancelNewVehicle',
		value: function OnCancelNewVehicle() {
			this.$addVehicleForm.find("input").val("");
			this.$addVehicleForm.validate().resetForm();
			this.showAddVehicleForm(false);
		}
	}, {
		key: 'OnSaveNewVehicle',
		value: function OnSaveNewVehicle() {
			if (this.$addVehicleForm.valid()) {
				var newCar = this._makeCarSchema();
				newCar.selected(true);
				this.cars.push(newCar);
				this.$addVehicleForm.find("input").val("");
				this.showAddVehicleForm(false);
			}
		}
	}, {
		key: 'OnClickVehiclePanel',
		value: function OnClickVehiclePanel(self, vehicleData) {
			vehicleData.selected(!vehicleData.selected());
		}
	}, {
		key: 'OnDeleteVehiclePanel',
		value: function OnDeleteVehiclePanel(self, vehicleData) {
			self.cars(_.reject(self.cars(), function (car) {
				return _.isEqual(car, vehicleData);
			}));
		}
	}, {
		key: 'OnClickLocationPanel',
		value: function OnClickLocationPanel(self, locationData) {
			_.each(self.locations(), function (loc) {
				loc.selected(false);
			});
			locationData.selected(true);
		}
	}, {
		key: 'OnDeleteLocationPanel',
		value: function OnDeleteLocationPanel(self, locationData) {
			self.locations(_.reject(self.locations(), function (loc) {
				return _.isEqual(loc, locationData);
			}));
		}
	}, {
		key: 'OnSubmit',
		value: function OnSubmit() {
			var self = this;

			var selectedCars = _.filter(this.cars(), function (car) {
				return car.selected();
			});
			if (selectedCars.length === 0) {
				bootbox.alert("Please add and select at least one vehicle.");
				return;
			}

			var selectedLocation = _.find(this.locations(), function (loc) {
				return loc.selected();
			});
			if (!selectedLocation) {
				bootbox.alert("Please add and select a location.");
				return;
			}

			if (!Utils.VerifyZip(selectedLocation.zip)) {
				bootbox.alert(Constants.BAD_ZIP_MSG);
				return;
			}

			if (this.$orderDetailsForm.valid()) {
				this._openCheckout();
			}
		}
	}, {
		key: 'OnFormCancel',
		value: function OnFormCancel() {
			try {
				this.$orderFormModal.modal('hide');
				window.location = "#page-top";

				// Manually clear observables
				this.addShine(false);
				this.addWax(false);
				this.addInterior(false);
				this.showBillingAddress(false);
				this.description("");
				this.showAddVehicleForm(false);
				this.showAddLocationForm(false);
				$('#datetimepicker').data("DateTimePicker").date(new Date());
				this.selectedCarSize(this.carSizes[0]);
				this.selectedTimeRange(this.timeRangeOptions[0]);
				this.carYear(this.carYears[1]);

				// Reste Forms
				this.$orderDetailsForm.validate().resetForm();
			} catch (ex) {
				console.log("Failed to reset fields OnFormCancel()");
				console.log(ex);
			}
		}
	}, {
		key: '_openCheckout',
		value: function _openCheckout() {
			this.stripeHandler.open({
				key: "pk_test_luqEThs0vblV173fgAHgPZBG",
				name: 'WMC',
				description: '2 widgets',
				amount: this.orderTotal() * 100,
				zipCode: true,
				email: this.email()
			});
		}
	}, {
		key: '_completeOrder',
		value: function _completeOrder(token) {
			try {
				var self = this;
				async.series([
				// TODO: Is this the best order?
				this._verifyUser.bind(this), this._executeCharge.bind(this, token), this._updateUserData.bind(this), this._sendEmailConfirmation.bind(this)], function (possibleError) {
					if (possibleError) {
						self._onOrderFailure(possibleError);
					} else {
						self._onOrderSuccess();
					}
				});
			} catch (ex) {
				this._onOrderFailure(ex);
			}
		}
	}, {
		key: '_onOrderFailure',
		value: function _onOrderFailure(error) {
			bootbox.alert(Constants.ORDER_FAILURE_MSG);
			console.log(error);
		}
	}, {
		key: '_onOrderSuccess',
		value: function _onOrderSuccess() {
			bootbox.alert(Constants.ORDER_SUCCESS_MSG);
			this.OnFormCancel();
		}
	}, {
		key: '_sendEmailConfirmation',
		value: function _sendEmailConfirmation(callback) {
			this.webSvc.SendConfirmationEmail(this.storageHelper.LoggedInUser.email, this.storageHelper.LoggedInUser.appointments).then(function () {
				return callback();
			}).fail(function (err) {
				return callback(err);
			});
		}
	}, {
		key: '_verifyUser',
		value: function _verifyUser(callback) {
			var self = this;
			if (this.storageHelper.LoggedInUser) {
				callback();
			} else {
				this.webSvc.GetUserByEmail(this.email()).then(function (usr) {
					if (usr) {
						self.storageHelper.LoggedInUser = usr;
						callback();
					} else {
						// create new temp user
						var tmpUser = self._makeTempUserSchema();
						self.storageHelper.LoggedInUser = usr;
						self.webSvc.CreateUser(tmpUser).then(function () {
							return callback();
						}).fail(function (err) {
							return callback(err);
						});
					}
				}).fail(function (err) {
					return callback(err);
				});
			}
		}
	}, {
		key: '_executeCharge',
		value: function _executeCharge(token, callback) {
			this.webSvc.ExecuteCharge(token, this.orderTotal() * 100, this.last()).then(function () {
				return callback();
			}).fail(function (err) {
				return callback(err);
			});
		}
	}, {
		key: '_updateUserData',
		value: function _updateUserData(callback) {
			var currentUsr = this.storageHelper.LoggedInUser;
			var newAppt = this._makeAppointmentSchema();

			if (currentUsr.appointments) {
				currentUsr.appointments.push(newAppt);
			} else {
				currentUsr.appointments = [newAppt];
			}

			currentUsr.cars = this.cars();
			currentUsr.phone = this.phone();
			currentUsr.locations = this.locations();
			currentUsr.firstName = this.first();
			currentUsr.lastName = this.last();

			this.webSvc.UpdateUser(currentUsr).then(function () {
				return callback();
			}).fail(function (err) {
				return callback(err);
			});
		}
	}, {
		key: '_prePopulateUserData',
		value: function _prePopulateUserData() {
			var usr = this.storageHelper.LoggedInUser;
			if (usr) {
				var locations = usr.locations || [];
				var cars = usr.cars || [];
				_.each(locations, function (loc) {
					return loc.selected = ko.observable(false);
				});
				_.each(cars, function (car) {
					return car.selected = ko.observable(false);
				});

				this.locations(locations);
				this.cars(cars);
				this.email(usr.email || "");
				this.phone(usr.phone || "");
				this.first(usr.firstName || "");
				this.last(usr.lastName || "");

				if (usr.email) {
					this.disableEmailInput(true);
				}

				$('#phone').trigger('input');
			}
		}
	}, {
		key: '_onDatepickerChange',
		value: function _onDatepickerChange(event) {
			var date = moment(event.date).format("MM/DD/YYYY");
			this.date(date);
			var appointments = this.storageHelper.AppointmentsByDate[date];
			if (appointments) {
				var maxMinutesPerInterval = Constants.MAX_JOB_TIME_PER_INTERVAL;
				var morningAppts = _.filter(appointments, function (appt) {
					return appt.timeRangeKey === Constants.MORNING_TIME_RANGE.key;
				});
				var afternoonAppts = _.filter(appointments, function (appt) {
					return appt.timeRangeKey === Constants.AFTERNOON_TIME_RANGE.key;
				});
				var eveningAppts = _.filter(appointments, function (appt) {
					return appt.timeRangeKey === Constants.EVENING_TIME_RANGE.key;
				});
				var nightAppts = _.filter(appointments, function (appt) {
					return appt.timeRangeKey === Constants.NIGHT_TIME_RANGE.key;
				});

				Constants.MORNING_TIME_RANGE.disabled(_.reduce(morningAppts, function (total, appt) {
					return total + appt.timeEstimate;
				}, 0) > maxMinutesPerInterval);
				Constants.AFTERNOON_TIME_RANGE.disabled(_.reduce(afternoonAppts, function (total, appt) {
					return total + appt.timeEstimate;
				}, 0) > maxMinutesPerInterval);
				Constants.EVENING_TIME_RANGE.disabled(_.reduce(eveningAppts, function (total, appt) {
					return total + appt.timeEstimate;
				}, 0) > maxMinutesPerInterval);
				Constants.NIGHT_TIME_RANGE.disabled(_.reduce(nightAppts, function (total, appt) {
					return total + appt.timeEstimate;
				}, 0) > maxMinutesPerInterval);
			}
		}
	}, {
		key: '_initValidation',
		value: function _initValidation() {
			this.$orderDetailsForm.validate({
				rules: {
					first: "required",
					last: "required",
					email: {
						required: true,
						email: true
					},
					phone: "required"
				},
				messages: {
					email: "Please enter a valid email address."
				}
			});
			this.$addVehicleForm.validate({
				rules: {
					make: "required",
					model: "required",
					color: "required"
				}
			});
			this.$addLocationForm.validate({
				rules: {
					street: "required",
					city: "required",
					state: "required",
					zip: "required"
				}
			});
		}
	}, {
		key: '_makeTempUserSchema',
		value: function _makeTempUserSchema() {
			return {
				appointments: [this._makeAppointmentSchema()],
				cars: this.cars(),
				email: this.email(),
				phone: this.phone(),
				firstName: this.first(),
				lastName: this.last(),
				pwd: Utils.GenerateUUID(),
				locations: this.locations()
			};
		}
	}, {
		key: '_makeCarSchema',
		value: function _makeCarSchema() {
			return {
				color: this.color(),
				make: this.make(),
				model: this.model(),
				size: this.selectedCarSize().size,
				tag: this.tag(),
				year: parseInt(this.carYear()),
				selected: ko.observable(false)
			};
		}
	}, {
		key: '_makeAppointmentSchema',
		value: function _makeAppointmentSchema() {
			return {
				cars: [this._makeCarSchema()],
				date: new Date(this.date()),
				location: this._makeLocationSchema(),
				price: this.orderTotal(),
				services: this._buildServicesArray(),
				timeEstimate: this._getTimeEstimate(),
				timeRange: this.selectedTimeRange().range,
				timeRangeEnum: this.selectedTimeRange().key,
				description: this.description()
			};
		}
	}, {
		key: '_makeLocationSchema',
		value: function _makeLocationSchema() {
			return {
				city: this.city(),
				state: this.state(),
				street: this.street(),
				title: this.title(),
				zip: this.zip(),
				selected: ko.observable(false)
			};
		}
	}, {
		key: '_getTimeEstimate',
		value: function _getTimeEstimate() {
			var totalTime = Constants.WASH_DETAILS.time;
			if (this.addShine()) {
				totalTime += Constants.TIRE_SHINE_DETAILS.time;
			}
			if (this.addWax()) {
				totalTime += Constants.WAX_DETAILS.time;
			}
			if (this.addInterior()) {
				totalTime += Constants.INTERIOR_DETAILS.time;
			}
			return totalTime;
		}
	}, {
		key: '_buildServicesArray',
		value: function _buildServicesArray() {
			var services = [Constants.WASH_DETAILS.title];
			if (this.addShine()) {
				services.push(Constants.TIRE_SHINE_DETAILS.title);
			}
			if (this.addWax()) {
				services.push(Constants.WAX_DETAILS.title);
			}
			if (this.addInterior()) {
				services.push(Constants.INTERIOR_DETAILS.title);
			}
			return services;
		}
	}]);

	return OrderFormViewModel;
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
			return this._executeAjaxCall('GET', "/api/getFutureApptDatesAndTimes");
		}
	}, {
		key: 'CreateUser',
		value: function CreateUser(user) {
			return this._executeAjaxCall('POST', "/api/createNewUser", user);
		}
	}, {
		key: 'GetUserByEmail',
		value: function GetUserByEmail(email) {
			return this._executeAjaxCall('POST', "/api/getUserByEmail", { email: email });
		}
	}, {
		key: 'GetUserByEmailAndPwd',
		value: function GetUserByEmailAndPwd(email, pwd) {
			return this._executeAjaxCall('POST', "/api/getUserByEmailAndPwd", { email: email, pwd: pwd });
		}
	}, {
		key: 'SendConfirmationEmail',
		value: function SendConfirmationEmail(email, appts) {
			return this._executeAjaxCall('POST', "/api/sendConfirmationEmail", { email: email, appointments: appts });
		}
	}, {
		key: 'UpdateUser',
		value: function UpdateUser(user) {
			return this._executeAjaxCall('PUT', "/api/updateUser", user);
		}
	}, {
		key: 'ForgotPassword',
		value: function ForgotPassword(email) {
			return this._executeAjaxCall('POST', "/api/forgotPassword", { email: email });
		}
	}, {
		key: 'ExecuteCharge',
		value: function ExecuteCharge(stripeToken, price, lastName) {
			return this._executeAjaxCall('POST', "/api/executeCharge", {
				stripeToken: stripeToken.id,
				price: price,
				lastName: lastName,
				email: stripeToken.email
			});
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
