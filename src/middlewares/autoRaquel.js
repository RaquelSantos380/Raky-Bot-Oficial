export async function autoRaquelHandler(socket, remoteJid, webMessage, fullMessage) {
  if (!fullMessage) return false;
  
  const msg = fullMessage.toLowerCase();
  const deveResponder = 
    msg.includes("raquel") || 
    msg.includes("62992900737");

  if (deveResponder) {
    await socket.sendMessage(remoteJid, {
      text: `🌴 *Raquel está viajando agora!*\n\nInfelizmente ela vai estar ausente por no máximo *3 dias*.\n\nAgradeço pela compreensão! 💜`,
    }, { quoted: webMessage });
    return true;
  }

  return false;
}