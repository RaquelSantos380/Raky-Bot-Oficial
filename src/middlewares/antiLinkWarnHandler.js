import { isLink } from "./index.js";
import { isActiveAntiLinkWarn, addLinkWarn, getLinkWarns } from "../utils/database.js";

export async function antiLinkWarnHandler(socket, remoteJid, userLid, webMessage, text) {
  if (!isActiveAntiLinkWarn(remoteJid)) return false;
  if (!text || !isLink(text)) return false;

  // Remove o link
  try {
    await socket.sendMessage(remoteJid, {
      delete: webMessage.key,
    });
  } catch (e) {}

  // Adiciona aviso
  const warnCount = addLinkWarn(remoteJid, userLid);

  if (warnCount >= 3) {
    // BAN
    try {
      await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");
    } catch (e) {}
    return true;
  }

  // Envia aviso
  const warnings = {
    1: "⚠️ Cuidado ao enviar links! (1/3)",
    2: "⚠️ Segundo aviso! Não envie links! (2/3)",
  };

  await socket.sendMessage(remoteJid, {
    text: `${warnings[warnCount] || "⚠️ Aviso!"}\n@${userLid.split("@")[0]} você tem ${warnCount}/3 avisos. No 3º será BANIDO!`,
    mentions: [userLid],
  });

  return true;
}