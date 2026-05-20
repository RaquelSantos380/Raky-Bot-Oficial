import { OWNER_LID, PREFIX } from "../../config.js";

export default {
  name: "explodir",
  description: "Remove mensagens recentes de um membro (só Raquel).",
  commands: ["explodir", "boom", "explosao"],
  usage: `${PREFIX}explodir @user`,
  handle: async ({ args, socket, remoteJid, userLid, sendReply, sendSuccessReact }) => {
    if (userLid !== OWNER_LID) return sendReply("👑 Apenas a dona Raquel pode usar!");

    const numero = args[0]?.replace(/[^0-9]/g, "");
    if (!numero) return sendReply("Marque alguém!");

    const alvo = numero + "@lid";

    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => p.id === alvo);
      const nome = participant?.notify || participant?.name || numero;

      // Tenta buscar e apagar mensagens
      let deletadas = 0;
      const mensagens = await socket.loadMessages(remoteJid, 25);
      
      for (const msg of mensagens) {
        if (msg.key.participant === alvo) {
          try {
            await socket.sendMessage(remoteJid, { delete: msg.key });
            deletadas++;
            await new Promise(r => setTimeout(r, 300));
          } catch (e) {}
        }
      }

      await sendSuccessReact();

      if (deletadas === 0) {
        return sendReply(`💣 Nenhuma mensagem recente de @${numero} encontrada!`);
      }

      return sendReply(
        `💣 *EXPLOSÃO!*\n\n` +
        `👤 @${numero} foi explodido(a)!\n` +
        `🗑️ ${deletadas} mensagens vaporizadas! ☁️`
      );
    } catch (e) {
      return sendReply(`❌ Erro ao explodir: ${e.message}`);
    }
  },
};