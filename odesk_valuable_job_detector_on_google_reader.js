// ==UserScript==
// @name		oDesk valuable job detector on Goggle Reader
// @namespace	https://github.com/HuangJian/Greasemonkey-Scripts
// @description	script to detect if the oDesk job has an attachment or a link in the post
// 				
// @include		https://www.google.com/reader/view/*
// @grant		GM_xmlhttpRequest 
// @require		https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// 
// @copyright	ustc.hj@gmail.com
// @license		MIT
// @version		0.1
// 
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var css = ' \
<style type="text/css" media="screen"> \
	.odesk-normal::before, \
	.odesk-attachment::before, \
	.odesk-link::after { \
		background-repeat: no-repeat; \
		content: ""; \
		display: inline-block; \
		position: relative; \
		float: left; \
		width: 16px; \
		height: 16px; \
		margin-top: 8px; \
		opacity: .9; \
	} \
	.odesk-attachment::before { \
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3AwQDDYwmh6U1wAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVYdFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aHAAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tInAAACr0lEQVQ4jYWTT0zTYBjGv65bC3Tr2rGVbV071u6PDOZmO+aWQcAQo4EBMR5MTDgQj1xQiQfxQIxejFcv3owHEg8eOBgSDwIHDiNRQGbAMZORGZMFRgfMsRaspxGYTL7kPf3e5/vzPO8HqaoKLloOhulr93dMEiQZU9U/Sj6f/7i6sjxZKBTWoYs2CAZD4xzvnkp/33iay+VmYFiD8rxn1MEw9xbmP3UDVVXrFsfxdwcHh3dNpuZgLQsGQ896enpn64qtVlvPwEBi32az9Z3HcRz3JhJDh5rzrk2SZFugI/B+Y2N9HMfxrt7ea6l4vGuBoqh4tQdBEEKWKwf/eIBhmDUsdi7u7Gy/bWxqakdRlNtMpx8bcDzgZJ2P5hfmaEVR5HC4850iKwXtaTGiQzBBEGYkaXcOQIDUaXW+paVkd6VSkVAEnWcczAstrCV5jh+x2+loKrUmnDxBo9HAfr9/WpZlqVQqfSOMxO3llS/9lUpFAgAAmqbHDw72PxsJ41Wapp98XVsdLJfL2yem+DzeV6Igrjpox0gsGisajUahyiwWS38sGiuyDDsai8YkykINVRlQVRUwDmZCFMRcC0XdioQjRbPZnKg26PX6QCQckViGGRMFcYtxMA9PpwFIgrwuhgTJ3GwevhIM/bLb7GNViCCINRi4nHWy7FR7mz/Jc/zr2jihS17foiRJ0wRB3PldLiezW9kHAAAAw3Cj1+2ZkxU5pYE0BhiGTenM5s3j42PltPFanVbbuVuURop7e7Plw3IGAAAgCIJcrPPN0dFRSZHlbQzTxzczmWitGAAAgM/tyRr0hhtnppBqee7h+A1Eh1B8qyvZgDZ46k0sMJtM9zmn8wfWhPUhOh3fYqFeultdeRRF3f/7J2dSMBHkhIthf3Ks85C22j6gCFL3xNr6C1zcrCw7Wc5GAAAAAElFTkSuQmCC); \
	} \
	.odesk-normal::before { \
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3AwRBSUcfkTlTAAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVYdFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aHAAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tInAAACCklEQVQ4jW2Sv2tTURTHP+f25YehjQkVWmqhtCZUo5GK4iAFRYfqoo62oEJ3l6IIrs7+ATq5uCrFQRDU6KJUHUSKoFbEJo2JbZ/yEmNezTsOiU1eXu507z3nfL/fc85XbjyfVXodVTzaIUEQkUCa1V2kreT+cILR+ASWWJSrBUq1NVSbgJ1APgAPsIxhZnyOo8OnCPVFUFUUj8/2e+5/vI3j/vJxms6HIJzdM8+xkdO4Xp2XhUfkVhdZrxVJJ7Nc3H+NkAm3lGhQwUj/GIeGjuO4Nnfe3WTzTwkFXqwucvnAdcbik0wNTbNUfIKogLQUqCqeeqQTWYwYlopP2aiXAMEguI06z749AJR08iBt/q4WIqEYIoKzZSMK0iQBoOLaKELU2kHnLkxzqmAQStVV1POYTE4hrbQmm5JKTiEo5Wqh1xAFRPiw8Ra7vs7ewcOcmZgjZg0Q7otyZPgEJ8fO89fb4nUp51MgnUZS9RiNp7iUuUosNIC2OhUMDd3i4cpd3hRzPh90ATSv8cgg07tnGN+ZwTIW+cpXXq09Ju+sBBzpW+P/QMW1+WQv01APYyzWnC+Uq3mCRu4CUFWiVowL+66QSmQRaS/pR63AveVblH9/D25hWwHCudQ8qUQWuvh2RUeYzSwQNmHff2AGycggGNNTrqri1H/SoNG7BYDN+gbQcpG/eltl5xD/AQtDyfPYcXxpAAAAAElFTkSuQmCC); \
	} \
	.odesk-link::after { \
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACfUlEQVR4nGNmIACUjWKY1HhedpfY827Wl+BI/8TI/ebVh2+XCOmDA3cT1c618ZL/rfXkC+21ZRs256n8V5SX1YTJM+HTbGthF1Xrzlo2+zpn9dFLD/tl5GX4JGVFGBgY/jMTNEBF112+xJO97fuPvwxv3n5kNNQz9Cu1+1U4/8DHZfcfPrkCU8eITbOqYbBYscWTPUaC73Qv3f7y9+27Hww6GvzMX9iEH5SsfW/1+NG953hdEGvwfo6eyFetiq1/m94wC16Tk+ZhPnbhw+ea9S8SkDVjBYEerqUX6jX/W2pKljIwMDC42NoX7U6W/G8ky9eDTT0zMkddx8HE/O+56UKcDFy3X/16y8Sv+LnFk2nK6Rtv3+9/yZ34+fOnz+gGwMNAQ89Vz5P1xB4vYz7Ru6///X/19CODpa3CX0lhNpao+W+jL91+vAybC5gYGBgYVAyCBYNEriz1dZLmn3ddYJG0lMBPaysZRiMLHZamnd8n4tIMB+muWqsfd+v+97LUqWBgYGCw1tcrPpIj978xVPMYXo0MDAwM9rauYR8Xu/+v8FfbycDAwKCoG8jZEqp1+u0su/+G2uphaOHFCsUsUNczMtTGuy97Oc/1v4KMuDUDAwNDhL3e9J/zLP4HmkivgmrkZGBg4GNgYOBC0szGwMDAw8DAwMny7ukD5sfX/zAIcbFpiKnLmtfY/MxYc5bx1Yazz9oYGBjYoRpYoC6ApZv/DAwMvxkYGH4zmhhYBc7y+rSOh+Mfw6/PXxh+CUr9smo4k/vj15+tDAwMPxkYGP5BNf2E4r9QAxgYGKDRKMjLE6Yn/D/3NyPLl9OPv8z5/efvIaj8Z6hNf3GFIQBR2+C7yndHoQAAAABJRU5ErkJggg==); \
	} \
</style>\
';
$( "head" ).append( css );

var timer = null,
	queue = [],
	TIMER_INTERVAL = 50;
document.addEventListener( "DOMNodeInserted", function( event ) {
	var el = event.target;
	if( el.className.indexOf( "entry" ) >= 0 ) {
		queue.push( el );
		if( !timer ) {
			timer = setTimeout( check, TIMER_INTERVAL );
		}
	}
} );


function check() {
	var el = queue.shift();
	if( !el ) {
		//if( timer ) clearTimeout( timer );
		timer = null;
		return;
	}

	var link = $( ".entry-original", el ).prop( "href" );
	if( !link || link.indexOf( "www.odesk.com/jobs" ) === -1 ) {
		check();
		return;
	}
	ajax( el, link );
}

function ajax( el, link ) {
	GM_xmlhttpRequest( {
		method: "GET",
		url: link,
		onload: function( r ) {
			var text = r.responseText,
				start = text.indexOf( '<section id="jobDescriptionSection">' ),
				end = text.indexOf( '</section>', start ),
				desc = text.substring( start, end ),
				hasAttachment = desc.indexOf( "Open Attachment" ) >= 0,
				hasLink = desc.indexOf( '"You are about to go to a URL outside odesk.com"' ) >= 0,
				cls = "";

			if( hasAttachment || hasLink ) {
				cls += ( hasAttachment ? "odesk-attachment " : "" ) +
					   ( hasLink ? "odesk-link " : "" );
			} else {
				cls += "odesk-normal "
			}
			$( ".entry-title", el ).addClass( cls );

			timer = setTimeout( check, TIMER_INTERVAL );
		}
	} );	
}