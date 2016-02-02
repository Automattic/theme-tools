# Theme Tags

This script works on a group of themes (specified via a theme list file), querying or updating theme tags.

## Install

Dependencies can be installed using `npm install`

You can call this script using `node` directly.

For better usage, a command line alias can also be created:

```alias theme-tags='node <path>/theme-tools/theme-tags/theme-tags.js'```

## Usage Notes

The script works with a list of theme directories provided in a text file, which it will use when adding or removing tags from a group of themes. You can specify the list file using the `--list` option.

To query all the themes in a given directory, you can use the `--show <tag>` and `--without <tag>` options to display the themes using the specified tag.

> When <u>adding</u> tags, only themes that _do not have the tag_ are updated.<br/>
> When <u>removing</u> tags, only themes that _have the tag_ are updated.

By default, changes are not committed to disk. In order to fully execute the commands and affect the specified files in the file system, you must pass the `--confirm` option to the `--add` and `--remove` commands.

## Options

```
Usage: theme-tags [options] <directory>
       theme-tags --add <tag> --list <file> [--confirm] <directory>
       theme-tags --remove <tag> --list <file> [--confirm] <directory>
       theme-tags --show <tag> <directory>
       theme-tags --without <tag> <directory>

Options:

-a, --add      Add a tag to the themes list
-r, --remove   Remove a tag from the themes list
-c, --confirm  Comfirm changes to disk
-l, --list     Text file containing theme slugs
-s, --show	   Show themes using tag
-w, --without  Show themes not using tag
-h, --help     Display help information
```
