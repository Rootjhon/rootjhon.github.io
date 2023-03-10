/**
 * Set up image stuff
 */

(function() {
    if ($('div.row img[data-src]') <= 0) {
        return;
    }

    /* See: <https://github.com/dimsemenov/Magnific-Popup> */
    $('.popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        showCloseBtn: false,
        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out'
        }
    });

    /* Stop shimmer when image loaded */
    document.addEventListener('lazyloaded', function(e) {
        const $img = $(e.target);
        $img.parent().removeClass('shimmer');
    });

})();
