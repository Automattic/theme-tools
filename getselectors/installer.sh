#!/usr/bin/env bash

########################################
## getselectors – Installation script ##
########################################

DIR="getselectors"
WORKDIR="work"
REPO="https://github.com/Automattic/theme-tools"

# When forcing reinstall, remove work directories
if [[ $* == *-f* ]] || [[ $* == *--force* ]]; then
	rm -Rf $DIR
	rm -Rf $WORKDIR

# Otherwise, then check if files exist and suggest --force
elif [ -d $DIR ] || [ -d $WORKDIR ]; then
	echo "The tool seems to be installed on this location."
	echo "To force install, use ./installer.sh --force"
	exit 1
fi

# All is good at this point, proceed
echo -e "\n# Cloning repository\n"
git clone --depth=1 $REPO work
mv $WORKDIR/${DIR} .
rm -Rf $WORKDIR

# Downloading dependencies
echo -e "\n# Downloading dependencies\n"
cd $DIR
npm install

# Done
echo -e "\n# Done!\n"