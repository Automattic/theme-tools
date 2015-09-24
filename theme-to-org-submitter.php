<?php

// Get our theme name
if ( ! $_GET['theme'] ) :
  exit( 'Please specify a theme.' );
else :
  $theme = $_GET['theme'];
endif;

// Run through VIP/whatever scanner

/*
 * This should be done on themes in /pub, from a sandbox
 */

// Get path to pub dir
$pub_path = '../pub/';
$original_stylesheet_URI = $pub_path . $theme.'/style.css';

// Read file data
function read_file( $URI ) {
  $handle = fopen( $URI, 'r' ) or die( 'Cannot open file:  '.$URI );
  $data = fread( $handle, filesize( $URI ) );
  return $data;
}

// Write new file data
function write_file( $URI, $data ) {
  $handle = fopen( $URI, 'w' ) or die( 'Cannot open file:  '.$URI );
  fwrite( $handle, $data);
  fclose( $handle );
}

// Delete a file
function delete_file( $URI ) {
  unlink( $URI );
}

$stylesheet = read_file( $original_stylesheet_URI );

// Make sure the theme URI is set correctly
function set_theme_URI( $theme, $stylesheet ) {
  $pattern = '/^Theme URI:\s?([a-z\:\/\.]+)$/mi';
  $theme_URI = 'https://wordpress.com/themes/' . $theme;
  $replacement = 'Theme URI: ' . $theme_URI;
  $stylesheet = preg_replace($pattern, $replacement, $stylesheet );
  return $stylesheet;
}

// Bump the version number
function bump_version_number( $theme, $stylesheet ) {
  $pattern = '/^Version:\s?(\d+)\.(\d+)\.(\d+)(-wpcom)?$/mi';
  $replacement = 'Version: ${1}.${2}.${3}';
  $stylesheet = preg_replace_callback( $pattern, 'increment_match', $stylesheet );
  return $stylesheet;
}

function increment_match( $matches ) {
  return 'Version: ' . $matches[1] . '.' . $matches[2]. '.' . ++$matches[3] . '-wpcom';
}

// Get a list of tags for the .org version of the theme
function get_theme_tags( $theme, $stylesheet ) {
  $org_allowed_tags = array( 'black', 'blue', 'brown', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'silver', 'tan', 'white', 'yellow', 'dark', 'light', 'fixed-layout', 'fluid-layout', 'responsive-layout', 'one-column', 'two-columns', 'three-columns', 'four-columns', 'left-sidebar', 'right-sidebar', 'accessibility-ready', 'blavatar', 'buddypress', 'custom-background', 'custom-colors', 'custom-header', 'custom-menu', 'editor-style', 'featured-image-header', 'featured-images', 'flexible-header', 'front-page-posting', 'full-width-template', 'microformats', 'post-formats', 'rtl-language-support', 'sticky-post', 'theme-options', 'threaded-comments', 'translation-ready', 'holiday', 'photoblogging', 'seasonal' );

  // Get our original tag string
  $pattern = '/^Tags:\s?[a-z,\s-]+$/mi';
  preg_match( $pattern, $stylesheet, $matches );

  // Remove prefix and split into an array
  $tags = str_replace( 'Tags: ', '', $matches[0] );
  $tags = explode( ',' , $tags );

  // If the tag in question is in our list of available tags on .org, add it to a new string
  $org_tag_string = 'Tags: ';
  foreach ( $tags as $tag ) :
    if ( in_array( trim($tag), $org_allowed_tags ) ) :
      $org_tag_string .= $tag . ',';
    endif;

  // Strip the final comma
  //$org_tag_string = rtrim( $org_tag_string, ', ' );
  endforeach;
  return $org_tag_string;
}

// Set our theme URI and bump our version number
$new_stylesheet = set_theme_URI( $theme, $stylesheet );
$new_stylesheet = bump_version_number( $theme, $new_stylesheet );

// Write our new stylesheet
//write_file( $original_stylesheet_URI, $new_stylesheet );

// Get a list of .org-approved tags
$new_tags = get_theme_tags( $theme, $stylesheet );

// Check for PO file
function is_pot( $theme ) {
  if ( file_exists ( $theme .'/languages/'. $theme . '.pot' ) ) :
    return true;
  else :
    // php ~/public_html/bin/i18n/create-glotpress-project-for-theme.php /home/wpcom/public_html/wp-content/themes/[repo]/[theme-slug]
    return false;
  endif;
}
is_pot( $theme );

// Update README to reflect any changes-- do we need this?

// Commit changes to svn repo & deploy

/*
 * Now the theme just needs to be tweaked for submitting to .org
 */

// Generate new theme download, download from Showcase, open zip
$theme_dir = $theme . '-wpcom/';
$new_stylesheet_URI = $theme_dir . 'style.css';
$new_stylesheet = read_file( $new_stylesheet_URI );
$functions_URI = $theme_dir . 'functions.php';
$updater_URI = $theme_dir . 'inc/updater.php';
$pot_URI = $theme_dir . 'languages/'.$theme.'.pot';
$footer_URI = $theme_dir . 'footer.php';

// Re-add .org-approved tags to stylesheet
function add_theme_tags( $stylesheet, $tags ) {
  $pattern = '/^(Text\sdomain:\s?[a-z-]+)$/mi';
  $replacement = '${1}' . "\n$tags";
  $stylesheet = preg_replace( $pattern, $replacement, $stylesheet );
  return $stylesheet;
}

// Remove the updater.php file from /inc and call to it in functions.php.
function remove_updater( $functions_URI ) {
  $functions = read_file( $functions_URI );
  $pattern = '/^\/\/\s?updater\s?for\s?WordPress\.com\s?themes\s+if\s?\(\s?is_admin\(\)\s?\)\s+include\s?dirname\(\s?__FILE__\s?\)\s?\.\s?\'\/inc\/updater\.php\';/mi';
  $functions = preg_replace( $pattern, '', $functions );
  return $functions;
}

// Remove the -wpcom from the POT file.
function edit_pot( $pot_URI ) {
  $pot = read_file( $pot_URI );
  $pattern = '/^(\"Project-Id-Version:\s?\w+\s?\d+\.\d+.\d+)-wpcom/mi';
  $replacement = '${1}';
  $pot = preg_replace( $pattern, $replacement, $pot );
  return $pot;
}

// Update the Underscores copyright year, if necessary.
function update_s_copyright( $stylesheet ) {
  $pattern = '/Underscores\shttp:\/\/underscores\.me\/?,?\s?\(C\)\s\d+-\d+/mi';
  $replacement = 'Underscores http://underscores.me/ (C) 2012-' . date( 'Y' );
  $stylesheet = preg_replace( $pattern, $replacement, $stylesheet );
  return $stylesheet;
}

// Update footer credit URL
function update_footer_credit ( $footer_URI, $theme ) {
  $footer = read_file( $footer_URI );
  $pattern = '/<a\shref="https?\:\/\/wordpress\.com\/themes\/" rel="designer">WordPress\.com<\/a>/mi';
  $replacement = '<a href="http://wordpress.com/themes/'.$theme.'/" rel="designer">WordPress.com</a>';
  $footer = preg_replace( $pattern, $replacement, $footer );
  return $footer;
}

// Remove updater file & references
$new_functions = remove_updater( $functions_URI );
// write_file ( $functions_URI, $new_functions );
// delete_file( $updater_URI );

// Edit .pot file
$new_pot = edit_pot( $pot_URI );
//write_file( $pot_URI, $new_pot );

// Add new tags and copyright information to stylesheet
$new_stylesheet_tags = add_theme_tags( $new_stylesheet, $new_tags );
$new_stylesheet_copyright = update_s_copyright( $new_stylesheet_tags );
//write_file( $new_stylesheet_URI, $new_stylesheet_copyright );

// Change the footer credit to the theme’s showcase page (WPTRT requires the credit to match either the Author URI or the Theme URI).
// TODO: add handling for themes like Harmonic, that have multiple footers
$new_footer = update_footer_credit( $footer_URI, $theme );
write_file( $footer_URI, $new_footer );

// Create new theme zip:
//zip -r THEMENAME.zip . -x "*/\.*"
