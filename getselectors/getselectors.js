
/* getselectors.js */

var fs = require( 'fs' );
var path = require( 'path' );
var colors = require('colors');
var util = require( 'util' );
var css = require( 'css' );
var minimist = require('minimist');

// Support named colors :: http://www.w3.org/TR/css3-color/#svg-color
var CSS_COLORS = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue',
  'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
  'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
  'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
  'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
  'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
  'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
  'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
  'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke',
  'yellow', 'yellowgreen'
]

var opts = {}; // Command line options

function main() {
  opts = minimist(process.argv.slice( 2 ), {
    boolean: ['spaces', 'fonts', 'help']
  });
  if ( opts.help || opts.h ) {
    printUsage();
    process.exit( 0 );
  }
  var file, color, args = opts._;
  if ( 2 === args.length ) {
    file = args[0];
    color = new Color(args[1]);
    if ( ! fs.existsSync( file ) ) {
      console.log( '\nFile does not exist: %s\n', file );
      process.exit( 1 );
    } else if ( ! color.isValid() ) {
      console.log( '\nNot a color: %s\n', color );
      process.exit( 1 );
    } else {
      run( file, color );
    }
  } else if ( 1 === args.length && ( opts.fonts || opts.f ) ) {
    file = args[0]
    run( file, null, true );
  } else {
    printUsage();
    process.exit( 1 );
  }
}

function printUsage() {
  var cmd = path.basename( __filename ).replace( '.js', '' );
  console.log( '\nUsage: %s %s', cmd.bold, '[options] <stylesheet> <color>'.gray );
  console.log( '       %s %s\n', cmd.bold, '--fonts <stylesheet>'.gray );
  console.log( 'Options:\n' );
  console.log( '-f, --fonts\tDisplay selectors containing font families' );
  console.log( '-s, --spaces\tSeparate selectors using spaces instead of newlines' );
  console.log( '-h, --help\tDisplay help information' );
  console.log( '' );
}

function run( file, color, fonts ) {
  var buf = fs.readFileSync( file, 'utf8' );
  var ob = css.parse( buf );
  if ( ob && ob.stylesheet && ob.stylesheet.rules instanceof Array ) {
    var rules = {}, media = {}, out = [];
    ob.stylesheet.rules.filter( rulesFilter ).forEach(function( r ) {
      if ( fonts ) {
        fontsHandler( r, rules );
      } else {
        rulesHandler( r, rules, color );
      }
    } );
    ob.stylesheet.rules.filter( mediaFilter ).forEach(function( m ) {
      if ( undefined === media[ m.media ] ) {
        media[ m.media ] = {};
      }
      m.rules.filter(rulesFilter).forEach(function(r) {
        if ( fonts ) {
          fontsHandler( r, media[m.media] );
        } else {
          rulesHandler(r, media[m.media], color);
        }
      } );
    } );
    if ( fonts ) {
      formatFontStyles( rules, out );
    } else {
      formatStyles( rules, color, out );
    }
    Object.keys( media ).forEach(function( k ) {
      if ( Object.keys( media[ k ] ).length > 0 ) {
        if ( fonts ) {
          out.push( util.format( '@media %s '.gray, k ) + util.format( '{\n\n%s\n\n}', formatFontStyles( media[ k ], [] ).join( '\n\n' ) ) );
        } else {
          out.push( util.format( '@media %s '.gray, k ) + util.format( '{\n\n%s\n\n}', formatStyles( media[ k ], color, [] ).join( '\n\n' ) ) );
        }
      }
    } );
    if ( out.length > 0 ) {
      console.log( util.format( '\n%s\n', out.join( '\n\n' ) ) );
    }
    process.exit( 0 );
  }
}

function rulesFilter( r ) {
  return 'rule' === r.type && r.declarations instanceof Array && r.declarations.length > 0;
}

function mediaFilter( m ) {
  return 'media' === m.type && m.rules instanceof Array && m.rules.length > 0;
}

function formatFont(str) {
  return str.replace( /"/g, '' ).split( /\s*,\s*/ ).map( function( s ) {
    if ( s.indexOf( ' ' ) >= 0 ) {
      return util.format( '"%s"', s );
    } else {
      return s;
    }
  } ).join( ', ' );
}

function formatFontStyles( rules, out ) {
  var sep = ( opts.spaces || opts.s ) ? ', ' : ',\n';
  Object.keys( rules ).forEach(function( k ) {
    out.push( util.format( '%s {\n  font-family: %s;\n}', rules[ k ].join( sep ).red, formatFont( k ) ) );
  } );
  return out;
}

function formatStyles( rules, color, out ) {
  var sep = ( opts.spaces || opts.s ) ? ', ' : ',\n';
  Object.keys( rules ).forEach(function( k ) {
    out.push( util.format('/* %s */'.bold, k ) + util.format( '\n\n%s {\n  %s: %s;\n}', rules[ k ].join( sep ).red, k, color.toString() ) );
  } );
  return out;
}

function isShorthandProperty( prop ) {
  return /^(border|border-left|border-right|border-top|border-bottom|background)$/.test( prop );
}

function arrayUnique( arr ) {
  for ( var out=[], i=0, len=arr.length; i < len; i++ ) {
    if ( -1 === out.indexOf( arr[ i ] ) ) {
      out.push( arr[ i ] );
    }
  }
  return out;
}

function fontsHandler( r, out ) {
  r.declarations.forEach(function( d ) {
    if ( 'declaration' === d.type && d.value && 'string' === typeof d.value ) {
      var value, prop = d.property;
      if ( 'font-family' === prop ) {
        value = d.value.trim();
        out[ value ] = arrayUnique( ( out[ value ] instanceof Array) ? out[ value ].concat( r.selectors ) : [].concat( r.selectors ) ).sort();
      }
    }
  } );
}

function rulesHandler( r, out, color ) {
  r.declarations.forEach(function( d ) {
    if ( 'declaration' === d.type && d.value && 'string' === typeof d.value ) {
      var match = false, prop = d.property;
      if ( color.value.test( d.value ) ) {
        if ( isShorthandProperty( prop ) ) {
          prop = util.format( '%s-color', prop );
        }
        match = true;
      } else if ( color.regex.test( d.value ) ) {
        if ( isShorthandProperty( prop ) ) {
          prop = util.format( '%s-color', prop );
        }
        match = true;
      }
      if ( match ) {
        out[ prop ] = arrayUnique( ( out[ prop ] instanceof Array) ? out[ prop ].concat( r.selectors ) : [].concat( r.selectors ) ).sort();
      }
    }
  } );
}

function Color( c ) {

  var isHex = false, isAlt = false, isNamed = false;
  
  var regex = {
    hexColor: /^\s*#?([a-f0-9]{3}|[a-f0-9]{6})\s*$/i,
    altColor: /^\s*(rgba?|hsla?)\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*\d+|,\s*\d+\.\d+)?\s*\)\s*$/i,
    regex: null,
    value: null
  }
  
  if ( 0 === c ) {
    // The shell parses any zero values as 0, which means 000 is parsed as 0.
    // We will assume a 0 value color to be #000
    c = "000";
  }

  c = c.toString().toLowerCase(); // Ensure we're dealing with a string, for numeric-only colors

  if ( regex.hexColor.test( c ) ) {
    var r, g, b, a, re, mode, match = c.match( regex.hexColor )[1];
    isHex = true;
    if (3 === match.length ) {
      c = [ match[0], match[0], match[1], match[1], match[2], match[2] ].join( '' )
      re = util.format( '#(%s|%s)', match, c );
      regex.value = new RegExp( util.format( '^%s$', re ), 'i' );
      regex.regex = new RegExp( re, 'i' );
    } else {
      re = util.format( '#%s', match );
      regex.value = new RegExp( util.format( '^%s$', re ), 'i' );
      regex.regex = new RegExp( re, 'i' );
    }
    c = util.format( '#%s', c );
  } else if ( regex.altColor.test( c ) ) {
    match = c.match( regex.altColor );
    mode = match[1]; r = match[2]; g = match[3]; b = match[4];
    a = match[5] ? match[5].replace( /^,\s*/, '' ) : null;
    if ( a ) {
      c = util.format( '%s(%d,%d,%d,%s)', mode, r, g, b, a );
      re = util.format('%s\\(\\s*(%s)\s*,\\s*(%s)\s*,\\s*(%s)\s*,\\s*%s\\s*\\)', mode, r, g, b, a );
    } else {
      c = util.format( '%s(%d,%d,%d)', mode, r, g, b ) ;
      re = util.format( '%s\(\s*(%s)\s*,\s*(%s)\s*,\s*(%s)\s*\)$', mode, r, g, b );
    }
    regex.value = new RegExp( util.format( '^%s$', re ), 'i' );
    regex.regex = new RegExp( re, 'i' );
    isAlt = true;
  } else if ( CSS_COLORS.indexOf( c ) >= 0 ) {
    regex.value = new RegExp( util.format( '^%s$', c ), 'i' );
    regex.regex = new RegExp( c, 'i' );
    isNamed = true;
  }

  return {
    
    regex: regex.regex,

    value: regex.value,
    
    isHex: function() {
      return isHex;
    },
    
    isAlt: function() {
      return isAlt;
    },
    
    isValid: function() {
      return isHex || isAlt || isNamed;
    },
    
    toString: function() {
      return c;
    }

  }

}

module.exports = main();