$(document).ready(function() {
  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?ids=83092536@N02&lang=en-us&format=json&jsoncallback=?",
    function(data){
      $.each(data.items, function(index, item){
        var mImage = item.media.m;
        // var qImage = mImage.replace("_m.", "_q.")
        $("<img/>").attr("src", mImage).appendTo("#flickr").wrap("<div class='four columns'><a href='" + item.link + "' target='_blank'></a></div>");
        if (index==3) {
          return false
        }
      });
    }
  ) // end $.getJSON
      
}) // end $(document).ready