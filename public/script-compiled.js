'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// global variables
var spinner = null;
var environment = "debug";
var dialogPresenter = null;
var Configuration = {};

var Bootstrapper = function () {
	function Bootstrapper() {
		_classCallCheck(this, Bootstrapper);
	}

	_createClass(Bootstrapper, null, [{
		key: 'Run',
		value: function Run() {
			var deferred = $.Deferred();
			var webSvc = null;
			spinner = new LoadingSpinner();
			dialogPresenter = new DialogPresenter();

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
			var failureMsg = "Application failed to initialize.";
			async.series([function (callback) {
				$('#order-form-tmpl').load('./templates/order-form-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#gift-form-tmpl').load('./templates/gift-form-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#contact-modal-tmpl').load('./templates/contact-modal-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#login-modal-tmpl').load('./templates/login-modal-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#vehicle-tmpl').load('./templates/vehicle-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				$('#location-tmpl').load('./templates/location-tmpl.html', function (res, status, jqHXR) {
					if (status === "error") {
						callback(failureMsg);
					} else {
						callback();
					}
				});
			}, function (callback) {
				webSvc = new WebService();
				webSvc.GetEnvironment().then(function (env) {
					environment = env;
					callback();
				}).fail(function (err) {
					return callback(err);
				});
			}, function (callback) {
				webSvc.GetSystemSettings().then(function (settings) {
					Configuration = new Configuration(settings);
					callback();
				}).fail(function (err) {
					return callback(err);
				});
			}, function (callback) {
				var storageHelper = new LocalStorageHelper(sessionStorage);
				var orderFormVm = new OrderFormViewModel(storageHelper, webSvc);
				var giftFormVm = new GiftFormViewModel(storageHelper, webSvc);
				var logInVm = new LogInViewModel(storageHelper, webSvc);
				var mainVm = new MainViewModel(storageHelper, logInVm, orderFormVm, giftFormVm);

				ko.applyBindings(mainVm);

				// Cache Appointment Data
				webSvc.GetFutureAppointments().then(function (appointments) {
					var apptsByDate = _.groupBy(appointments, function (x) {
						return moment(x.date).format(Configuration.DATE_FORMAT);
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
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Configuration = function () {
  function Configuration(settings) {
    _classCallCheck(this, Configuration);

    this.settings = settings;
  }

  _createClass(Configuration, [{
    key: 'StripeKey',
    get: function get() {
      return environment == 'production' ? 'pk_live_aULtlGy6YPvc94K5Hjvqwokg' : 'pk_test_luqEThs0vblV173fgAHgPZBG';
    }
  }, {
    key: 'DATE_FORMAT',
    get: function get() {
      return this.settings.DATE_FORMAT || "MM/DD/YY";
    }
  }, {
    key: 'DEFAULT_JOB_TIME_MINS',
    get: function get() {
      return this.settings.DEFAULT_JOB_TIME_MINS || 120;
    }
  }, {
    key: 'MAX_JOB_TIME_PER_DAY_MINS',
    get: function get() {
      return this.settings.MAX_JOB_TIME_PER_DAY_MINS || 720;
    }
  }, {
    key: 'MAX_JOB_TIME_PER_INTERVAL',
    get: function get() {
      return this.settings.MAX_JOB_TIME_PER_INTERVAL || 180;
    }
  }, {
    key: 'AVG_JOB_DRIVING_TIME',
    get: function get() {
      return this.settings.AVG_JOB_DRIVING_TIME || 30;
    }
  }, {
    key: 'AVG_JOB_SETUP_TIME',
    get: function get() {
      return this.settings.JOB_SETUP_TIME || 10;
    }
  }, {
    key: 'SERVICES',
    get: function get() {
      var data = this.settings.SERVICES || [{ item: Constants.WASH, sortOrder: 1, price: 22, time: 50, title: "Exterior Hand Wash", description: "We use an advanced eco-friendly hand washing technique to thoroughly remove contaminants from the wheels and surface of your vehicle!" }, { item: Constants.TIRE_SHINE, sortOrder: 2, price: 8, time: 20, title: "Tire Shine", description: "Make your car look new again with a hand applied gel coating that protects your tires from harmful UV rays and provides a beautiful shine." }, { item: Constants.INTERIOR, sortOrder: 3, price: 45, time: 45, title: "Interior Cleaning", description: "A clean interior means happy passengers. Add this service and we'll vacuum, spot remove stains, clean windows, and wipe down the dash, seats, door jambs, and trim!" }, { item: Constants.WAX, sortOrder: 4, price: 32, time: 45, title: "Hand Wax", description: "With this package we'll hand apply top of the line wax to your vehicle's body which provides extra shine and protection! We recommend waxing your vehicles every 3 to 6 months." }, { item: Constants.SHAMPOO, sortOrder: 6, price: 50, time: 60, title: "Carpet Shampoo", description: "Freshen your car's carpets with a deep clean and shampoo." }, { item: Constants.CONDITIONER, sortOrder: 7, price: 50, time: 60, title: "Shampoo/Condition Seats", description: "This service adds either a shampoo washing of fabric seats or a thorough conditioning of leather seats." }, { item: Constants.HEADLIGHT_RESTORE, sortOrder: 5, price: 25, time: 30, title: "Headlight Restore", description: "Foggy headlights? Tack on this service and we'll polish them up like new!" }];

      var serviceCopy = JSON.parse(JSON.stringify(data));
      serviceCopy.forEach(function (s) {
        if (s.item == Constants.WASH || s.item == Constants.INTERIOR) {
          s.checked = ko.observable(true);
          s.disable = ko.observable(false);
        } else {
          s.checked = ko.observable(false);
          s.disable = ko.observable(false);
        }
      });

      return _.sortBy(serviceCopy, function (s) {
        return s.sortOrder;
      });
    }
  }, {
    key: 'CAR_SIZES',
    get: function get() {
      return this.settings.CAR_SIZES || [{
        multiplier: 1,
        size: "Compact (2-4 door)"
      }, {
        multiplier: 1.2,
        size: "Mid-Size"
      }, {
        multiplier: 1.4,
        size: "Large (SUV)"
      }];
    }
  }, {
    key: 'ZIP_WHITE_LIST',
    get: function get() {
      return this.settings.ZIP_WHITE_LIST || ["22314", "22301", "22305", "22302", "22304", "22202", "22206", "22311", "22312", "22204", "22041", "22211", "22201", "22203", "22209", "22044", "22151", "22150", "22152", "22153", "22015", "22205", "22042", "22046", "22003", "22207", "22213", "22031", "22043", "22027", "22101", "22182", "22030", "22032", "22039", "20124"];
    }
  }, {
    key: 'SCHEDULE',
    get: function get() {
      return this.settings.SCHEDULE || [{
        day: 0, // Sunday
        blockedTimeSlots: []
      }, {
        day: 1,
        blockedTimeSlots: []
      }, {
        day: 2,
        blockedTimeSlots: []
      }, {
        day: 3,
        blockedTimeSlots: []
      }, {
        day: 4,
        blockedTimeSlots: []
      }, {
        day: 5,
        blockedTimeSlots: []
      }, {
        day: 6,
        blockedTimeSlots: []
      }];
    }
  }, {
    key: 'BLOCKED_DAYS',
    get: function get() {
      return this.settings.BLOCKED_DAYS || [];
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
  range: "9:00 AM - 12:00 PM",
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
    TIME_RANGE_PLACE_HOLDER = {
  range: "",
  disabled: ko.observable(true)
},
    WASH = 1,
    TIRE_SHINE = 2,
    INTERIOR = 3,
    WAX = 4,
    SHAMPOO = 5,
    CONDITIONER = 6,
    HEADLIGHT_RESTORE = 7;

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
  }, {
    key: "ASYNC_INTERUPTION_MARKER",
    get: function get() {
      return ASYNC_INTERUPTION_MARKER;
    }
  }, {
    key: "CHARGE_FAILURE_MARKER",
    get: function get() {
      return CHARGE_FAILURE_MARKER;
    }
  }, {
    key: "TIME_RANGE_PLACE_HOLDER",
    get: function get() {
      return TIME_RANGE_PLACE_HOLDER;
    }
  }, {
    key: "WASH",
    get: function get() {
      return WASH;
    }
  }, {
    key: "TIRE_SHINE",
    get: function get() {
      return TIRE_SHINE;
    }
  }, {
    key: "INTERIOR",
    get: function get() {
      return INTERIOR;
    }
  }, {
    key: "WAX",
    get: function get() {
      return WAX;
    }
  }, {
    key: "CONDITIONER",
    get: function get() {
      return CONDITIONER;
    }
  }, {
    key: "SHAMPOO",
    get: function get() {
      return SHAMPOO;
    }
  }, {
    key: "HEADLIGHT_RESTORE",
    get: function get() {
      return HEADLIGHT_RESTORE;
    }
  }]);

  return Constants;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DialogPresenter = function () {
	function DialogPresenter() {
		_classCallCheck(this, DialogPresenter);

		this.title = ko.observable("");
		this.body = ko.observable("");
		this.$modal = $('#generic-modal');
	}

	_createClass(DialogPresenter, [{
		key: "ShowOrderFailure",
		value: function ShowOrderFailure() {
			this.title("Oh no :(");
			this.body("We're really sorry about this... Looks like there was a problem submitting your order. Please contact us for support.");
			this.$modal.modal('show');
		}
	}, {
		key: "ShowOrderSuccess",
		value: function ShowOrderSuccess() {
			this.title("Thank you!");
			this.body("Your order has been placed. Please check your email for confirmation.");
			this.$modal.modal('show');
		}
	}, {
		key: "ShowBadZip",
		value: function ShowBadZip() {
			this.title("Darn! We don't service that area yet.");
			this.body(s.sprintf('We\'re still young and growing so check back soon. Feel free to \
              <a href=%s>contact us</a> so we know where to target next.', "javascript:$('.modal').removeClass('fade');$('.modal').modal('hide');$('#contact-modal').modal('show');$('.modal').addClass('fade');"));
			this.$modal.modal('show');
		}
	}]);

	return DialogPresenter;
}();
'use strict';

window.jQuery(document).ready(function ($) {
	try {
		// Initialize Application
		Bootstrapper.Run().fail(function (err) {
			console.error(err);
			$('#splash').removeAttr('hidden').append('<div><h3>Website is under maintenance. We apologize for the inconvenience</h3></div>');
		});
	} catch (ex) {
		console.error(ex);
	}
});
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalStorageHelper = function () {
	function LocalStorageHelper(storageType) {
		_classCallCheck(this, LocalStorageHelper);

		try {
			storageType.test = "test";
			this.storageType = storageType;
		} catch (ex) {
			console.info("No local storage available. Using memory...");
			this.storageType = {};
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
	}, {
		key: "IsNewUser",
		get: function get() {
			if (this.storageType && this.storageType.isNewUser) {
				return JSON.parse(this.storageType.isNewUser);
			} else {
				return false;
			}
		},
		set: function set(bool) {
			if (this.storageType) {
				this.storageType.isNewUser = JSON.stringify(bool);
			}
		}
	}]);

	return LocalStorageHelper;
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
							time += Configuration.DEFAULT_JOB_TIME_MINS;
						}
					});
					if (time > Configuration.MAX_JOB_TIME_PER_DAY_MINS) {
						datesToDisable.push(_.first(appts).date);
					}
				}
			}

			return datesToDisable;
		}
	}, {
		key: 'VerifyZip',
		value: function VerifyZip(zip) {
			return _.contains(Configuration.ZIP_WHITE_LIST, zip.trim());
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
	}, {
		key: 'IsHoliday',
		value: function IsHoliday(momentObj) {
			var _holidays = {
				'M': { //Month, Day
					'01/01': "New Year's Day",
					'07/04': "Independence Day",
					'11/11': "Veteran's Day",
					'12/24': "Christmas Eve",
					'12/25': "Christmas Day",
					'12/31': "New Year's Eve"
				},
				'W': { //Month, Week of Month, Day of Week
					'1/3/1': "Martin Luther King Jr. Day",
					'2/3/1': "Washington's Birthday",
					'5/5/1': "Memorial Day",
					'9/1/1': "Labor Day",
					'10/2/1': "Columbus Day",
					'11/4/4': "Thanksgiving Day"
				}
			};

			var dateObj = momentObj.toDate();

			var diff = 1 + (0 | (dateObj.getDate() - 1) / 7),
			    memorial = dateObj.getDay() === 1 && dateObj.getDate() + 7 > 30 ? "5" : null;

			return _holidays['M'][momentObj.format('MM/DD')] || _holidays['W'][momentObj.format('M/' + (memorial || diff) + '/d')];
		}
	}]);

	return Utils;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GiftFormViewModel = function () {
	function GiftFormViewModel(storageHelper, webSvc) {
		var _this = this;

		_classCallCheck(this, GiftFormViewModel);

		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
			key: Configuration.StripeKey,
			image: '/img/square_logo.png',
			locale: 'auto',
			token: this._completeOrder.bind(this)
		});

		// Close Checkout on page navigation:
		$(window).on('popstate', function () {
			self.stripeHandler.close();
		});

		this.storageHelper = storageHelper;
		this.webSvc = webSvc;

		this.$giftFormModal = $('#gift-form-modal');

		this.incompleteGiftMsg = ko.observable("");

		// Order Details
		this.Services = ko.observableArray(Configuration.SERVICES);
		this.addWash = ko.computed(function () {
			return _.find(_this.Services(), function (s) {
				return s.item == Constants.WASH;
			}).checked();
		});
		this.addInterior = ko.computed(function () {
			return _.find(_this.Services(), function (s) {
				return s.item == Constants.INTERIOR;
			}).checked();
		});

		this.addWash.subscribe(function (bool) {
			_this.Services().forEach(function (s) {
				if (s.item == Constants.TIRE_SHINE || s.item == Constants.WAX) {
					s.disable(!bool);
				}
			});
		});

		this.addInterior.subscribe(function (bool) {
			_this.Services().forEach(function (s) {
				if (s.item == Constants.SHAMPOO || s.item == Constants.CONDITIONER || s.item == Constants.HEADLIGHT_RESTORE) {
					s.disable(!bool);
				}
			});
		});

		this.Rows = _.partition(this.Services(), function (s) {
			return s.sortOrder <= Math.ceil(_this.Services().length / 2);
		});

		// Car Info
		this.carSizes = Configuration.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);

		// Contact Info
		this.email = ko.observable("");

		// Location Info
		this.zip = ko.observable(this.storageHelper.ZipCode);

		this.orderTotal = ko.computed(function () {
			var total = 0.00;
			var serviceCost = _.reduce(_this.Services(), function (memo, s) {
				if (s.checked() && !s.disable()) {
					memo += s.price;
				}
				return memo;
			}, 0);

			total += self.selectedCarSize().multiplier * serviceCost;

			return total.toFixed(2);
		});

		this.orderSummary = ko.computed(function () {
			var summary = "";

			summary += self._buildServicesSummary() + "<hr>";

			summary += $.validator.format("<strong>{0}</strong>{1}<br>", self.selectedCarSize().size, self.selectedCarSize().multiplier > 1 ? " - additional " + Math.round((self.selectedCarSize().multiplier - 1) * 100).toString() + "%" : "");

			return summary;
		});
	}

	_createClass(GiftFormViewModel, [{
		key: 'OnAfterRender',
		value: function OnAfterRender(elements, self) {
			self.$giftForm = $('#gift-form');
			self._initValidation();
		}
	}, {
		key: 'OnSubmit',
		value: function OnSubmit() {
			var self = this;

			if (!this.addWash() && !this.addInterior()) {
				this.incompleteGiftMsg('Interior and/or exterior cleaning must be selected.');
				$('#incomplete-gift-alert').show();
				return;
			}

			if (!this.$giftForm.valid()) {
				this.incompleteGiftMsg('Please fill in required details.');
				$('#incomplete-gift-alert').show();
				return;
			}

			if (!Utils.VerifyZip(this.zip())) {
				this.incompleteGiftMsg("Sorry but we currently don't service within that zip code.");
				$('#incomplete-gift-alert').show();
				return;
			}

			$('#incomplete-gift-alert').hide();

			this._openCheckout();
		}
	}, {
		key: 'OnFormCancel',
		value: function OnFormCancel() {
			try {
				$('#incomplete-gift-alert').hide();
				this.$giftFormModal.modal('hide');
				this.$giftForm.validate().resetForm();

				this._resetObservables();

				window.location = "#page-top";
			} catch (ex) {
				console.log("Failed to reset fields OnFormCancel()");
				console.log(ex);
			}
		}
	}, {
		key: '_openCheckout',
		value: function _openCheckout() {
			var total = parseInt(this.orderTotal() * 100);
			this.stripeHandler.open({
				key: Configuration.StripeKey,
				name: 'WMC Checkout',
				amount: total,
				zipCode: true,
				email: this.email()
			});
		}
	}, {
		key: '_completeOrder',
		value: function _completeOrder(token) {
			try {
				var self = this;
				spinner.Show();
				async.waterfall([this._executeCharge.bind(this, token), this._sendGiftConfirmation.bind(this)], function (possibleError) {
					if (possibleError === Constants.CHARGE_FAILURE_MARKER) {
						self.incompleteGiftMsg('That card information didn\'t work.');
						$('#incomplete-gift-alert').show();
					} else if (possibleError) {
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
			this.$giftFormModal.modal('hide');
			setTimeout(function () {
				spinner.Hide();
				dialogPresenter.ShowOrderFailure();
				console.log(error);
			}, 200);
		}
	}, {
		key: '_onOrderSuccess',
		value: function _onOrderSuccess() {
			this.OnFormCancel();
			setTimeout(function () {
				spinner.Hide();
				dialogPresenter.ShowOrderSuccess();
			}, 200);
		}
	}, {
		key: '_sendGiftConfirmation',
		value: function _sendGiftConfirmation(callback) {
			this.webSvc.SendGiftEmail(this.email(), this.orderTotal()).then(function () {
				return callback();
			}).fail(function (err) {
				return callback(err);
			});
		}
	}, {
		key: '_executeCharge',
		value: function _executeCharge(token, callback) {
			var total = parseInt(this.orderTotal() * 100);
			this.webSvc.ExecuteCharge(token, total).then(function () {
				return callback();
			}).fail(function (err) {
				console.log(err);
				callback(Constants.CHARGE_FAILURE_MARKER);
			});
		}
	}, {
		key: '_resetObservables',
		value: function _resetObservables() {
			this.incompleteGiftMsg("");

			// Order Details
			this.Services().forEach(function (s) {
				return s.checked(false);
			});

			// Car Info
			this.selectedCarSize(this.carSizes[0]);

			// Contact Info
			this.email("");

			// Location Info
			this.zip("");
		}
	}, {
		key: '_initValidation',
		value: function _initValidation() {
			this.$giftForm.validate({
				rules: {
					zip: "required",
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					email: "Please enter a valid email address."
				}
			});
		}
	}, {
		key: '_buildServicesSummary',
		value: function _buildServicesSummary() {
			var summary = "";

			this.Services().forEach(function (s) {
				if (s.checked() && !s.disable()) {
					summary += s.title + "<br>";
				}
			});

			return summary;
		}
	}]);

	return GiftFormViewModel;
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
		this.$loginFormAlert = $("#login-form-alert");
		this.$loginFormInfo = $("#login-form-info");

		this.ShowLogin = ko.observable(true);
		this.ShowCreateAcct = ko.observable(false);
		this.ShowForgotPwd = ko.observable(false);

		this.loginFormMsg = ko.observable("");

		this.email = ko.observable();
		this.pwd = ko.observable();

		this.firstName = ko.observable("");
		this.lastName = ko.observable("");
		this.phone = ko.observable("");
		this.verifyPwd = ko.observable("");
		this.verifyEmail = ko.observable("");

		this._initValidation();
	}

	_createClass(LogInViewModel, [{
		key: "OnDismissMsg",
		value: function OnDismissMsg() {
			this.$loginFormAlert.hide();
			this.$loginFormInfo.hide();
		}
	}, {
		key: "OnContinueAsGuest",
		value: function OnContinueAsGuest() {
			this.storageHelper.LoggedInUser = null;
			this.storageHelper.IsNewUser = false;
			this.OnDismissMsg();
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
			this.OnDismissMsg();
		}
	}, {
		key: "OnCancelCreateAcct",
		value: function OnCancelCreateAcct() {
			this._resetForms();
			this.ShowForgotPwd(false);
			this.ShowCreateAcct(false);
			this.ShowLogin(true);
			this.OnDismissMsg();
		}
	}, {
		key: "OnCreateAcct",
		value: function OnCreateAcct() {
			var self = this;
			if (this.$createAcctForm.valid()) {
				spinner.Show();
				async.series([this._checkIfUserExists.bind(this), this._createNewUser.bind(this)], function (possibleError) {
					spinner.Hide();
					if (possibleError === Constants.ASYNC_INTERUPTION_MARKER) {
						self.loginFormMsg("That email is already in use! Did you forget your password?");
						self.$loginFormAlert.show();
					} else if (possibleError) {
						self.loginFormMsg("There was a problem creating your account.");
						self.$loginFormAlert.show();
					} else {
						self.storageHelper.IsNewUser = true;
						self.OnCancelCreateAcct();
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
				spinner.Show();
				this.webSvc.GetUserByEmailAndPwd(this.email(), this.pwd()).then(function (usr) {
					if (usr) {
						self.storageHelper.LoggedInUser = usr;
						self.storageHelper.IsNewUser = false;
						self._resetForms();
						self._toggleModals();
					} else {
						self.loginFormMsg("Hmmm, we didn't find an account matching those credentials. \
							Please verify your info and try again or click 'Forgot Password'.");
						self.$loginFormAlert.show();
						self._resetForms();
					}
				}).fail(function (err) {
					self._resetForms();
					self.loginFormMsg("Uh oh... something went wrong.");
					self.$loginFormAlert.show();
				}).always(function () {
					return spinner.Hide();
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
			this.OnDismissMsg();
		}
	}, {
		key: "OnCancelForgotPwd",
		value: function OnCancelForgotPwd() {
			this._resetForms();
			this.ShowCreateAcct(false);
			this.ShowForgotPwd(false);
			this.ShowLogin(true);
			this.OnDismissMsg();
		}
	}, {
		key: "OnSubmitForgotPwd",
		value: function OnSubmitForgotPwd() {
			if (this.$forgotPwdForm.valid()) {
				var self = this;
				spinner.Show();
				this.webSvc.ForgotPassword(this.email()).then(function () {
					self.loginFormMsg("Nice! Check your email ;)");
					self.$loginFormInfo.show();
					self._resetForms();
					self.ShowCreateAcct(false);
					self.ShowForgotPwd(false);
					self.ShowLogin(true);
				}).fail(function (err) {
					self.loginFormMsg("Uh oh... something went wrong.");
					self.$loginFormAlert.show();
					console.log(err);
					self._resetForms();
				}).always(function () {
					return spinner.Hide();
				});
			}
		}
	}, {
		key: "_checkIfUserExists",
		value: function _checkIfUserExists(callback) {
			this.webSvc.GetUserByEmail(this.email()).then(function (usr) {
				if (usr && !usr.isGuest) {
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
				pwd: this.pwd(),
				isGuest: false
			};
			this.webSvc.CreateUser(newUser).then(function (usr) {
				self.storageHelper.LoggedInUser = usr;
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
			this.$loginModal.addClass('fade');
			this.$orderFormModal.modal('show');
		}
	}, {
		key: "_initValidation",
		value: function _initValidation() {
			var self = this;
			$.validator.addMethod("pwdLength", function (value) {
				return value && value.length >= 6;
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
					pwd: "Password must be at least 6 characters."
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
	_createClass(MainViewModel, [{
		key: "DialogPresenter",
		get: function get() {
			return dialogPresenter;
		}
	}]);

	function MainViewModel(storageHelper, logInVm, orderFormVm, giftFormVm) {
		_classCallCheck(this, MainViewModel);

		// observables
		this.Services = Configuration.SERVICES;
		this.WASH_COST = _.find(this.Services, function (s) {
			return s.item == Constants.WASH;
		}).price;
		if (this.Services.length % 2 != 0) {
			_.last(this.Services).fullSpan = "col-md-12";
		}

		this.LogInViewModel = logInVm;
		this.OrderFormViewModel = orderFormVm;
		this.GiftFormViewModel = giftFormVm;

		this.storageHelper = storageHelper;
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
		key: "OnVerifyZip",
		value: function OnVerifyZip() {
			if (Utils.VerifyZip(this.zip())) {
				this.zipVerified(true);
				this.storageHelper.ZipCode = this.zip();
			} else {
				dialogPresenter.ShowBadZip();
				this.zip("");
			}
		}
	}]);

	return MainViewModel;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OrderFormViewModel = function () {
	_createClass(OrderFormViewModel, [{
		key: 'SelectedCars',
		get: function get() {
			return _.filter(this.cars(), function (car) {
				return car.selected();
			});
		}
	}]);

	function OrderFormViewModel(storageHelper, webSvc) {
		var _this = this;

		_classCallCheck(this, OrderFormViewModel);

		var self = this;

		// Configure Stripe
		this.stripeHandler = StripeCheckout.configure({
			key: Configuration.StripeKey,
			image: '/img/square_logo.png',
			locale: 'auto',
			token: this._completeOrder.bind(this)
		});

		// Close Checkout on page navigation:
		$(window).on('popstate', function () {
			self.stripeHandler.close();
		});

		this.webSvc = webSvc;
		this.storageHelper = storageHelper;

		this.$orderFormModal = $('#order-form-modal');

		this.$orderFormModal.on('show.bs.modal', function () {
			self._prePopulateUserData();
		});

		this.disableEmailInput = ko.observable(false);
		this.incompleteFormMsg = ko.observable("");

		this.showNewUserAlert = ko.observable(false);

		// Order Details
		this.Services = ko.observableArray(Configuration.SERVICES);
		this.addWash = ko.computed(function () {
			return _.find(_this.Services(), function (s) {
				return s.item == Constants.WASH;
			}).checked();
		});
		this.addInterior = ko.computed(function () {
			return _.find(_this.Services(), function (s) {
				return s.item == Constants.INTERIOR;
			}).checked();
		});

		this.addWash.subscribe(function (bool) {
			_this.Services().forEach(function (s) {
				if (s.item == Constants.TIRE_SHINE || s.item == Constants.WAX) {
					s.disable(!bool);
				}
			});
		});

		this.addInterior.subscribe(function (bool) {
			_this.Services().forEach(function (s) {
				if (s.item == Constants.SHAMPOO || s.item == Constants.CONDITIONER || s.item == Constants.HEADLIGHT_RESTORE) {
					s.disable(!bool);
				}
			});
		});

		this.Rows = _.partition(this.Services(), function (s) {
			return s.sortOrder <= Math.ceil(_this.Services().length / 2);
		});

		this.description = ko.observable("");

		this.timeRangeOptions = [Constants.TIME_RANGE_PLACE_HOLDER, Constants.MORNING_TIME_RANGE, Constants.AFTERNOON_TIME_RANGE, Constants.EVENING_TIME_RANGE
		//Constants.NIGHT_TIME_RANGE
		];
		this.selectedTimeRange = ko.observable(Constants.TIME_RANGE_PLACE_HOLDER);

		this.dateMoment = null;

		// Car Info
		this.showAddVehicleForm = ko.observable(false);
		this.cars = ko.observableArray([]);
		this.make = ko.observable("");
		this.model = ko.observable("");
		this.color = ko.observable("");
		this.carSizes = Configuration.CAR_SIZES;
		this.selectedCarSize = ko.observable(this.carSizes[0]);

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
		this.zip = ko.observable(this.storageHelper.ZipCode);

		// Coupon
		this.couponCode = ko.observable("");
		this.coupon = ko.observable(null);

		this.orderTotal = ko.computed(function () {
			var total = 0.00;
			var serviceCost = _.reduce(_this.Services(), function (memo, s) {
				if (s.checked() && !s.disable()) {
					memo += s.price;
				}
				return memo;
			}, 0);
			_.each(self.SelectedCars, function (car) {
				var carSize = _.find(self.carSizes, function (s) {
					return s.size == car.size || s.multiplier == car.multiplier;
				});
				total += carSize.multiplier * serviceCost;
			});

			return total.toFixed(2);
		});

		this.discountedTotal = ko.computed(function () {
			var total = self.orderTotal();
			if (!self.coupon()) {
				return total;
			}

			var couponAmount = self.coupon().amount;
			if (couponAmount > total) {
				total = 0.00;
			} else {
				total -= couponAmount;
			}

			return total.toFixed(2);
		});

		this.discountRemaining = ko.computed(function () {
			if (!self.coupon()) {
				return 0.00;
			}

			var couponAmount = self.coupon().amount;
			var result = couponAmount - self.orderTotal();

			return result < 0 ? 0.00 : result.toFixed(2);
		});

		this.orderSummary = ko.computed(function () {
			var summary = "";

			if (self.dateMoment) {
				summary = $.validator.format("<strong>{0} {1}</strong><br>", self.dateMoment.format("ddd MMM Do"), self.selectedTimeRange().range);
			}

			var selectedCars = self.SelectedCars;
			if (selectedCars.length > 0) {
				summary += self._buildServicesSummary() + "<hr>";
			}

			selectedCars.forEach(function (car) {
				var carSize = _.find(Configuration.CAR_SIZES, function (obj) {
					return obj.size == car.size || obj.multiplier == car.multiplier;
				});
				summary += $.validator.format("<strong>{0} {1}</strong><br>{2}{3}<br>", car.make, car.model, carSize.size, carSize.multiplier > 1 ? " - additional " + Math.round((carSize.multiplier - 1) * 100).toString() + "%" : "");
			});

			return summary;
		});
	}

	_createClass(OrderFormViewModel, [{
		key: 'OnAfterRender',
		value: function OnAfterRender(elements, self) {
			self.$addVehicleForm = $('#add-vehicle-form');
			self.$addLocationForm = $('#add-location-form');
			self.$contactDetailsForm = $('#contact-details-form');
			self.$orderDetailsForm = $('#order-details-form');

			$('#phone').mask('(999) 999-9999? ext:99999', { placeholder: " " });

			$('#datetimepicker').datetimepicker({
				minDate: moment().subtract(1, 'days'),
				maxDate: moment().add(30, 'days'),
				format: Configuration.DATE_FORMAT,
				disabledDates: Configuration.BLOCKED_DAYS,
				allowInputToggle: true,
				focusOnShow: false,
				ignoreReadonly: true
			}).on('dp.change', self._onDatepickerChange.bind(self));

			self._initValidation();

			try {
				var code;
				if (URLSearchParams != undefined) {
					var urlParams = new URLSearchParams(window.location.search);
					code = urlParams.get('coupon');
				} else {
					var query = window.location.search.substring(1);
					var vars = query.split('&');
					for (var i = 0; i < vars.length; i++) {
						var pair = vars[i].split('=');
						if (decodeURIComponent(pair[0]) == 'coupon') {
							code = decodeURIComponent(pair[1]);
						}
					}
				}
				if (code) {
					code = code.trim().toUpperCase();
					self.couponCode(code);
					self.$orderFormModal.modal('show');
				}
			} catch (ex) {
				console.log(ex);
			}
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
		value: function OnSubmit(payNow) {
			var self = this;

			if (!this.addWash() && !this.addInterior()) {
				this.incompleteFormMsg('Interior and/or exterior cleaning must be selected.');
				$('#incomplete-form-alert').show();
				return;
			}

			if (!this.$orderDetailsForm.valid()) {
				this.incompleteFormMsg('Please fill in required order details.');
				$('#incomplete-form-alert').show();
				return;
			}

			if (!this.cars() || this.cars().length === 0) {
				this.incompleteFormMsg('Please add at least one vehicle.');
				$('#incomplete-form-alert').show();
				return;
			}

			if (this.SelectedCars.length === 0) {
				this.incompleteFormMsg('Please select at least one vehicle to service.');
				$('#incomplete-form-alert').show();
				return;
			}

			if (!this.locations() || this.locations().length === 0) {
				this.incompleteFormMsg('Please add a location.');
				$('#incomplete-form-alert').show();
				return;
			}

			var selectedLocation = _.find(this.locations(), function (loc) {
				return loc.selected();
			});
			if (!selectedLocation) {
				this.incompleteFormMsg('Please select your desired location.');
				$('#incomplete-form-alert').show();
				return;
			}

			if (!Utils.VerifyZip(selectedLocation.zip)) {
				this.incompleteFormMsg("Sorry but we currently don't service within that zip code.");
				$('#incomplete-form-alert').show();
				return;
			}

			if (!this.$contactDetailsForm.valid()) {
				this.incompleteFormMsg('Please complete the contact information.');
				$('#incomplete-form-alert').show();
				return;
			}

			$('#incomplete-form-alert').hide();
			$('#invalid-coupon-alert').hide();

			if (payNow) {
				this._openCheckout();
			} else {
				this._completeOrder();
			}
		}
	}, {
		key: 'OnFormCancel',
		value: function OnFormCancel() {
			try {
				$('#incomplete-form-alert').hide();
				$('#invalid-coupon-alert').hide();
				$('#success-coupon-alert').hide();

				this.$orderFormModal.modal('hide');
				this.$orderDetailsForm.validate().resetForm();
				this.$contactDetailsForm.validate().resetForm();

				this.storageHelper.LoggedInUser = null;
				this.storageHelper.IsNewUser = false;
				this.storageHelper.ZipCode = "";

				this._resetObservables();

				window.location = "#page-top";
			} catch (ex) {
				console.log("Failed to reset fields OnFormCancel()");
				console.log(ex);
			}
		}
	}, {
		key: 'OnApplyCoupon',
		value: function OnApplyCoupon() {
			var self = this;
			$('#invalid-coupon-alert').hide();
			$('#success-coupon-alert').hide();

			if (this.couponCode && this.couponCode().length > 0) {
				this.webSvc.VerifyCoupon(this.couponCode()).then(function (coupon) {
					if (!coupon) {
						$('#invalid-coupon-alert').show();
					} else {
						$('#success-coupon-alert').show();
						self.coupon(coupon);
					}
				}).fail(function (err) {
					console.log(err);
				});
			}
		}
	}, {
		key: '_openCheckout',
		value: function _openCheckout() {
			var total = parseInt(this.discountedTotal() * 100);
			this.stripeHandler.open({
				key: Configuration.StripeKey,
				name: 'WMC Checkout',
				amount: total,
				zipCode: true,
				email: this.email()
			});
		}
	}, {
		key: '_completeOrder',
		value: function _completeOrder(token) {
			try {
				var self = this;
				var prepaid = token != null;

				spinner.Show();
				async.waterfall([prepaid ? this._executeCharge.bind(this, token) : function (callback) {
					callback();
				}, this._verifyUser.bind(this), this._updateUserData.bind(this, prepaid), this._sendEmailConfirmation.bind(this)], function (possibleError) {
					if (possibleError === Constants.CHARGE_FAILURE_MARKER) {
						self.incompleteFormMsg('That card information didn\'t work.');
						$('#incomplete-form-alert').show();
					} else if (possibleError) {
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
			this.$orderFormModal.modal('hide');
			setTimeout(function () {
				spinner.Hide();
				dialogPresenter.ShowOrderFailure();
				console.log(error);
			}, 200);
		}
	}, {
		key: '_onOrderSuccess',
		value: function _onOrderSuccess() {
			this.OnFormCancel();
			setTimeout(function () {
				spinner.Hide();
				dialogPresenter.ShowOrderSuccess();
			}, 200);
		}
	}, {
		key: '_sendEmailConfirmation',
		value: function _sendEmailConfirmation(user, newAppt, callback) {
			this.webSvc.SendConfirmationEmail(user.firstName, user.email, user.phone, newAppt).then(function () {
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
				callback(null, this.storageHelper.LoggedInUser);
			} else {
				this.webSvc.GetUserByEmail(this.email()).then(function (user) {
					if (user) {
						callback(null, user);
					} else {
						// create new guest user
						var guestUser = self._makeGuestUserSchema();
						self.webSvc.CreateUser(guestUser).then(function () {
							return callback(null, guestUser);
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
			var total = parseInt(this.discountedTotal() * 100);
			this.webSvc.ExecuteCharge(token, total, this.last()).then(function () {
				return callback();
			}).fail(function (err) {
				console.log(err);
				callback(Constants.CHARGE_FAILURE_MARKER);
			});
		}
	}, {
		key: '_updateUserData',
		value: function _updateUserData(prepaid, currentUsr, callback) {
			var newAppt = this._makeAppointmentSchema(prepaid);
			currentUsr.appointments != null ? currentUsr.appointments.push(newAppt) : currentUsr.appointments = [newAppt];

			currentUsr.cars = this.cars();
			currentUsr.phone = this.phone();
			currentUsr.locations = this.locations();
			currentUsr.firstName = this.first();
			currentUsr.lastName = this.last();

			this.webSvc.UpdateUser(currentUsr).then(function () {
				return callback(null, currentUsr, newAppt);
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

				if (locations.length > 0) {
					locations[0].selected(true);
				}

				if (cars.length > 0) {
					cars[0].selected(true);
				}

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

			this.showNewUserAlert(this.storageHelper.IsNewUser);
		}
	}, {
		key: '_resetObservables',
		value: function _resetObservables() {
			this.showNewUserAlert(false);
			this.disableEmailInput(false);
			this.incompleteFormMsg("");

			// Order Details
			this.description = ko.observable("");
			this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);

			$('#datetimepicker').data("DateTimePicker").clear();

			// Car Info
			this.showAddVehicleForm(false);
			this.cars([]);
			this.make("");
			this.model("");
			this.color("");
			this.selectedCarSize(this.carSizes[0]);

			// Contact Info
			this.first("");
			this.last("");
			this.email("");
			this.phone("");

			// Location Info
			this.showAddLocationForm(false);
			this.locations([]);
			this.title(this.locationTitleOptions[0]);
			this.street("");
			this.city("");
			this.zip("");

			this.couponCode("");
			this.coupon(null);
		}
	}, {
		key: '_onDatepickerChange',
		value: function _onDatepickerChange(event) {
			if (event && event.date) {
				this.dateMoment = event.date;
				this._updatePickerAndTimerangeOptions(event.date);
			}
		}
	}, {
		key: '_updatePickerAndTimerangeOptions',
		value: function _updatePickerAndTimerangeOptions(momentObj) {
			if (Utils.IsHoliday(momentObj)) {
				_.each(this.timeRangeOptions, function (o) {
					o.disabled(true);
				});
				this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);
				return;
			}

			var hourOfDay = moment().hour();
			var today = moment().format(Configuration.DATE_FORMAT);
			var tmrw = moment().add(1, 'day').format(Configuration.DATE_FORMAT);
			var selectedDate = momentObj.format(Configuration.DATE_FORMAT);
			var dayOfWeek = momentObj.day();
			var schedule = _.find(Configuration.SCHEDULE, function (x) {
				return x.day === dayOfWeek;
			});

			var appointments = this.storageHelper.AppointmentsByDate[selectedDate] || [];

			var maxMinutesPerInterval = Configuration.MAX_JOB_TIME_PER_INTERVAL;
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
			}, 0) >= maxMinutesPerInterval || selectedDate == today && hourOfDay >= 1 || selectedDate == tmrw && hourOfDay >= 20 || _.contains(schedule.blockedTimeSlots, Constants.MORNING_TIME_RANGE.key));
			Constants.AFTERNOON_TIME_RANGE.disabled(_.reduce(afternoonAppts, function (total, appt) {
				return total + appt.timeEstimate;
			}, 0) >= maxMinutesPerInterval || selectedDate == today && hourOfDay >= 9 || selectedDate == tmrw && hourOfDay >= 20 || _.contains(schedule.blockedTimeSlots, Constants.AFTERNOON_TIME_RANGE.key));
			Constants.EVENING_TIME_RANGE.disabled(_.reduce(eveningAppts, function (total, appt) {
				return total + appt.timeEstimate;
			}, 0) >= maxMinutesPerInterval || selectedDate == today && hourOfDay >= 12 || _.contains(schedule.blockedTimeSlots, Constants.EVENING_TIME_RANGE.key));
			Constants.NIGHT_TIME_RANGE.disabled(_.reduce(nightAppts, function (total, appt) {
				return total + appt.timeEstimate;
			}, 0) >= maxMinutesPerInterval || selectedDate == today && hourOfDay >= 15 || _.contains(schedule.blockedTimeSlots, Constants.NIGHT_TIME_RANGE.key));

			if (this.selectedTimeRange().disabled()) {
				this.selectedTimeRange(Constants.TIME_RANGE_PLACE_HOLDER);
			}
		}
	}, {
		key: '_initValidation',
		value: function _initValidation() {
			var self = this;

			$.validator.addMethod("timeRangeSelected", function (value, element, arg) {
				var range = self.selectedTimeRange().range;
				return range != null && range.length > 0;
			}, "Please select a time range!");

			this.$orderDetailsForm.validate({
				rules: {
					date: "required",
					timeRange: "timeRangeSelected"
				},
				errorPlacement: function errorPlacement() {}
			});

			this.$contactDetailsForm.validate({
				rules: {
					first: "required",
					last: "required",
					date: "required",
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
					zip: "required"
				}
			});
		}
	}, {
		key: '_makeGuestUserSchema',
		value: function _makeGuestUserSchema() {
			return {
				isGuest: true,
				email: this.email(),
				pwd: Utils.GenerateUUID()
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
				selected: ko.observable(false)
			};
		}
	}, {
		key: '_makeAppointmentSchema',
		value: function _makeAppointmentSchema(prepaid) {
			var selectedCars = this.SelectedCars;
			var selectedLocation = _.find(this.locations(), function (loc) {
				return loc.selected();
			});
			return {
				cars: selectedCars,
				date: this.dateMoment.toDate(),
				location: selectedLocation,
				prepaid: prepaid,
				price: this.discountedTotal(),
				services: this._buildServicesArray(),
				timeEstimate: this._getTimeEstimate(),
				timeRange: this.selectedTimeRange().range,
				timeRangeKey: this.selectedTimeRange().key,
				description: this.description()
			};
		}
	}, {
		key: '_makeLocationSchema',
		value: function _makeLocationSchema() {
			return {
				city: this.city(),
				street: this.street(),
				title: this.title(),
				zip: this.zip(),
				selected: ko.observable(false)
			};
		}
	}, {
		key: '_getTimeEstimate',
		value: function _getTimeEstimate() {
			var totalTime = 0;

			this.Services().forEach(function (s) {
				if (s.checked()) {
					totalTime += s.time;
				}
			});

			totalTime += Configuration.AVG_JOB_SETUP_TIME;

			totalTime += Configuration.AVG_JOB_DRIVING_TIME;

			return totalTime;
		}
	}, {
		key: '_buildServicesArray',
		value: function _buildServicesArray() {
			var services = [];

			this.Services().forEach(function (s) {
				if (s.checked()) {
					services.push(s.title);
				}
			});

			return services;
		}
	}, {
		key: '_buildServicesSummary',
		value: function _buildServicesSummary() {
			var summary = "";

			this.Services().forEach(function (s) {
				if (s.checked() && !s.disable()) {
					summary += s.title + "<br>";
				}
			});

			return summary;
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
		key: 'GetFutureAppointments',
		value: function GetFutureAppointments() {
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
		value: function SendConfirmationEmail(firstName, email, phone, newAppt) {
			return this._executeAjaxCall('POST', "/api/sendConfirmationEmail", { firstName: firstName, email: email, phone: phone, newAppt: newAppt });
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
		key: 'GetEnvironment',
		value: function GetEnvironment() {
			return this._executeAjaxCall('GET', "/api/getEnvironment");
		}
	}, {
		key: 'GetSystemSettings',
		value: function GetSystemSettings() {
			return this._executeAjaxCall('GET', "/api/getSystemSettings");
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
	}, {
		key: 'VerifyCoupon',
		value: function VerifyCoupon(code) {
			return this._executeAjaxCall('POST', "/api/verifyCoupon", { code: code });
		}
	}, {
		key: 'SendGiftEmail',
		value: function SendGiftEmail(email, giftAmount) {
			return this._executeAjaxCall('POST', "/api/createOneTimeCoupon", { email: email, amount: giftAmount, duration: 90 });
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
