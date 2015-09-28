# An Automattic tool

Want to submit your theme to WordPress.org, but you're frustrated by all the little steps? Never fear! Use this script and be free. 

# How to use it

Download make-zip.php (that's all you need) and put it on a web server that has PHP. Your localhost is a good idea. No web server? Try something like [MAMP](https://mamp.info). It's super-simple to set up. Go ahead, we'll wait. 

Got it? Okay. 

Load up the file in your web browser, passing the theme slug as your parameter, like so: 

`http://localhost:8888/folder/make-zip.php?theme=[theme-slug]`

Et voila! If everything's worked, the script will give you back a .zip containing a theme that's .org-upload-ready. 
