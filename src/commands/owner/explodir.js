import { OWNER_LID, PREFIX } from "../../config.js";

export default {
  name: "explodir",
  description: "Mensagem explosiva (só Raquel).",
  commands: ["explodir", "boom"],
  usage: `${PREFIX}explodir @user`,
  handle: async ({ args, socket, remoteJid, userLid, sendReply, sendSuccessReact }) => {
    if (userLid !== OWNER_LID) return sendReply("👑 Apenas a dona Raquel pode usar!");

    const numero = args[0]?.replace(/[^0-9]/g, "");
    if (!numero) return sendReply("Marque alguém!");

    try {
      // Envia várias mensagens de exclusão para "explodir" as últimas mensagens
      let n = 0;
      for (let i = 0; i < 10; i++) {
        try {
          // Gera um timestamp fake para tentar apagar mensagens recentes
          await socket.sendMessage(remoteJid, { 
            delete: { 
              remoteJid, 
              fromMe: false, 
              id: `FAKE_${Date.now()}_${i}`,
              participant: numero + "@lid"
            } 
          });
          n++;
        } catch (e) {}
        await new Promise(r => setTimeout(r, 200));
      }

      await sendSuccessReact();
      return sendReply(`💣 *EXPLOSÃO!*\n\n👤 @${numero} foi explodido(a)!\n🗑️ Tentando vaporizar mensagens... ☁️`);
    } catch (e) {
      return sendReply(`❌ Erro: ${e.message}`);
    }
  },
};