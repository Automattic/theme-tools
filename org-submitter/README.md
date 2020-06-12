# .org theme directory submission tool

This is specifically designed for submitting WordPress.com themes to the WordPress.org repo. If you're not doing that, this probably won't be much use to you. That said, there may be some patterns in here you'll be able to reuse for your own projects. Cannibalise away!

## Quick Start (CLI)

1. `git clone https://github.com/Automattic/theme-tools.git`
2. `cd org-submitter`
3. `php make-zip.php theme-slug` (where `theme-slug` refers to its slug on WordPress.com)

*If you're running MacOS Catalina, you may need to [recompile php with zip support](https://stackoverflow.com/questions/58290566/install-ext-zip-for-mac). Alternatively you can run this code from a [MAMP](https://mamp.info) server:*

`http://localhost:8888/folder/make-zip.php?theme=[theme-slug]`

## How it works

The script works by downloading the theme from the WordPress.com themes gallery, stripping it of dotcom specific references, and creating a zip downloaded to your local directory.

## To include the Jetpack dependency script

`php make-zip.php [theme-slug] jetpack`

or

`http://localhost:8888/folder/make-zip.php?theme=[theme-slug]&jetpack=true`

## IMPORTANT note about child themes

**Do not** add the script to a child theme if it's already in the parent. 
