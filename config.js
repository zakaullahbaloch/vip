'use strict';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('Missing required environment variable: TELEGRAM_BOT_TOKEN');
}

module.exports = {
  botToken,
  ownerId: process.env.TELEGRAM_OWNER_ID || '7297849559',
  botName: process.env.BOT_NAME || 'Shahzu Vip',
};
