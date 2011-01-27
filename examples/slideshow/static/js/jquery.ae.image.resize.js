(function( $ ) {

  $.fn.aeImageResize = function( params ) {

    var aspectRatio = 0
      // Nasty I know but it's done only once, so not too bad I guess
      // Alternate suggestions welcome :)
      ,	isIE6 = $.browser.msie && (6 == ~~ $.browser.version)
      ;

    // We cannot do much unless we have one of these
    if ( !params.height && !params.width ) {
      return this;
    }

    // Calculate aspect ratio now, if possible
    if ( params.height && params.width ) {
      aspectRatio = params.width / params.height;
    }

    // Remove all attributes and CSS rules

    var imgHeight = this.height()
      , imgWidth = this.width()
      , imgAspectRatio = imgWidth / imgHeight
      , bxHeight = params.height
      , bxWidth = params.width
      , bxAspectRatio = aspectRatio;
				
    // Work the magic!
    // If one parameter is missing, we just force calculate it
    if ( !bxAspectRatio ) {
      if ( bxHeight ) {
        bxAspectRatio = imgAspectRatio + 1;
      } else {
        bxAspectRatio = imgAspectRatio - 1;
      }
    }

    // Only resize the images that need resizing
    if ( (bxHeight && imgHeight > bxHeight) || (bxWidth && imgWidth > bxWidth) ) {

      if ( imgAspectRatio > bxAspectRatio ) {
        bxHeight = ~~ ( imgHeight / imgWidth * bxWidth );
      } else {
        bxWidth = ~~ ( imgWidth / imgHeight * bxHeight );
      }

      this.height(bxHeight);
      this.width(bxWidth);
    }

    return this;
    
  };
})( jQuery );