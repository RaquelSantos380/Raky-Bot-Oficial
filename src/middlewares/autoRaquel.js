export async function autoRaquelHandler(socket, remoteJid, webMessage, fullMessage) {
  if (!fullMessage) return false;
  
  const msg = fullMessage.toLowerCase();

  if (msg.includes("raquel")) {
    await socket.sendMessage(remoteJid, {
      text: `🌴 *Raquel está viajando agora!*\n\nInfelizmente ela vai estar ausente por no máximo *2 dias*.\n\nAgradeço pela compreensão! 💜`,
    }, { quoted: webMessage });
    return true;
  }

  return false;
}