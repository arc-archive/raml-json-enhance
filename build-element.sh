export PATH=./node_modules/.bin:$PATH
mkdir -p build

function ugly() {
  echo  `uglifyjs -c --screw-ie8 $1`
}

function compileExpander() {
  local basePath=`pwd`
  projectClj=`cat lib/project.clj`
  cd ./node_modules/datatype-expansion/
  # temporary fix until next expansion library release.
  echo ${projectClj} > project.clj
  rm -rf browser/*
  lein cljsbuild once browser
  cp -R browser "${basePath}/build/"
  cd $basePath
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
compileExpander || exit 1

contents=()
contents[0]=$(ugly "lib/polyfills.js")
contents[1]=$(ugly "bower_components/promise-polyfill/Promise.js")
contents[2]=`cat build/browser/index.js`
contents[3]=$(compileRaml2obj)
contents[4]=$(ugly "lib/init-script.js")
contents[5]=$(ugly "bower_components/promise-polyfill/Promise-Statics.js")
contents[6]=$(compileWorker)

# Concatenates all the files. Adds the ";" between each file.
content=""
for data in "${contents[@]}"
do
  content="${content};${data}"
done;

# Saves template data into the final build
template=`cat raml-json-enhance-template.html`
echo "${template/\{\{RAML2OBJ_CONTENT\}\}/$content}" > ./raml-json-enhance.html
