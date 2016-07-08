# .org theme directory submission tool

This is specifically designed for submitting WordPress.com themes to the WordPress.org repo. If you're not doing that, this probably won't be much use to you. That said, there may be some patterns in here you'll be able to reuse for your own projects. Cannibalise away!

# How to use it

Download make-zip.php (that's all you need; everything else is a work-in-progress) and put it on a web server that has PHP. Your localhost is a good idea. No web server? Try something like [MAMP](https://mamp.info). It's super-simple to set up. Go ahead, we'll wait.

Got it? Okay.

Load up the file in your web browser, passing the theme slug as your parameter, like so:

`http://localhost:8888/folder/make-zip.php?theme=[theme-slug]`

Et voila! If everything's worked, the script will give you back a .zip containing a theme that's .org-upload-ready.

# Via the command line

To run the script from the command line, navigate to the script's containing folder and run this script:

`php make-zip.php [theme-slug]`

A zip file will be created in the same directory.

# Want to include the Jetpack Dependency Script?

Simple! Just pass an argument to the command:

`php make-zip.php [theme-slug] jetpack`

or

`http://localhost:8888/folder/make-zip.php?theme=[theme-slug]&jetpack=true`

# IMPORTANT note about child themes

**Do not** add the script to a chlid theme if it's already in the parent. 
