import fs from "fs";
import path from "path";

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

import { PREFIX } from "../../config.js";

export default {
  name: "adms",
  description: "Chama todos os administradores do grupo.",
  commands: ["adms", "admins", "admin", "staff"],
  usage: `${PREFIX}adms | mensagem (opcional)`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
    sendSuccessReact,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const admins = groupMetadata.participants.filter(
        p => p.admin === "admin" || p.admin === "superadmin"
      );

      if (admins.length === 0) {
        return sendReply("❌ Nenhum admin encontrado!");
      }

      const motivo = args.join(" ").trim() || "Um membro está solicitando a presença dos administradores!";

      const mentions = admins.map(a => a.id);
      const listaAdms = admins.map(a => `👑 @${a.id.split("@")[0]}`).join("\n");

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        text: `📢 *ATENÇÃO ADMINISTRADORES!*\n\n${listaAdms}\n\n📝 *Motivo:* ${motivo}\n\n👤 *Solicitado por:* @${userLid.split("@")[0]}`,
        mentions: [...mentions, userLid],
      });

    } catch (error) {
      await sendReply(`❌ Erro: ${error.message}`);
    }
  },
};