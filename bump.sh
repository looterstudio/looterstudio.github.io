#!/bin/sh
# Stamp css/js URLs with a version so browsers and GitHub Pages never serve stale files.
V=$(date +%Y%m%d%H%M)
sed -i '' -E "s#(css/main\.css)(\?v=[0-9]+)?#\1?v=$V#; s#(js/main\.js)(\?v=[0-9]+)?#\1?v=$V#; s#(js/globe\.js)(\?v=[0-9]+)?#\1?v=$V#; s#(js/pay\.js)(\?v=[0-9]+)?#\1?v=$V#" index.html
echo "assets stamped v=$V"
