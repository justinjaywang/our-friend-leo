$(document).ready(function() {

	/* loader gif */
	$('.wrapper').css({'visibility': 'hidden', 'opacity': 0.0})
	
	$(window).load(function() {

    setTimeout(function() {
      $('#loader').fadeOut(100);
      $('.wrapper').css('visibility', 'visible').animate({opacity: 1.0}, 1000);
		}, 500);
  });

  /* fitvids */
  $('.video-container').fitVids();

});