/* global raml2obj, self */

/**
 * Required polyfills
 * - Promise
 * - Object
 */
var Nw = {
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
      json: result.json
    });
  },

  // Reports back result to the main thread.
  reportExpandResult: function(result) {
    self.postMessage({
      error: false,
      types: result.types,
      raml: result.raml
    });
  },
  // Handler for the message event.
  messageHandler: function(e) {
    var payload = e.data.payload;
    if (!payload) {
      return Nw.reportError('Payload not set');
    }
    switch (payload) {
      case 'prepare-types':
        Nw.prepareObject(e.data.json);
        break;
      case 'expand-types':
        Nw.expandTypes(e.data.types, e.data.raml);
        break;
      case 'normalize':
        Nw.normalize(e.data.raml, e.data.types);
        break;
      default:
        return Nw.reportError('Unknown payload');
    }
  },
  // Prepares object to be expanded.
  prepareObject: function(obj) {
    var msg;
    try {
      raml2obj.prepareObject(obj, {})
      .then(function(result) {
        Nw.reportResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown prepare types error';
        return Nw.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown prepare types error';
      return Nw.reportError(msg);
    }
  },
  // Normalizes the object.
  normalize: function(raml, types) {
    var msg;
    try {
      raml2obj.normalize(raml, types, {})
      .then(function(result) {
        Nw.reportResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown normalize error';
        return Nw.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown normalize error';
      return Nw.reportError(msg);
    }
  },

  // Prepares object to be expanded.
  expandTypes: function(types, raml) {
    var msg;
    try {
      raml2obj.expandTypes(types, {})
      .then(function(result) {
        result.raml = raml;
        Nw.reportExpandResult(result);
      })
      .catch(function(cause) {
        msg = cause.message || 'Unknown expand types error';
        return Nw.reportError(msg);
      });
    } catch (e) {
      msg = e.message || 'Unknown expand types error';
      return Nw.reportError(msg);
    }
  }
};

self.onmessage = Nw.messageHandler;
