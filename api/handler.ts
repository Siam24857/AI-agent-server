const { app } = require('./dist/src/server');

module.exports = async function handler(req, res) {
  try {
    await app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
