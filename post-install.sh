./node_modules/.bin/bower install
./node_modules/.bin/polymer build
cp build/bundled/index.html views/homepage.ejs
echo "BUILD SUCESS"