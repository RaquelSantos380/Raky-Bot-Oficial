import { OWNER_LID, PREFIX } from "../../config.js";

export default {
  name: "explodir",
  description: "Remove mensagens de um membro (só Raquel).",
  commands: ["explodir", "boom", "explosao"],
  usage: `${PREFIX}explodir @user`,
  handle: async ({ args, socket, remoteJid, userLid, sendReply, sendSuccessReact }) => {
    if (userLid !== OWNER_LID) return sendReply("👑 Apenas a dona Raquel pode usar!");

    const alvo = args[0]?.replace(/[^0-9]/g, "") + "@lid";
    if (!alvo) return sendReply("Marque alguém!");

    try {
      const msgs = await socket.loadMessages(remoteJid, 50);
      let n = 0;
      for (const m of msgs) {
        if (m.key.participant === alvo) {
          try { await socket.sendMessage(remoteJid, { delete: m.key }); n++; } catch (e) {}
        }
      }
      await sendSuccessReact();
      return sendReply(`💣 ${n} mensagens explodidas! ☁️`);
    } catch (e) {
      return sendReply("❌ Erro ao explodir.");
    }
  },
};