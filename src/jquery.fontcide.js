;(function ($, window, document, undefined) {

    "use strict";

    //Global variables
    var pluginName = "fontcide",
        defaults = {
            enabled: true,
            compressor: 1,
            minFontSize: Number.NEGATIVE_INFINITY,
            maxFontSize: Number.POSITIVE_INFINITY,
        },
        eventName = "resize." + pluginName + " orientationchange." + pluginName;
    
    var plugins = [];
    
    $(window).on(eventName, function() {
        $(plugins).each(function() {
            $(this).data("plugin_" + pluginName).resize();
        });
    });
    
    var Plugin = function (element, options) {
        //Instance variables
        var settings = $.extend({}, defaults, options);
        
        var $element = $(element);
        
        var originalFontSize = $element.css("font-size");
        var fontSizeInline = ($element.attr("style") || "").indexOf("font-size") >= 0;
        
        //Instance private methods
        function attach() {
            plugins.push( element );
        }
        
        function detach() {
            plugins = $(plugins).filter(function(){
                return this !== element;
            });
        }
        
        //Instance public methods
        this.resize = function () {
            $(element).css("font-size",
                Math.max(Math.min($(element).width() / (settings.compressor * 10), parseFloat(settings.maxFontSize)),
                    parseFloat(settings.minFontSize)));
        };
        this.set = function( newSetting, value ) {
            var handlerStatus = settings.enabled;
            
            if( typeof( newSetting ) === "object" ) {
                $.extend({}, settings, newSetting);
            } else if( typeof( newSetting ) === "string" && value && settings[newSetting]) {
                settings[newSetting] = value;
            } else {
                return;
            }
            
            if( settings.enabled !== handlerStatus ) {
                if( settings.enabled ) {
                    attach();
                } else {
                    detach();
                }
            }
            
            this.resize();
        };
        this.remove = function() {
            detach();
            $(element).removeData("plugin_" + pluginName);
            if( fontSizeInline ) {
                $(element).css("font-size", originalFontSize);
            } else {
                $(element).css("font-size", "");
            }
        };
        
        //Initialization
        this.resize();
        attach();
    };
    
    $.fn[pluginName] = function (options) {
        if( this.length === 1 && this.eq(0).data("plugin_" + pluginName)) {
            if( options ) {
                this.eq(0).data("plugin_" + pluginName).set( options );
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

})(jQuery, window, document);
