/* global importScripts, self, raml2obj, MakePromise */
try {
  importScripts('polyfills.js', 'Promise.js' , 'browser/index.js', 'raml2object.js');
  if (!self.Promise) {
    self.Promise = MakePromise(function(callback) {
      callback();
    });
  }
  importScripts('Promise-Statics.js');
} catch (e) {
  self.postMessage({
    error: true,
    message: 'Worker import error: ' + e.message
  });
}

self.onmessage = function(e) {
  try {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('raml-2-object-start');
    }
    raml2obj
    .parse(e.data.raml)
    .then(function(result) {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('raml-2-object-end');
      }
      self.postMessage({
        result: result
      });
    });
  } catch (e) {
    self.postMessage({
      error: true,
      message: 'Worker parser error: ' + e.message
    });
  }
};
