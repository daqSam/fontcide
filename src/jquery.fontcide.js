;(function ($, window, document, undefined) {

	"use strict";

	//Global variables
	var pluginName = "fontcide",
		defaults = {
			enabled: true,
			compressor: 1,
			min: Number.NEGATIVE_INFINITY,
			max: Number.POSITIVE_INFINITY,
		},
		eventName = "resize." + pluginName + " orientationchange." + pluginName;

	var plugins = [];
	var resizeHandler = function () {
		$(plugins).each(function () {
			$(this).data("plugin_" + pluginName).resize();
		});
	};
	$(window).on(eventName, resizeHandler);

	var Plugin = function (element, options) {
		//Instance variables
		var settings = $.extend({}, defaults, options);

		var $element = $(element);

		var originalFontSize = $element.css("font-size");
		var fontSizeInline = ($element.attr("style") || "").indexOf("font-size") >= 0;

		//Instance private methods
		function attach() {
			plugins.push(element);
		}

		function detach() {
			plugins = $(plugins).filter(function () {
				return this !== element;
			});
		}

		//Instance public methods
		this.resize = function () {
			var display = $(element).css("display");
			var checkSelf = display == "block" || (display == "inline-block" && ($(element).attr("style") || "").indexOf("width:") >= 0);
			var target = checkSelf ? $(element) : $(element).parent();

			$(element).css("font-size",
				Math.max(Math.min(target.width() / (settings.compressor * 10), parseFloat(settings.max)),
					parseFloat(settings.min)));
		};
		this.set = function (newSetting, value) {
			var handlerStatus = settings.enabled;

			if (typeof (newSetting) === "object") {
				$.extend(settings, newSetting);
			} else if (typeof (newSetting) === "string" && value && settings[newSetting]) {
				settings[newSetting] = value;
			} else {
				return;
			}

			if (settings.enabled !== handlerStatus) {
				if (settings.enabled) {
					attach();
				} else {
					detach();
				}
			}

			this.resize();
		};
		this.remove = function () {
			detach();
			$(element).removeData("plugin_" + pluginName);
			if (fontSizeInline) {
				$(element).css("font-size", originalFontSize);
			} else {
				$(element).css("font-size", "");
			}
		};

		//Initialization
		this.resize();
		attach();
	};

	window[pluginName] = function (command) {
		if (command === "resize") {
			resizeHandler();
		}
	};

	$.fn[pluginName] = function (options) {
		if (this.length === 1 && this.eq(0).data("plugin_" + pluginName)) {
			if (options) {
				this.eq(0).data("plugin_" + pluginName).set(options);
			} else {
				return this.eq(0).data("plugin_" + pluginName);
			}
		}

		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" +
					pluginName, new Plugin(this, options));
			}
		});
	};

	$(document).ready(function () {
		var defaultKeys = Object.keys(defaults);
		$("[data-" + pluginName + "]").each(function () {

			var $this = $(this);
			var buildOptions = function () {
				var options = {};

				defaultKeys.forEach(function (key) {
					var value = $this.attr("data-" + pluginName + "-" + key);
					if (value != null)
						options[key] = value;
				});

				return options;
			};

			$this.fontcide(buildOptions());

			$this.attrchange({
				callback: function (e) {
					if (e.attributeName.startsWith("data-" + pluginName)) {
						if (e.attributeName === "data-" + pluginName) {
							$this.fontcide().remove();
							$this.attrchange('remove');
						} else {
							$this.fontcide().set(buildOptions());
						}
					}
				}
			});
		});
	});

})(jQuery, window, document);
