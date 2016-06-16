class LoadingSpinner{
	constructor(){
        const width = 12;
        const length = 12;
        const innerRadius = 30;
        const totalRadius = width + length + innerRadius;

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
            , top: '-'+ totalRadius.toString()
            , left:  '-'+ totalRadius.toString()
            , shadow: true // Whether to render a shadow
            , hwaccel: true // Whether to use hardware acceleration
            , position: "relative" // Element positioning
        }

        this.spinnerOverlay = $("#page-load-spinner");
        this.spinnerContainer = document.getElementById("spinner-container");
	}

	Show(){
        if ($(this.spinnerOverlay).is(":visible")){
            return;
        }
        
        this.spinnerOverlay.show();
        
        if (!this.spinner){
            this.spinner = new Spinner(this.options).spin(this.spinnerContainer);
        }
        else{
            this.spinner.spin(this.spinnerContainer);
        }
	}

	Hide(){
        this.spinnerOverlay.hide();

        if (!this.spinner){
            return;
        }

        this.spinner.stop();
	}
}