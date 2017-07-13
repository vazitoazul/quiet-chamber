./node_modules/.bin/bower install
./node_modules/.bin/polymer build
cp build/bundled/index.html views/homepage.ejs
cp ALFAcoins_5967e16c1c01e5967e16c1c0545967e16c1c089.txt build/bundled/ALFAcoins_5967e16c1c01e5967e16c1c0545967e16c1c089.txt
echo "BUILD SUCESS"
