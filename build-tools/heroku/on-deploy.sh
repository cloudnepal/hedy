#!/bin/bash
#----------------------------------------------------------------------
#
# Build script that gets run when the app is deployed to Heroku.
#
# Performs some build/compilation/optimization steps that are necessary
# for deploying an efficient application, and do it always so developers
# don't have to remember to do it before committing.
#
#----------------------------------------------------------------------
#
# This build script requires that the 'heroku/nodejs' buildpack has been added
# to the application, and is driven from '../package.json'.
#
#----------------------------------------------------------------------
set -eu
scriptdir=$(cd $(dirname $0) && pwd)
cd $scriptdir

./generate-grammars-and-js

# Do a minimizing build of Tailwind. Generates the tailwind css, and strip
# all CSS classes that aren't used in our application (determined by searching
# for CSS classes in the HTML templates and JavaScript files).

echo '-----> Doing a Tailwind build'
tailwind/generate-css

echo '-----> Compiling Babel translations'
(cd ../.. && pybabel compile -f -d translations)

echo '-----> Generating static Babel content'
./generate-static-babel-content
