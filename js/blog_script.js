$(document).ready(function () {
  var images = [
    'images/web1.jpeg',
    'images/web2.jpeg',
    'images/web3.jpeg'
  ];
  var currentIndex = 0;

  $('.gallery-img').on('click', function () {
    currentIndex = $('.gallery-img').index(this);
    $('#lightboxImg').attr('src', images[currentIndex]);
    $('#lightbox').fadeIn(300);
  });

  $('#nextBtn').on('click', function () {
    currentIndex = (currentIndex + 1) % images.length;
    $('#lightboxImg').fadeOut(150, function () {
      $(this).attr('src', images[currentIndex]).fadeIn(150);
    });
  });

  $('#prevBtn').on('click', function () {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    $('#lightboxImg').fadeOut(150, function () {
      $(this).attr('src', images[currentIndex]).fadeIn(150);
    });
  });

  $('#closeBtn').on('click', function () {
    $('#lightbox').fadeOut(300);
  });
}); 
