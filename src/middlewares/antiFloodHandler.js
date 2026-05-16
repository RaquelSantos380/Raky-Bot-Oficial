import {
  isActiveAntiFlood,
  getFloodConfig,
  addFloodMessage,
  clearFloodMessages,
  muteMember,
  unmuteMember,
} from "../utils/database.js";

export async function antiFloodHandler(socket, remoteJid, userLid, webMessage) {
  if (!isActiveAntiFlood(remoteJid)) return false;

  const config = getFloodConfig(remoteJid) || { maxMessages: 10, muteSeconds: 20 };
  const count = addFloodMessage(remoteJid, userLid);

  if (count >= config.maxMessages) {
    // Remove as mensagens do flood
    try {
      await socket.sendMessage(remoteJid, {
        delete: webMessage.key,
      });
    } catch (e) {}

    // Mute o usuário
    muteMember(remoteJid, userLid);

    // Envia aviso
    await socket.sendMessage(remoteJid, {
      text: `🌊 @${userLid.split("@")[0]} não flode! Você foi silenciado por ${config.muteSeconds} segundos.`,
      mentions: [userLid],
    });

    // Desmute após o tempo
    setTimeout(() => {
      try {
        unmuteMember(remoteJid, userLid);
      } catch (e) {}
    }, config.muteSeconds * 1000);

    clearFloodMessages(remoteJid, userLid);
    return true;
  }

  return false;
}