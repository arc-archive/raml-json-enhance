export PATH=./node_modules/.bin:$PATH

browserify node_modules/raml2obj/browser.js -o build/browserified.js --ignore datatype-expansion
babel build/browserified.js > build/babeled.js
uglifyjs -c --screw-ie8 build/babeled.js > build/raml2object.js
uglifyjs -c --screw-ie8 lib/polyfills.js > build/polyfills.js
uglifyjs -c --screw-ie8 bower_components/promise-polyfill/Promise.js > build/Promise.js
uglifyjs -c --screw-ie8 bower_components/promise-polyfill/Promise-Statics.js > build/Promise-Statics.js
babel --plugins minify-mangle-names lib/normalize-worker.js > build/normalize-worker-babeled.js
uglifyjs -c --screw-ie8 build/normalize-worker-babeled.js > build/normalize-worker.js
node build-element.js
