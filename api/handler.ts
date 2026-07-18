module.exports = function handler(req, res) {
  const { app } = require('./dist/src/server');
  app(req, res);
}
