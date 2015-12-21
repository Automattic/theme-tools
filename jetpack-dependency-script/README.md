# Jetpack dependency script

This script checks for Jetpack dependencies within the active theme, and, prompts user to download and install Jetpack accordingly.

# How to use it

Download plugin-enhancements.php, and put it somewhere in your theme (`inc` folder is the recommended destination). Next, include it from your theme’s functions.php, like so:
```php
/**
 * Load plugin enhancement file to display admin notices.
 */
require get_template_directory() . '/inc/plugin-enhancements.php';
```

The notifications appear on the Dashboard, Themes and Plugins page within the admin, and they’re dismissable so as not to be super-annoying.

# Technical details

The script currently looks for site logo, comics, testimonials, portfolios, menus, and featured content, then displays notices accordingly. Extending it to look for other features is pretty simple:
```php
        if ( current_theme_supports( 'nova_menu_item' ) ) :
            $dependencies['menus'] = array(
                'name' => 'Menus',
                'slug' => 'nova_menu_item',
                'module' => 'custom-content-types',
            );
        endif;
```
The slug is how Jetpack identifies the feature, the name is a nice human-readable name, and the module is which Jetpack module, if any, needs to be activated.

Since the script looks for theme support using `current_theme_supports()`, themes need to explicitly register support for the Jetpack features they include. Some themes will use a Jetpack feature without explicitly registering support. In those cases you'll need to declare it like so, for the script to work properly:

`add_theme_support( 'jetpack-portfolio' );`
