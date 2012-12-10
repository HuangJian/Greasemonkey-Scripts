// ==UserScript==
// @name		Goggle Reader Full Article Requester
// @namespace	https://github.com/HuangJian/Greasemonkey-Scripts
// @description	script to request the full articles of the website 
// 				not providing full text feed
// 				
// @include		https://www.google.com/reader/*
// @grant		GM_xmlhttpRequest 
// @require		https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// 
// @copyright	ustc.hj@gmail.com
// @license		MIT
// @version		1.0
// 
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var KEYCODE_J = 74,
	KEYCODE_K = 75,
	KEYCODE_ENTER = 13,
	KEYCODE_SPACE = 32,
	REQUESTER_ARRAY = [
		"www.infzm.com", infzm,
		"www.infoq.com/cn/news", infoQcnNews,
		"www.infoq.com/cn/articles", infoQcnArticles,
		"blog.sina.com", sinablog,
		"www.ftchinese.com", ftchinese,
		"www.hecaitou.com", hecaitou,
		"www.cnbeta.com", cnbeta
	];
$( "#viewer-container" ).on( "click", ".collapsed", function() {
	request( $( this ).parents( ".entry" ) );
} );
$( document ).bind( "keyup", function( evt ) {
	if( evt.keyCode === KEYCODE_ENTER || 
		evt.keyCode === KEYCODE_SPACE ) {// expand by pressing space/enter
		var $entry = $( "#current-entry" );
		if( $entry.hasClass( "expanded" ) ) {
			if( evt.keyCode === KEYCODE_ENTER || !$entry.hasClass( "requested" ) ) { 
				request( $entry );
			}
		}
	}

	if( evt.keyCode !== KEYCODE_J && evt.keyCode !== KEYCODE_K ) return;

	setTimeout( function() {
		request( $( "#current-entry" ) );
	}, 0 );
} );

function request( $article ) {
	var link = $( ".entry-original", $article ).prop( "href" ),
		$div = $( ".entry-body", $article ),
		i;

	if( !link || !$div.length ) return;

	for( i = 0; i < REQUESTER_ARRAY.length; i += 2 ) {
		if( link.indexOf( REQUESTER_ARRAY[ i ] ) >= 0 ) {
			REQUESTER_ARRAY[ i + 1 ]( link, $div );
			break;
		}
	}

	$article.addClass( "requested" ); // mark it
}

function ftchinese( link, $div ) {
	ajax( link,
		'<div class="content" id="bodytext">', 
		'<div class="story_list">', 
		null,
		function( result ) {
			var text = result.html,
				loc = text.indexOf( '<div class="pagination">' ),
				loc2 = loc === -1 ? text.length : loc,
				content = text.substring( 0, loc2 ),
				strPagenation = text.substr( loc2 );
			$div.html( content );
			$( "script, iframe", $div[ 0 ] ).remove();

			if( loc !== -1 ) {
				getOtherPages( text.substr( loc2 ) );
			}
		}
	);
	function getOtherPages( strPagenation ) {
// <div class="pagination"><span class="current">1</span><a href="/s
// tory/001047722?page=2">2</a><a href="/story/001047722?page=3">3</
// a><a href="/story/001047722?page=4">4</a><a href="/story/00104772
// 2?page=5">5</a><a href="/story/001047722?page=2">&rsaquo;&rsaquo;<
// /a><a href="/story/001047722?page=2">下一页</a></div>

// => ["page=2", "page=3", "page=4", "page=5", "page=2", "page=2"]
		var pages = strPagenation.match( /page=\d+/g ),
			html = "",
			i, prev = 0
		for( i = 0; i < pages.length; ++i ) {
			var page = parseInt( pages[ i ].match( /\d+/ )[ 0 ] );
			if( page <= prev ) break;
			prev = page;
			html += "<div for='" + page + "'>Requesting page: " + page + "</div>";
		}
		$div.append( html );

		prev = 0;
		for( i = 0; i < pages.length; ++i ) {
			var page = parseInt( pages[ i ].match( /\d+/ )[ 0 ] );
			if( page <= prev ) break;
			prev = page;

			ajax( link + "?" + pages[ i ],
				'<div class="content" id="bodytext">', 
				'<div class=clearFloat>', 
				null, 
				function( result ) {
					var n = /(\d+)$/.exec( result.response.finalUrl )[ 0 ];
					var $divN = $( "div[for='" + n + "']", $div ).html( result.html );
					$( "script, iframe", $divN[ 0 ] ).remove();
				}
			);
		}
	}
}


function sinablog( link, $div ) {
	ajax( link, 
		'<!-- 正文开始 -->', 
		'<div class="shareUp">', 
		null, 
		function( result ) {
			$div.html( result.html );

			var div = $div[ 0 ];
			// remove the cofuseing text
			$( "span[class]", div ).remove();
			$( "> div > p", div ).css( "margin", "" );
			// correct the <img>'s src
			$( "img[real_src]", div ).each( function( idx, item ) {
				item.src = item.getAttribute( "real_src" );
			} );
		} 
	);
}
function infoQcnNews( link, $div ) {
	ajax( link, 
		'<div id="newsContent">', 
		'<script', 
		null, 
		function( result ) {
			$div.html( result.html );
		} 
	);
}
function infoQcnArticles( link, $div ) {
	ajax( link, 
		'<!-- AddThis Button END -->', 
		'<div class="clearer-space"></div>', 
		function( text ) {
			return text.replace( /src=\"\/resource/g, 
						'src="http://www.infoq.com/resource' );
		}, 
		function( result ) {
			$div.html( result.html );
			// remove the ads
			$( ".vendor-content-box-float", $div[ 0 ] ).remove();
		} 
	);
}
function infzm( link, $div ) {
	ajax( link, 
		'<section id="articleContent">', 
		'</section>', 
		null, 
		function( result ) {
			$div.html( result.html );
		} 
	);
}
function hecaitou( link, $div ) {
	ajax( link, 
		'<div class="EntryBody">', 
		'<div id="Share">', 
		function( text ) {
			return text.replace( /src=\"\/blogs/g, 
						'src="http://www.hecaitou.com/blogs' );
		}, 
		function( result ) {
			$div.html( result.html );
		} 
	);
}
function cnbeta( link, $div ) {
	ajax( link, 
		'<div id="news_content">', 
		'<a target = "_blank "', 
		null, 
		function( result ) {
			$div.html( result.html );
		},
		{ overrideMimeType : "text/html; charset=gb2312" }
	);
}
function ajax( url, strStart, strEnd, additionalProcessor, callback, specialSettings ) {
	displayLoadingSymbol();

	GM_xmlhttpRequest( $.extend( {
		method: "GET",
		url: url,
		onload: function( r ) {
			var text = r.responseText,
				start = text.indexOf( strStart ) + strStart.length,
				end = text.indexOf( strEnd, start ),
				html = text.substring( start, end );
			if( typeof additionalProcessor === "function" ) {
				html = additionalProcessor( html );
			}
			html = killXSS( html );
			hideLoadingSymbol();
			callback( { html : html, response: r } );
		}
	}, specialSettings ) );	
}

// http://stackoverflow.com/q/241040/474231
var	REGEX_KILL_IMG_XSS = /(<img.+?src=['"])(?!(https?:\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+)).+?>/g,
	REGEX_KILL_IFRAME_XSS = /(<\/?)iframe/g,
	REGEX_KILL_SCRIPT_XSS = /(<\?)script/g;
function killXSS( html ) {
	// remove all the unsafe <img> node 
	return html.replace( REGEX_KILL_IMG_XSS, "" )
	// replace all <iframe> to <a>
			   .replace( REGEX_KILL_IFRAME_XSS, "$1a" )
	// replace all <script> to <noscript>
			   .replace( REGEX_KILL_SCRIPT_XSS, "$1noscript" );
}

function displayLoadingSymbol() {
	var $title = $( ".entry-container .entry-title", "#current-entry" ),
		$img = $( ".loading-image", $title );
	if( !$img.length ) {
		$img = $( "<span class='loading-image'></span>" ).appendTo( $title );
	}
	$img.show();
}
function hideLoadingSymbol() {
	$( ".entry-title .loading-image", "#current-entry" ).hide();
}


var LOADING_IMAGE_SRC_DATA = "data:image/gif;base64,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";

function addLoadingImageCSS() {
	var css = ' \
<style type="text/css" media="screen" id="cssLoadingImage"> \
	.loading-image { \
		display: inline-block; \
		width: 16px; \
		height: 16px; \
		background-repeat: no-repeat; \
		background-image: url(' + LOADING_IMAGE_SRC_DATA + '); \
	} \
</style>';

	$( css ).appendTo( "head" );
}
addLoadingImageCSS();