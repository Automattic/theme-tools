<?php
/**
 * Plugin Name: Theme Name Changer
 * Plugin URI:
 * Description: Change the site title ("blogname" option) to the active theme name, version, and author
 * Version: 1.0
 * Author: Automattic
 * Author URI:
 * License: GPLv2 or later
 */

function theme_name_changer_init() {
	$theme = wp_get_theme();
	if ( $theme->exists() ) {
		$blogname = $theme->Name . ' ' . $theme->Version . ' by ' . $theme->Author;
		$sanitized_blogname = wp_kses( $blogname, array() );
		update_option( 'blogname', $sanitized_blogname );
	}
}
add_action( 'switch_theme', 'theme_name_changer_init' );
