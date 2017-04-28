/* global raml2obj, self */

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
