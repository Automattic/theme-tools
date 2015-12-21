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
