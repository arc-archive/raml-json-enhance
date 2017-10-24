export PATH=./node_modules/.bin:$PATH
mkdir -p build

function ugly() {
  echo  `uglifyjs -c --screw-ie8 $1`
}

function compileRaml2obj() {
  browserify node_modules/raml2obj/browser.js -o build/browserified.js --ignore datatype-expansion
  babel build/browserified.js > build/babeled.js
  ugly "build/babeled.js"
}

function compileWorker() {
  babel --plugins minify-mangle-names lib/normalize-worker.js > build/normalize-worker.js
  ugly "build/normalize-worker.js"
}

# First build the expnasion library, browser version.
rm -rf build/*

contents=()
contents[0]=$(ugly "lib/polyfills.js")
# contents[1]=$(ugly "bower_components/promise-polyfill/Promise.js")
contents[1]=`cat ./node_modules/datatype-expansion/dist/datatype-expansion.js`
contents[2]=$(compileRaml2obj)
# contents[4]=$(ugly "lib/init-script.js")
# contents[5]=$(ugly "bower_components/promise-polyfill/Promise-Statics.js")
contents[3]=$(compileWorker)

content=""
for data in "${contents[@]}"
do
  content=$(printf "%s\n%s" "${content}" "${data}")
done;

# content="${contents[0]contents[1]}"

# echo ${content:0:300}

# Saves template data into the final build
template=`cat raml-json-enhance-template.html`
echo "${template/\{\{RAML2OBJ_CONTENT\}\}/$content}" > ./raml-json-enhance.html
echo "Build complete."