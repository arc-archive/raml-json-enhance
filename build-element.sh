./node_modules/.bin/browserify node_modules/raml2obj/browser.js -o build/browserified.js --ignore datatype-expansion
./node_modules/.bin/babel build/browserified.js > build/babeled.js
./node_modules/.bin/uglifyjs -c --screw-ie8 build/babeled.js > build/raml2object.js
./node_modules/.bin/uglifyjs -c --screw-ie8 lib/polyfills.js > build/polyfills.js
./node_modules/.bin/uglifyjs -c --screw-ie8 bower_components/promise-polyfill/Promise.js > build/Promise.js
./node_modules/.bin/uglifyjs -c --screw-ie8 bower_components/promise-polyfill/Promise-Statics.js > build/Promise-Statics.js
./node_modules/.bin/uglifyjs -c --screw-ie8 normalize-worker.js > build/normalize-worker.js
node build-element.js
