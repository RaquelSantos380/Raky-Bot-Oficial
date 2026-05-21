import { DEVELOPER_MODE, OWNER_LID } from "../config.js";
import { badMacHandler } from "../utils/badMacHandler.js";
import { checkIfMemberIsMuted } from "../utils/database.js";
import { dynamicCommand } from "../utils/dynamicCommand.js";
import {
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
  isAtLeastMinutesInPast,
} from "../utils/index.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";
import { errorLog, infoLog } from "../utils/logger.js";
import { antiFloodHandler } from "./antiFloodHandler.js";
import { antiLinkWarnHandler } from "./antiLinkWarnHandler.js";
import { blacklistHandler } from "./blacklistHandler.js";
import { blockWordHandler } from "./blockWordHandler.js";
import { customMiddleware } from "./customMiddleware.js";
import { messageHandler } from "./messageHandler.js";
import { onGroupParticipantsUpdate } from "./onGroupParticipantsUpdate.js";
import { protegerRaquel } from "./protegerRaquel.js";
import fs from "fs";
import path from "path";

const DITADURA_FILE = path.resolve("database", "ditadura.json");

function isDitadura(remoteJid) {
  try {
    if (fs.existsSync(DITADURA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DITADURA_FILE, "utf8"));
      return !!data[remoteJid];
    }
  } catch (e) {}
  return false;
}

export async function onMessagesUpsert({ socket, messages, startProcess }) {
  if (!messages.length) return;

  for (const webMessage of messages) {
    if (DEVELOPER_MODE) {
      infoLog(`\n\n⪨========== [ MENSAGEM RECEBIDA ] ==========⪩ \n\n${JSON.stringify(messages, null, 2)}`);
    }

    try {
      const timestamp = webMessage.messageTimestamp;

      if (webMessage?.message) {
        messageHandler(socket, webMessage);
      }

      if (isAtLeastMinutesInPast(timestamp)) continue;

      // ENTRADA/SAÍDA
      if (isAddOrLeave.includes(webMessage.messageStubType)) {
        let action = "";
        if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) action = "add";
        else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) action = "remove";

        if (action === "add") {
          const userLid = webMessage.messageStubParameters[0];
          const remoteJid = webMessage.key.remoteJid;
          await blacklistHandler(socket, remoteJid, userLid, null);
        }

        await protegerRaquel(socket, webMessage.key.remoteJid);
        await customMiddleware({
          socket, webMessage, type: "participant", action,
          data: webMessage.messageStubParameters[0], commonFunctions: null,
        });

        await onGroupParticipantsUpdate({
          data: webMessage.messageStubParameters[0],
          remoteJid: webMessage.key.remoteJid, socket, action,
        });

        return;
      }

      const userLid = webMessage?.key?.participant?.replace(/:[0-9][0-9]|:[0-9]/g, "");
      const remoteJid = webMessage?.key?.remoteJid;

      // 👑 MODO DITADURA
      if (isDitadura(remoteJid) && userLid !== OWNER_LID && userLid !== webMessage?.key?.remoteJid) {
        try {
          await socket.sendMessage(remoteJid, { delete: webMessage.key });
        } catch (e) {}
        return;
      }

      if (checkIfMemberIsMuted(remoteJid, userLid)) {
        try {
          const { id, participant } = webMessage.key;
          await socket.sendMessage(remoteJid, { delete: { remoteJid, fromMe: false, id, participant } });
        } catch (error) {
          errorLog(`Erro ao deletar mensagem de membro silenciado: ${error.message}`);
        }
        return;
      }

      const commonFunctions = loadCommonFunctions({ socket, webMessage });
      if (!commonFunctions) continue;

      if (userLid && remoteJid) {
        const flooded = await antiFloodHandler(socket, remoteJid, userLid, webMessage);
        if (flooded) return;
      }

      if (userLid && remoteJid && commonFunctions.fullMessage) {
        const wordBlocked = await blockWordHandler(socket, remoteJid, userLid, webMessage, commonFunctions.fullMessage);
        if (wordBlocked) return;
      }

      if (userLid && remoteJid && commonFunctions.fullMessage) {
        const linkBlocked = await antiLinkWarnHandler(socket, remoteJid, userLid, webMessage, commonFunctions.fullMessage);
        if (linkBlocked) return;
      }

      await customMiddleware({ socket, webMessage, type: "message", commonFunctions });
      await dynamicCommand(commonFunctions, startProcess);

    } catch (error) {
      if (badMacHandler.handleError(error, "message-processing")) continue;
      if (badMacHandler.isSessionError(error)) {
        errorLog(`Erro de sessão ao processar mensagem: ${error.message}`);
        continue;
      }
      errorLog(`Erro ao processar mensagem: ${error.message} | Stack: ${error.stack}`);
      continue;
    }
  }
}