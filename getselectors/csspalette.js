
/* css-palette.js */

var fs = require( 'fs' );
var path = require( 'path' );
var colors = require('colors');
var util = require( 'util' );
var css = require( 'css' );
var minimist = require('minimist');

var CSS_COLORS = require( util.format( '%s/lib/css-colors.js', __dirname ) );

var opts = {}; // Command line options

function main() {
  opts = minimist( process.argv.slice( 2 ), {
	boolean: [ 'help' ],
	string: [ 'title', 'outfile' ],
	default: {
		title: 'Color Palette'
	},
	alias: {
		'title'	  : 't',
    'outfile' : 'o',
		'help'	  : 'h'
	},
  } );
  if ( opts.help || opts.h || 0 === opts._.length ) {
    printUsage();
    process.exit( 0 );
  }
  var file = opts._[0];
  if ( fs.existsSync( file ) ) {
    if ( fs.statSync( file ).isDirectory() ) {
      console.log( '\nIs a directory: %s\n', file.bold );
      process.exit( 1 );
    } else {
      if ( opts.outfile && file === opts.outfile ) {
        console.log( '\n%s and %s are the same.\n', 'Output file'.underline, 'source file'.underline );
        process.exit( 1 );
      } else {
        run( file );
      }
    }
  } else {
    console.log( '\nFile does not exist: %s\n', file.bold );
    process.exit( 1 );
  }
}

function printUsage( ) {
  var cmd = path.basename( __filename ).replace( '.js', '' );
  console.log( '\nUsage: %s %s', cmd.bold, '<stylesheet> [options]'.gray );
  console.log( '       %s %s', cmd.bold, '<stylesheet> --title "TITLE"'.gray );
  console.log( '       %s %s', cmd.bold, '<stylesheet> --outfile file.html'.gray );
  console.log( 'Options:\n' );
  console.log( '-t, --title\tSets generated palette title' );
  console.log( '-o, --outfile\tFile to save the generated HTML output' );
  console.log( '-h, --help\tDisplay help information' );
  console.log( '' );
}

function run( file, title ) {
  var buf = fs.readFileSync( file, 'utf8' );
  var ob = css.parse( buf );
  var colors = new Colors();
  if ( ob && ob.stylesheet && ob.stylesheet.rules instanceof Array ) {
    var rules = {}, media = {}, out = [];
    ob.stylesheet.rules.filter( rulesFilter ).forEach(function( r ) {
      rulesHandler( r, colors );
    } );
    ob.stylesheet.rules.filter( mediaFilter ).forEach(function( m ) {
      if ( undefined === media[ m.media ] ) {
        media[ m.media ] = {};
      }
      m.rules.filter(rulesFilter).forEach(function(r) {
        rulesHandler( r, colors );
      } );
    } );
    var outfile, list = colors.getList(), html = TEMPLATE;
    if ( list.length > 0 ) {
      list = list.map( function( c ) {
        return util.format( '\t\t<li style="background-color: %s;"><span>%s</span></li>', c, c );
      } );
      html = html.replace( /\{title\}/g, opts.title );
      html = html.replace( '{palette}', list.join( '\n' ) );
      if ( opts.outfile ) {
        outfile = opts.outfile;
        if ( ! /\.html$/.test( outfile ) ) {
          outfile += '.html';
        }
      } else {
        outfile = file.split( '.' );
        outfile.pop();
        outfile = util.format( '%s.html', outfile.join( '.' ) );
      }
      fs.writeFileSync( outfile, html, 'utf8' );
      console.log( '\nGenerated %s\n', outfile.bold );
    } else {
      console.log( '\nNo colors found on stylesheet.\n' );
    }
    process.exit( 0 );
  }
}

function rulesHandler( r, colors ) {
  r.declarations.forEach(function( d ) {
    if ( 'declaration' === d.type && d.value && 'string' === typeof d.value ) {
      var prop = d.property;
      var c = colors.getColor( d.value );
      if ( c ) {
        colors.addToList( c );
      }
    }
  } );
}

function rulesFilter( r ) {
  return 'rule' === r.type && r.declarations instanceof Array && r.declarations.length > 0;
}

function mediaFilter( m ) {
  return 'media' === m.type && m.rules instanceof Array && m.rules.length > 0;
}

function Colors() {
	
  var regex = {

    hex: /^#([a-f0-9]{3}([a-f0-9]{3})?)$/i,
    
    special: /^(rgb|hsl)(\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\))$/i,

    special_alpha: /^(rgba|hsla)(\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\,\s*\d+(\.\d+)?\))$/i,
    
    color: new RegExp( util.format('^(%s)$', CSS_COLORS.join( '|' ) ), 'i' ),
    
    color_start: new RegExp( util.format( '^(%s)\\s', CSS_COLORS.join( '|' ) ), 'i' ),
    
    color_end: new RegExp( util.format( '\\s(%s)$', CSS_COLORS.join( '|' ) ), 'i' ),
    
    color_middle: new RegExp( util.format( '\\s(%s)\\s', CSS_COLORS.join( '|' ) ), 'i' ),

  }
  
  var list = [];
  
  return {

    addToList: function( c ) {
      if ( -1 === list.indexOf( c ) ) {
        list.push( c );
      }
    },
    
    getList: function() {
      return list;
    },

    getColor: function( s ) {
      if ( regex.hex.test( s ) ) {
        var m = s.match( regex.hex ), c = m[1];
        if ( 3 === c.length ) {
          c = util.format( '%s%s%s%s%s%s', c[0], c[0], c[1], c[1], c[2], c[2] );
        }
        return util.format( '#%s', c ).toLowerCase();
      } else if ( regex.special.test( s ) ) {
        m = s.match( regex.special );
        return util.format( '%s%s', m[1], m[2] );
      } else if ( regex.special_alpha.test( s ) ) {
        m = s.match( regex.special_alpha );
        return util.format( '%s%s', m[1], m[2] );
      } else {
        if ( regex.color.test( s ) ) {
          m = s.match( regex.color );
        } else if ( regex.color_start.test( s ) ) {
          m = s.match( regex.color_start );
        } else if ( regex.color_end.test( s ) ) {
          m = s.match( regex.color_end );
        } else if ( regex.color_middle.test( s ) ) {
          m = s.match( regex.color_middle );
        }
        return m ? m[1] : null;
      }
    }

  }
	
}

var TEMPLATE = '\
<!doctype html>\n\
<html lang="en-US">\n\
<head>\n\
<title>{title}</title>\n\
<meta charset="utf-8" />\n\
<style type="text/css">\n\
	html {\n\
		height: 100%;\n\
		background: #fff;\n\
	}\n\
	body {\n\
		font-family: Menlo, Monaco, Courier, monospace;\n\
		font-size: 16px;\n\
		color: #323232;\n\
		margin: 0 auto;\n\
		padding: 1.5em 0 3.5em;\n\
		width: 100%;\n\
		max-width: 900px;\n\
	}\n\
	* {\n\
		box-sizing: border-box;\n\
	}\n\
	ul {\n\
		margin: 0;\n\
		padding: 0;\n\
	}\n\
	ul li {\n\
		position: relative;\n\
		box-shadow: 0 1px 1px rgba(0,0,0,0.5);\n\
		border-radius: 5px;\n\
		display: block;\n\
		width: 100%;\n\
		height: 3em;\n\
		float: left;\n\
	}\n\
	ul li:nth-child(n+2) {\n\
		margin-top: 1em;\n\
	}\n\
	ul li:after {\n\
		position: absolute;\n\
		border-radius: inherit;\n\
		background: top left repeat url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADtJREFUeNpi/P//PwMDA5BkZGREZpw5c4YRDP79+wdhQFQyMZAIRjUQA1hwhbeJiQnW+BkNVppoAAgwALEFIInZutigAAAAAElFTkSuQmCC\');\n\
		content: "\\020";\n\
		width: 100%;\n\
		height: 100%;\n\
		z-index: -1;\n\
	}\n\
	ul li span {\n\
		position: absolute;\n\
		font-size: 0.9em;\n\
		margin-top: 0.5em;\n\
		content: attr(data-color);\n\
		box-shadow: 0 1px 2px rgba(0,0,0,0.5);\n\
		border-radius: 3px;\n\
		padding: 0 0.8em;\n\
		height: 2em;\n\
		line-height: 2em;\n\
		background: white;\n\
		text-align: center;\n\
		top: 50%;\n\
		margin-top: -0.95em;\n\
		left: 1em;\n\
		z-index: 1;\n\
	}\n\
	h1 {\n\
		font-weight: 500;\n\
		color: #323232;\n\
	}\n\
	.clear {\n\
		display: block;\n\
		clear: both;\n\
	}\n\
</style>\n\
</head>\n\
<body>\n\
	<h1>{title}</h1>\n\
	<ul>\n\
{palette}\n\
	</ul>\n\
	<div class="clear"></div>\n\
</body>\n\
</html>';

module.exports = main();