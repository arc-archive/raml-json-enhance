const browserify = require('browserify');
const UglifyJS = require('uglify-js');
const fs = require('fs-extra');
const babel = require('@babel/core');

function nodeToBrowser(file, ignore) {
  return new Promise((resolve) => {
    const b = browserify();
    b.add(file);
    if (ignore) {
      b.ignore(ignore);
    }
    b.bundle((err, buf) => {
      if (err) {
        console.log(err);
      }
      resolve(buf.toString());
    });
  });
}

function uglyContent(content) {
  const result = UglifyJS.minify(content, {
    compress: true
  });
  if (result.error) {
    throw result.error;
  }
  return result.code;
}

function uglyFile(file) {
  return fs.readFile(file, 'utf8')
  .then((content) => uglyContent(content));
}

function babelify(code) {
  return new Promise((resolve, reject) => {
    const cnf = {
      'presets': [[
        '@babel/preset-env'
      ]],
      'plugins': ['minify-mangle-names']
    };
    babel.transform(code, cnf, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.code);
      }
    });
  });
}

function compileDatatype() {
  return nodeToBrowser('lib/datatype-lib.js')
  .then((code) => babelify(code))
  .then((content) => uglyContent(content));
}

function compileRaml2obj() {
  return nodeToBrowser('node_modules/raml2obj/browser.js', 'datatype-expansion')
  .then((code) => babelify(code))
  .then((content) => uglyContent(content));
}

function compileWorker() {
  return fs.readFile('lib/normalize-worker.js', 'utf8')
  .then((content) => babelify(content))
  .then((content) => uglyContent(content));
}

function build() {
  let result;
  return uglyFile('lib/polyfills.js')
  .then((data) => {
    result = data;
    return uglyFile('bower_components/promise-polyfill/Promise.js');
  })
  .then((data) => {
    result += '\n' + data;
    return compileDatatype();
  })
  .then((data) => {
    result += '\n' + data;
    return compileRaml2obj();
  })
  .then((data) => {
    result += '\n' + data;
    return uglyFile('lib/init-script.js');
  })
  .then((data) => {
    result += '\n' + data;
    return uglyFile('bower_components/promise-polyfill/Promise-Statics.js');
  })
  .then((data) => {
    result += '\n' + data;
    return compileWorker();
  })
  .then((data) => {
    result += '\n' + data;
    return fs.readFile('raml-json-enhance-template.html', 'utf8');
  })
  .then((content) => {
    content = content.replace('{{RAML2OBJ_CONTENT}}', result);
    return fs.writeFile('raml-json-enhance.html', content, 'utf8');
  });
}

build()
.then((result) => {
  console.log(result);
  console.log('Completed');
})
.catch((cause) => console.error(cause));
