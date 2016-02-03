
/* theme-tags.js */

/**
 * Dynamically list and modify several themes in batch to add and remove theme tags.
 */

var fs = require( 'fs' );
var util = require( 'util' );
var path = require( 'path' );
var colors = require( 'colors' );
var minimist = require( 'minimist' );
var _ = require( 'underscore' );

function main() {
	var opts = minimist(process.argv.slice( 2 ), {
		boolean: [ 'help' ],
		string: [ 'add', 'remove', 'list', 'show', 'without' ],
		alias: {
			'add'	  : 'a',
			'remove'  : 'r',
			'confirm' : 'c',
			'list'	  : 'l',
			'show'	  : 's',
			'without' : 'w',
			'help'	  : 'h'
		},
	});

	if ( 1 === opts._.length ) {
		var dir = opts._[0].replace( /\/+$/, '' );
		var where = opts.list ? util.format( '%s/ (%s)', dir, opts.list ) : util.format( '%s/', dir );
		var instance = new ThemeTags( dir, opts );
	} else {
		printUsage( 0 );
	}

	if ( opts.help ) {
		printUsage( 0 );
	} else if ( opts.add ) {
		checkList( opts );
		instance.addTag( opts.add );
	} else if ( opts.remove ) {
		checkList( opts );
		instance.removeTag( opts.remove );
	} else if ( opts.show ) {
		if ( opts.list ) checkList( opts );
		var themes = instance.getThemesWithTag( opts.show );
		if ( themes.length ) {
			console.log( '\nShowing themes %s the [%s] tag in %s:\n', 'with'.underline, opts.show.bold, where.bold );
			themes.map( printThemeList );
			console.log( '' );
		} else {
			console.log( '\nNo themes found with the [%s] tag in %s\n', opts.show.bold, where.bold );
		}
	} else if ( opts.without ) {
		if ( opts.list ) checkList( opts );
		var themes = instance.getThemesWithoutTag( opts.without );
		if ( themes.length ) {
			console.log( '\nShowing themes %s the [%s] tag in %s:\n', 'without'.underline, opts.without.bold, where.bold );
			themes.map( printThemeList );
			console.log( '' );
		} else {
			console.log( '\nNo themes found without the [%s] tag in %s\n', opts.without.bold, where.bold );
		}
	} else {
		printUsage( 1 );
	}
}

function printUsage( exitCode, msg ) {
	var cmd = path.basename( __filename.replace( '.js', '' ) );

	if ( msg ) {
		console.log( '\n%s: %s.', 'Error'.bold, msg );
	}

	console.log( '\nUsage: %s %s', cmd.bold, '[options] <directory>'.gray );
	console.log( '       %s %s', cmd.bold, '--add <tag> --list <file> [--confirm] <directory>'.gray );
	console.log( '       %s %s', cmd.bold, '--remove <tag> --list <file> [--confirm] <directory>'.gray );
	console.log( '       %s %s', cmd.bold, '--show <tag> <directory>'.gray );
	console.log( '       %s %s', cmd.bold, '--without <tag> <directory>'.gray );
	console.log( '\nOptions:\n' );
	console.log( '-a, --add\tAdd a tag to the themes list' );
	console.log( '-r, --remove\tRemove a tag from the themes list' );
	console.log( '-c, --confirm\tComfirm changes to disk' );
	console.log( '-l, --list\tText file containing theme slugs' );
	console.log( '-s, --show\tShow themes using tag' );
	console.log( '-w, --without\tShow themes not using tag' );
	console.log( '-h, --help\tDisplay help information' );
	console.log( '' );

	process.exit( exitCode );
}

function printThemeList( theme ) {
	console.log( '- %s', theme.bold );
}

function checkList( opts ) {
	var err = null;
	if ( opts.list ) {
		if ( fs.existsSync( opts.list ) ) {
			if ( fs.statSync( opts.list ).isDirectory() ) {
				err = util.format( 'List file specified is a directory: %s', opts.list );
			}
		} else {
			err = util.format( 'List file does not exist: %s', opts.list );
		}
	} else {
		err = 'Themes slugs list not specified.';
	}
	if ( err ) {
		console.log( '\n%s: %s\n', 'Error'.bold, err );
		process.exit( 1 );
	}
}

function showCommitMessage() {
	console.log( '\nThis is an overview of what will be done.\nTo commit the changes to disk, use %s\n', '--commit'.bold );
}

function ThemeTags( path, opts ) {
	
	var tagsRegex = /Tags\s*:\s*([^\n]+)\n/;

	var data = fs.readdirSync( path ).filter( function( dir ) {
		var stylesheet = util.format( '%s/%s/style.css', path, dir );
		return fs.existsSync( stylesheet ) && fs.statSync( stylesheet ).isFile();
	} ).reduce( function( state, slug ) {
		var css = fs.readFileSync( util.format( '%s/%s/style.css', path, slug ), 'utf8' );
		var tags = css.match( tagsRegex );
		if ( tags ) {
			state[slug] = tags[1].split( /\s*,\s*/ );
		}
		return state;
	}, {});
	
	if ( 0 === Object.keys( data ).length ) {
		console.log( '\nNo themes found in %s\n', path );
		process.exit( 0 );
	}
	
	return {
		
		getThemesWithTag: function( tag ) {
			var themes = opts.list ? this.getThemesInList() : Object.keys( data );
			return themes.reduce( function( out, slug ) {
				var tags = data[ slug ];
				if ( tags.indexOf( tag ) >= 0 ) {
					out.push( slug );
				}
				return out;
			}, [] );
		},
		
		getThemesWithoutTag: function( tag ) {
			var themes = opts.list ? this.getThemesInList() : Object.keys( data );
			return themes.reduce( function( out, slug ) {
				var tags = data[ slug ];
				if ( -1 === tags.indexOf( tag ) ) {
					out.push( slug );
				}
				return out;
			}, [] );
		},
		
		getThemesInList: function( ) {
			var themes = fs.readFileSync( opts.list, 'utf8' ).trim().split( /\s*\n+\s*/g );
			var missing = themes.reduce( function( acc, theme ) {
				if ( ! data.hasOwnProperty( theme ) ) {
					acc.push( theme );
				}
				return acc;
			}, [] );
			if ( 0 === missing.length ) {
				return themes;
			} else {
				console.log( '\nThe following themes are %s in %s/:\n', 'not found'.underline, dir );
				missing.map( printThemeList );
				console.log( '\nTo proceed, update the list in %s\n', file.bold );
				process.exit( 1 );
			}
		},

		updateThemeTags: function( slug, tags ) {
			if ( opts.commit ) {
				var file = util.format( '%s/%s/style.css', path, slug );
				var css = fs.readFileSync( file, 'utf8' );
				if ( tagsRegex.test( css ) ) {
					css = css.replace( tagsRegex, util.format( 'Tags: %s\n', tags.join( ', ' ) ) );
					fs.writeFileSync( file, css, 'utf8' );
					console.log( 'Updated %s/style.css', slug.bold );
				}
			} else {
				printThemeList( slug );
			}
		},
		
		removeTag: function( tag ) {
			var include = this.getThemesInList();
			var themes = this.getThemesWithTag( tag ).filter( function( theme ) {
				return include.indexOf( theme ) >= 0;
			} );
			if ( themes.length > 0 ) {
				if ( opts.commit ) {
					console.log( '\n%s the %s tag:\n', 'Removing'.underline, tag.bold );
				} else {
					console.log( '\nWill %s the %s tag from the following themes:\n', 'remove'.underline, tag.bold );
				}
				themes.forEach( function( theme ) {
					var tags = data[theme].filter( function( t ) {
						return t !== tag;
					} );
					this.updateThemeTags( theme, tags );
				}, this );
				if ( opts.commit ) {
					console.log( '\nDone!\n' );
				} else {
					showCommitMessage();
				}
			} else {
				console.log( '\nNo themes found with the [%s] tag.\n', tag.bold );
			}
		},
		
		addTag: function( tag ) {
			var include = this.getThemesInList();
			var themes = this.getThemesWithoutTag( tag ).filter( function( theme ) {
				return include.indexOf( theme ) >= 0;
			} );
			if ( themes.length > 0 ) {
				if ( opts.commit ) {
					console.log( '\n%s the %s tag:\n', 'Adding'.underline, tag.bold );
				} else {
					console.log( '\nWill %s the %s tag to the following themes:\n', 'add'.underline, tag.bold );
				}
				themes.forEach( function( theme ) {
					var tags = [ tag ].concat( data[ theme ] ).sort();
					this.updateThemeTags( theme, tags );
				}, this );
				if ( opts.commit ) {
					console.log( '\nDone!\n' );
				} else {
					showCommitMessage();
				}
			} else {
				console.log( '\nAll themes have the [%s] tag.\n', tag.bold );
			}
			
		}

	}
	
}

module.exports = main();
