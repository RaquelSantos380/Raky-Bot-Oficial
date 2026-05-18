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
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "pensao",
  description: "Cobra pensão de um membro marcado 😂",
  commands: ["pensao", "cobrar", "pensão"],
  usage: `${PREFIX}pensao | @membro | motivo`,

  handle: async ({ args, sendReply, sendErrorReply, sendSuccessReact, remoteJid, socket, userLid }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const groupMetadata = await socket.groupMetadata(remoteJid);
        const participant = groupMetadata.participants.find(p => p.id === userLid);
        const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        if (!isAdmin) {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const alvo = args[0];
      const motivo = args.slice(1).join(" ").trim() || "abandono afetivo";

      if (!alvo) throw new InvalidParameterError("Marque alguém!\nEx: `" + PREFIX + "pensao | @joao`");

      const numeroLimpo = alvo.replace(/[^0-9]/g, "");
      const alvoLid = numeroLimpo + "@lid";
      const valor = (Math.random() * 5000 + 500).toFixed(2);
      const dias = Math.floor(Math.random() * 365) + 1;

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        text: `⚖️ *COBRANÇA DE PENSÃO*\n\n` +
              `👤 *Requerido:* @${numeroLimpo}\n` +
              `📋 *Motivo:* ${motivo}\n` +
              `💔 *Abandono:* ${dias} dias\n` +
              `💰 *Valor:* R$ ${valor}\n\n` +
              `📢 *PAGUE IMEDIATAMENTE!* 💸`,
        mentions: [alvoLid]
      });
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};