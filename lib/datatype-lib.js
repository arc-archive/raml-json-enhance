const dt = require('../node_modules/datatype-expansion/src/index.js');
/* global self */
if (typeof window === 'undefined') {
  // Web worker environment.
  self.expansion = dt;
} else {
  window.expansion = dt;
}
