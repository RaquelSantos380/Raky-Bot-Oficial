import { OWNER_LID, PREFIX } from "../../config.js";

export default {
  name: "salvar-raquel",
  description: "Raquel recupera admin.",
  commands: ["salvarraquel", "sr"],
  usage: `${PREFIX}salvarraquel`,

  handle: async ({ socket, remoteJid, userLid, sendReply, sendSuccessReact }) => {
    if (userLid !== OWNER_LID) {
      return sendReply("❌ Comando restrito!");
    }

    try {
      await socket.groupParticipantsUpdate(remoteJid, [OWNER_LID], "promote");
      await sendSuccessReact();
      await sendReply("👑 Pronto! Você voltou a ser admin!");
    } catch (e) {
      await sendReply("❌ Erro: " + e.message);
    }
  },
};