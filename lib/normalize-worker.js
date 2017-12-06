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
      result: result
    });
  },
  // Handler for the message event.
  messageHandler: function(e) {
    var payload = e.data.payload;
    if (!payload) {
      return Nw.reportError('Payload not set');
    }
    switch (payload) {
      case 'parse':
        Nw.parseObject(e.data);
        break;
      default:
        return Nw.reportError('Unknown payload');
    }
  },
  // Prepares object to be expanded.
  parseObject: function(data) {
    var msg;
    try {
      raml2obj.parse(data)
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
  }
};

self.onmessage = Nw.messageHandler;
