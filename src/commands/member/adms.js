import fs from "fs";
import path from "path";
import { PREFIX, BOT_LID } from "../../config.js";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");

function isModoBrincadeiraAtivo(remoteJid) {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) {
      const config = JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
      return !!config[remoteJid];
    }
  } catch (e) {}
  return false;
}

export default {
  name: "adms",
  description: "Chama administradores (só onde o bot é admin).",
  commands: ["adms", "admins", "admin", "staff"],
  usage: `${PREFIX}adms | mensagem`,

  handle: async ({ args, remoteJid, userLid, socket, sendReply, sendSuccessReact }) => {
    try {
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const botNoGrupo = groupMetadata.participants.find(p => p.id === BOT_LID);
      const botIsAdmin = botNoGrupo?.admin === "admin" || botNoGrupo?.admin === "superadmin";

      if (!botIsAdmin) {
        return; // Ignora se o bot não for admin
      }

      const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
      if (admins.length === 0) return;

      const motivo = args.join(" ").trim() || "Um membro está solicitando a presença dos administradores!";
      const mentions = admins.map(a => a.id);
      const listaAdms = admins.map(a => `👑 @${a.id.split("@")[0]}`).join("\n");

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        text: `📢 *ATENÇÃO ADMINISTRADORES!*\n\n${listaAdms}\n\n📝 *Motivo:* ${motivo}\n\n👤 *Solicitado por:* @${userLid.split("@")[0]}`,
        mentions: [...mentions, userLid],
      });
    } catch (error) {}
  },
};
