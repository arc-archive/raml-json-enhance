/* global raml2obj, self */
self.onmessage = function(e) {
  try {
    raml2obj
    .parse(e.data.raml)
    .then(function(result) {
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
