<?php
/**************************************************************************

Plugin Name:  Theme Plugin Enhancements
Plugin URI:
Description:  Inform a theme user of plugins that will extend their theme's functionality.
Version:      0.1
Author:       Automattic
Author URI:   http://automattic.com
License:      GPLv2 or later

**************************************************************************/

class Theme_Plugin_Enhancements {

	/**
	 * Holds the information of the plugins declared as enhancements
	 * by the theme.
	 */
	var $plugins;

	/**
	 * Whether to display an admin notice or not
	 */
	var $display_notice = false;

	/**
	 * Init function.
	 */
	static function init() {
		static $instance = false;

		if ( ! $instance )
			$instance = new Theme_Plugin_Enhancements;

		return $instance;
	}

	/**
	 * Determine the plugin enhancements declared by the theme.
	 *
	 * Themes must declare the plugins on which they depend by using
	 * add_theme_support( 'plugin-enhancements' ).
	 *
	 * If there are plugin enhancements and any of the enhancements are
	 * either not installed or not activated, alert the user.
	 */
	function __construct() {

		/* We only want to display the notice on the Dashboard and in Themes.
		 * Return early if we are on a different screen
		 */
		$screen = get_current_screen();
		if ( ! ( 'dashboard' == $screen->base || 'themes' == $screen->base ) ) {
			return;
		}

		// Get the plugin enhancements information declared by the theme.
		$this->dependencies = $this->get_theme_dependencies();

		// If we have plugin dependencies, build an array to list all the required dependencies
		if ( ! empty( $this->dependencies ) ) {
			$dependency_list = ' ';

			// Create a list of dependencies
			foreach ( $this->dependencies as $dependency ) :
				if ( ' ' !== $dependency_list ) :
					$dependency_list .= ', ';
				endif;
				$dependency_list .= $dependency['name'];
			endforeach;

			$this->plugins = array(
				array(
					'slug'    => 'jetpack',
	    		'name'    => 'Jetpack by WordPress.com',
	    		'message' => __( "The Jetpack plugin is needed to use some of this theme's special features, including: ", 'textdomain' ),
					'modules' => $dependency_list,
				)
			);
		// Otherwise, return early
		} else {
			return;
		}


		/* Set the status of each of these enhancements and determine if a
		 * notice is needed.
		 */
		$this->set_plugin_status();

		// Output the corresponding notices in the admin.
		if ( $this->display_notice && current_user_can( 'install_plugins' ) ) {
			add_action( 'admin_notices', array( $this, 'admin_notices' ) );
		}
	}

	/*
	 * Let's see which modules (if any!) this theme relies on.
	 *
	 */
	function get_theme_dependencies() {

		if ( current_theme_supports( 'site-logo' ) ) :
			$dependencies['logo'] = array(
				'name' => 'Site Logo',
				'slug' => 'site-logo',
				'url'  => '',
			);
		endif;

		if ( current_theme_supports( 'featured-content' ) ) :
			$dependencies['featured-content'] = array(
				'name' => 'Featured Content',
				'slug' => 'featured-content',
				'url'  => '',
			);
		endif;

		if ( current_theme_supports( 'nova_menu_item' ) ) :
			$dependencies['menus'] = array(
				'name' => 'Menus',
				'slug' => 'nova_menu_item',
				'url'  => '',
			);
		endif;

		if ( current_theme_supports( 'jetpack-comic' ) ) :
			$dependencies['comics'] = array(
				'name' => 'Comics',
				'slug' => 'jetpack-comic',
				'url'  => '',
			);
		endif;

		if ( current_theme_supports( 'jetpack-testimonial' ) ) :
			$dependencies['testimonials'] = array(
				'name' => 'Testimonials',
				'slug' => 'jetpack-testimonial',
				'url'  => '',
			);
		endif;

		if ( current_theme_supports( 'jetpack-portfolio' ) ) :
			$dependencies['portfolios'] = array(
				'name' => 'Portfolio',
				'slug' => 'jetpack-portfolio',
				'url'  => '',
			);
		endif;

		return $dependencies;
	}

	/**
	 * Determine the status of each of the plugins declared as a dependency
	 * by the theme and whether an admin notice is needed or not.
	 */
	function set_plugin_status() {
		// Get the names of the installed plugins.
		$installed_plugin_names = wp_list_pluck( get_plugins(), 'Name' );

		foreach ( $this->plugins as $key => $plugin ) {

			// Determine whether a plugin is installed.
			if ( in_array( $plugin['name'], $installed_plugin_names ) ) {

				/* Determine whether the plugin is active. If yes, remove if from
				 * the array containing the plugin enhancements.
				 */
				if ( is_plugin_active( array_search( $plugin['name'], $installed_plugin_names ) ) ) {
					unset( $this->plugins[$key] );
				}

				// Set the plugin status as to-activate.
				else {
					$this->plugins[$key]['status'] = 'to-activate';
					$this->display_notice = true;
				}

			// Set the plugin status as to-install.
			} else {
				$this->plugins[$key]['status'] = 'to-install';
				$this->display_notice = true;
			}
		}

	}

	/**
	 * Display the admin notice for the plugin enhancements.
	 */
	function admin_notices() {
		$notice = '';

		// Loop through the plugins and print the message and the download or active links.
		foreach( $this->plugins as $key => $plugin ) {
			$notice .= '<p>';

			// Custom message provided by the theme.
			if ( isset( $plugin['message'] ) ) {
				$notice .= esc_html( $plugin['message'] );
				$notice .= esc_html( $plugin['modules'] );
				$notice .= '<br>';
			}

			// Activation message
			if ( 'to-activate' == $plugin['status'] ) {
				$activate_url =  $this->plugin_activate_url( $plugin['slug'] );
				$notice .=  sprintf(
								__( ' Please activate %1$s. %2$s', 'confit' ),
								esc_html( $plugin['name'] ),
								( $activate_url ) ? '<a href="' . $activate_url . '">' . __( 'Activate', 'confit' ) . '</a>' : ''
							);
			}

			// Download message
			if ( 'to-install' == $plugin['status'] ) {
				$install_url =  $this->plugin_install_url( $plugin['slug'] );
				$notice .=  sprintf(
								__( ' Please install %1$s. %2$s', 'confit' ),
								esc_html( $plugin['name'] ),
								( $install_url ) ? '<a href="' . $install_url . '">' . __( 'Install', 'confit' ) . '</a>' : ''
							);
			}

			$notice .=  '</p>';
		}

		// Output notice HTML.
		printf(
			'<div id="message" class="notice notice-warning is-dismissible">%s</div>',
			$notice
		);
	}

	/**
	 * Helper function to return the URL for activating a plugin.
	 *
	 * Uses the plugin slug to determine what plugin to activate.
	 */
	function plugin_activate_url( $slug ) {
		// Find the path to the plugin.
		$plugin_paths = array_keys( get_plugins() );
		$plugin_path  = false;

		foreach ( $plugin_paths as $path ) {
			if ( preg_match( '|^' . $slug .'|', $path ) ) {
				$plugin_path = $path;
			}
		}

		if ( ! $plugin_path ) {
			return false;
		} else {
			return wp_nonce_url(
				self_admin_url( 'plugins.php?action=activate&plugin=' . $plugin_path ),
				'activate-plugin_' . $plugin_path
			);
		}
	}

	/**
	 * Helper function to return the URL for installing a plugin.
	 *
	 * Uses the plugin slug to determine what plugin to install.
	 */
     function plugin_install_url( $slug ) {
		 /* Include Plugin Install Administration API to get access to the
		  * plugins_api() function
		  */
		 include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

         $plugin_information = plugins_api( 'plugin_information', array( 'slug' => $slug ) );

		if ( is_wp_error( $plugin_information ) ) {
			return false;
		} else {
			return wp_nonce_url(
				self_admin_url( 'update.php?action=install-plugin&plugin=' . $slug ),
				'install-plugin_' . $slug
			);
		}
	}


}
add_action( 'admin_head', array( 'Theme_Plugin_Enhancements', 'init' ) );
