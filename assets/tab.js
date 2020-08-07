$( '.nav navbar-nav' ).on( 'click','li', function () {
	$( '.nav navbar-nav li.active' ).removeClass( 'active');
	$( this ).addClass( 'active' );
});