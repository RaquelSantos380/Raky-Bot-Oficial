import fs from "node:fs";
import { exitMessage, welcomeMessage } from "../messages.js";
import { getProfileImageData } from "../services/baileys.js";
import {
  isActiveExitGroup,
  isActiveGroup,
  isActiveWelcomeGroup,
  getWelcomeSettings,
} from "../utils/database.js";
import { extractUserLid, onlyNumbers } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";

export async function onGroupParticipantsUpdate({
  data,
  remoteJid,
  socket,
  action,
}) {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    if (!isActiveGroup(remoteJid)) {
      return;
    }

    const userLid = extractUserLid(data);

    if (isActiveWelcomeGroup(remoteJid) && action === "add") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userLid
      );

      const settings = getWelcomeSettings(remoteJid);
      
      let messageTemplate = settings?.message || welcomeMessage;
      
      if (settings?.message) {
        const userName = userLid.split("@")[0];
        messageTemplate = messageTemplate
          .replace(/{user}/g, `@${userName}`)
          .replace(/{name}/g, `@${userName}`)
          .replace(/{group}/g, `este grupo`)
          .replace(/{members}/g, "muitos");
      }
      
      const mentions = [];
      let finalWelcomeMessage = messageTemplate;

      if (messageTemplate.includes("@member")) {
        const userName = userLid.split("@")[0];
        finalWelcomeMessage = messageTemplate.replace("@member", `@${userName}`);
        mentions.push(userLid);
      } else if (messageTemplate.includes("{user}")) {
        const userName = userLid.split("@")[0];
        finalWelcomeMessage = messageTemplate.replace(/{user}/g, `@${userName}`);
        mentions.push(userLid);
      }

      const customImage = settings?.image || null;

      if (customImage) {
        try {
          const imageBuffer = Buffer.from(customImage, "base64");
          await socket.sendMessage(remoteJid, {
            image: imageBuffer,
            caption: finalWelcomeMessage,
            mentions,
          });
        } catch (imageError) {
          if (buffer) {
            await socket.sendMessage(remoteJid, {
              image: buffer,
              caption: finalWelcomeMessage,
              mentions,
            });
          } else {
            await socket.sendMessage(remoteJid, {
              text: finalWelcomeMessage,
              mentions,
            });
          }
        }
      } else if (buffer) {
        try {
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalWelcomeMessage,
            mentions,
          });
        } catch (error) {
          await socket.sendMessage(remoteJid, {
            text: finalWelcomeMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          text: finalWelcomeMessage,
          mentions,
        });
      }

      // ENVIA AS REGRAS COMO SEGUNDA MENSAGEM
      if (settings?.rules) {
        let rulesMessage = settings.rules;
        const userName = userLid.split("@")[0];
        
        if (rulesMessage.includes("{user}")) {
          rulesMessage = rulesMessage.replace(/{user}/g, `@${userName}`);
        }
        if (rulesMessage.includes("{group}")) {
          rulesMessage = rulesMessage.replace(/{group}/g, `este grupo`);
        }
        if (rulesMessage.includes("{members}")) {
          rulesMessage = rulesMessage.replace(/{members}/g, "muitos");
        }

        await socket.sendMessage(remoteJid, {
          text: rulesMessage,
          mentions,
        });
      }

      if (buffer && profileImage && !profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    } else if (isActiveExitGroup(remoteJid) && action === "remove") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userLid
      );

      const hasMemberMention = exitMessage.includes("@member");
      const mentions = [];
      let finalExitMessage = exitMessage;

      if (hasMemberMention) {
        const userName = userLid.split("@")[0];
        finalExitMessage = exitMessage.replace("@member", `@${userName}`);
        mentions.push(userLid);
      }

      if (buffer) {
        try {
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalExitMessage,
            mentions,
          });
        } catch (error) {
          await socket.sendMessage(remoteJid, {
            text: finalExitMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          text: finalExitMessage,
          mentions,
        });
      }

      if (buffer && profileImage && !profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    }
  } catch (error) {
    errorLog(`Erro em onGroupParticipantsUpdate: ${error.message}`);
    errorLog(JSON.stringify(error, null, 2));
  }
}
