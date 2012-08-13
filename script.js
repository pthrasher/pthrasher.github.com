(function(){

  var onResize = function(event) {
        $('pre').each(function(){
          var $el = $(this),
          w = $el.outerWidth(),
          h = $el.outerHeight(),
          wW = $(window).width(),
          $parent = $el.parent(),
          textLeft = (wW / 2) - 333,
          newLeft = (wW - w) / 2;

          if (newLeft < 0) {
            newLeft = 0; // Otherwise, if the window is too small, scrolling won't work.
          } else if (newLeft > textLeft) {
            newLeft = textLeft; // Text left should take precedence over centering.
          }

          $parent.height(h + 40);
          $el.css('left', newLeft);

        });

      },

      widont = function (els) {
        $(els).each(function(){
          $(this).html($(this).html().replace(/\s([^\s<]+)\s*$/,'&nbsp;$1'));
        });
      },


      fixAmpersands = function() {
        // entity encodes only ampersands that aren't already encoded
        $("h1,h2,h3,p:contains('&')", document.body).each(function() {
          if( this.nodeType == 3 ) {
            // regex from Stack Overflow http://bit.ly/aJZVCG
            $(this).html( $(this).html().replace( /&(?![a-zA-Z]{2,6};|#[0-9]{2,4};)/g, "&amp;" ) );
          }
        });
      },

      dressUpAmpersands = function() {
        // adds a span with class 'amp' to the entity-encoded ampersands
        $("h1,h2,h3,p:contains('&')", document.body).each(function() {
          $(this).html( $(this).html().replace( /&amp;/g, "<span class='amp'>&amp;</span>" ) );
        });
      };

  $(function(){
    $(window).resize(onResize).trigger('resize');

    $('.highlight').click(function(event) {
      $(this).toggleClass('dark');
    });

    widont('h1,h2,p');
    fixAmpersands();
    dressUpAmpersands();

  });

}).call(this);
