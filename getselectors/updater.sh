#!/usr/bin/env bash

###################################
## getselectors – Updater script ##
###################################

REPO="https://github.com/Automattic/theme-tools"
CWD=$(basename `pwd`)

# Ensure the updater is called outside the directory
if [ -f getselectors.js ]; then
	echo "The updater script needs to run outside of the installation directory."
	exit 1
fi

DIR=$(dirname $0)
DIRTMP="${DIR}.tmp"
WORKDIR="work"

echo -e "\n# Cloning updated repository\n"
git clone --depth=1 $REPO $DIR/$WORKDIR
mv $DIR $DIRTMP
mv $DIRTMP/work/getselectors $DIR
rm -Rf $DIRTMP

echo -e "\n# Downloading dependencies\n"
cd $DIR; npm install

echo -e "\n# Done!\n"