if (!self.Promise) {
  self.Promise = MakePromise(function(c) {
    c();
  });
}
