const crypto = require('crypto');

const downloadTokens = new Map();

function generateDownloadToken(fileId) {
  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  downloadTokens.set(token, { fileId, expires });
  return token;
}

function downloadAuth(req, res, next) {
  const { token } = req.query;
  if (!token) {
    return res.status(401).send('Download token required.');
  }

  const tokenData = downloadTokens.get(token);
  if (!tokenData) {
    return res.status(403).send('Invalid download token.');
  }

  if (tokenData.expires < Date.now()) {
    downloadTokens.delete(token);
    return res.status(403).send('Download token expired.');
  }

  // You can add more checks here, e.g., if the user has permission to download the file

  downloadTokens.delete(token); // One-time use token
  next();
}

module.exports = { generateDownloadToken, downloadAuth };
