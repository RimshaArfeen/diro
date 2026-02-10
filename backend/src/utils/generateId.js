const crypto = require('crypto');

const generateId = (prefix) => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = generateId;
