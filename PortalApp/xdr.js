//This is necessary to work around a problem with IE9.
//SEE: http://stackoverflow.com/questions/10232017/ie9-jquery-ajax-with-cors-returns-access-is-denied
// Excerpt:
//This is a known bug with jQuery. The jQuery team has "no plans to support this in core and is better suited as a plugin." (See this comme//nt). IE does not use the XMLHttpRequest, but an alternative object named XDomainRequest.
//
//There is a plugin available to support this in jQuery, which can be found here: https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js
//
//EDIT The function $.ajaxTransport registers a transporter factory. A transporter is used internally by $.ajax to perform requests. Therefore, I assume you should be able to call $.ajax as usual. Information on transporters and extending $.ajax can be found here.

//
//Two other notes:

//    The object XDomainRequest was introduced from IE8 and will not work in versions below.
//    From IE10 CORS will be supported using a normal XMLHttpRequest.



if ( window.XDomainRequest ) {
    jQuery.ajaxTransport(function( s ) {
			     if ( s.crossDomain && s.async ) {
				 if ( s.timeout ) {
				     s.xdrTimeout = s.timeout;
				     delete s.timeout;
				 }
				 var xdr;
				 return {
				     send: function( _, complete ) {
					 function callback( status, statusText, responses, responseHeaders ) {
					     xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
					     xdr = undefined;
					     complete( status, statusText, responses, responseHeaders );
					 }
					 xdr = new XDomainRequest();
					 xdr.onload = function() {
					     callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
					 };
					 xdr.onerror = function() {
					     callback( 404, "Not Found" );
					 };
					 xdr.onprogress = jQuery.noop;
					 xdr.ontimeout = function() {
					     callback( 0, "timeout" );
					 };
					 xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
					 xdr.open( s.type, s.url );
					 xdr.send( ( s.hasContent && s.data ) || null );
				     },
				     abort: function() {
					 if ( xdr ) {
					     xdr.onerror = jQuery.noop;
					     xdr.abort();
					 }
				     }
				 };
			     }
			 });
}
