/* jshint esnext: true */
const fs = require('fs');

class Builder {
  constructor() {
    this.workerFiles = [
      'build/polyfills.js',
      'build/Promise.js',
      'browser/index.js',
      'build/raml2object.js'
    ];
    this.initScript = 'if(!self.Promise){self.Promise=MakePromise(function(c){c()})}';
    this.postInitFiles = [
      'build/Promise-Statics.js',
      'build/normalize-worker.js'
    ];
  }

  build() {
    return this.getcontents()
    .then((list) => {
      this.contentData = list;
    })
    .then(() => this._buildContent())
    .then((content) => this._buildTemplate(content));
  }

  getcontents() {
    var sources = [].concat(this.workerFiles, this.postInitFiles);
    sources = sources.map((item) => {
      return {
        file: item
      };
    });
    return this._getFileContent(sources);
  }

  _getFileContent(source, index) {
    index = index || 0;

    if (source.length <= index) {
      return source;
    }

    var p = new Promise((resolve, reject) => {
      var filename = source[index].file;
      fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(data);
      });
    });

    return p.then((data) => {
      source[index].content = data;
      index++;
      return this._getFileContent(source, index);
    });
  }

  _buildContent() {
    var data = this.contentData;
    var content = '';
    var len = data.length;
    this.workerFiles.forEach((file) => {
      for (let i = 0; i < len; i++) {
        if (data[i].file === file) {
          content += data[i].content + ';';
          return;
        }
      }
    });
    content += this.initScript;
    this.postInitFiles.forEach((file) => {
      for (let i = 0; i < len; i++) {
        if (data[i].file === file) {
          content += data[i].content + ';';
          return;
        }
      }
    });
    return content;
  }

  _buildTemplate(content) {
    return new Promise((resolve, reject) => {
      fs.readFile('raml-json-enhance-template.html', 'utf8', (err, data) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
        data = data.replace('{{RAML2OBJ_CONTENT}}', content);
        fs.writeFile('raml-json-enhance.html', data, 'utf8', function() {
          resolve();
        });
      });
    });
  }
}

var builder = new Builder();
builder.build()
.then(() => console.log('build complete'))
.catch((e) => console.error('Build error', e));
