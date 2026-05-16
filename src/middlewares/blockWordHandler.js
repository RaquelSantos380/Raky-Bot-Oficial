import { isActiveBlockWords, getBlockedWords } from "../utils/database.js";

export async function blockWordHandler(socket, remoteJid, userLid, webMessage, text) {
  if (!isActiveBlockWords(remoteJid)) return false;
  if (!text) return false;

  const words = getBlockedWords(remoteJid);
  const lowerText = text.toLowerCase();

  for (const word of words) {
    if (lowerText.includes(word)) {
      try {
        await socket.sendMessage(remoteJid, {
          delete: webMessage.key,
        });
      } catch (e) {}
      return true;
    }
  }

  return false;
}