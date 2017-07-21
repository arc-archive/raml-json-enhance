/* global raml2obj, self */

/**
 * Required polyfills
 * - Promise
 * - Object
 */
var RAMLnormalizer = {
  // Reports an error to the main thread.
  reportError: function(message) {
    self.postMessage({
      error: true,
      message: message
    });
  },
  // Reports back result to the main thread.
  reportResult: function(result) {
    self.postMessage({
      error: false,
      json: result.json,
      analyser: result.analyser || []
    });
  },

  // Reports back result to the main thread.
  reportExpandResult: function(result) {
    self.postMessage({
      error: false,
      types: result.types,
      raml: result.raml,
      analyser: result.analyser || []
    });
  },
  // Handler for the message event.
  messageHandler: function(e) {
    var payload = e.data.payload;
    if (!payload) {
      return RAMLnormalizer.reportError('Payload not set');
    }
    switch (payload) {
      case 'prepare-types':
        RAMLnormalizer.prepareObject(e.data.json, e.data.analyze);
        break;
      case 'expand-types':
        RAMLnormalizer.expandTypes(e.data.types, e.data.analyze, e.data.raml);
        break;
      case 'normalize':
        RAMLnormalizer.normalize(e.data.raml, e.data.types, e.data.analyze);
        break;
      default:
        return RAMLnormalizer.reportError('Unknown payload');
    }
  },
  // Prepares object to be expanded.
  prepareObject: function(obj, analyze) {
    var msg;
    try {
      var opts = {
        analyze: analyze
      };
      raml2obj.prepareObject(obj, opts)
      .then(function(result) {
        RAMLnormalizer.reportResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown prepare types error';
        return RAMLnormalizer.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown prepare types error';
      return RAMLnormalizer.reportError(msg);
    }
  },
  // Normalizes the object.
  normalize: function(raml, types, analyze) {
    var msg;
    try {
      var opts = {
        analyze: analyze
      };
      raml2obj.normalize(raml, types, opts)
      .then(function(result) {
        RAMLnormalizer.reportResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown normalize error';
        return RAMLnormalizer.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown normalize error';
      return RAMLnormalizer.reportError(msg);
    }
  },

  // Prepares object to be expanded.
  expandTypes: function(types, analyze, raml) {
    var msg;
    try {
      var opts = {
        analyze: analyze
      };
      raml2obj.expandTypes(types, opts)
      .then(function(result) {
        result.raml = raml;
        RAMLnormalizer.reportExpandResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown expand types error';
        return RAMLnormalizer.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown expand types error';
      return RAMLnormalizer.reportError(msg);
    }
  }
};

self.onmessage = RAMLnormalizer.messageHandler;
