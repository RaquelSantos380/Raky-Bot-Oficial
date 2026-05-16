import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateAntiLinkWarn,
  deactivateAntiLinkWarn,
  isActiveAntiLinkWarn,
  addLinkWarn,
  getLinkWarns,
  resetLinkWarns,
} from "../../utils/database.js";

export default {
  name: "anti-link-warn",
  description: "Ativa/desativa anti-link com sistema de avisos progressivos.",
  commands: ["anti-link-warn", "antilinkwarn", "anti-link-aviso"],
  usage: `${PREFIX}anti-link-warn (1/0)\n${PREFIX}anti-link-warn ver\n${PREFIX}anti-link-warn reset @user`,

  handle: async ({
    args,
    remoteJid,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        const isActive = isActiveAntiLinkWarn(remoteJid);
        const status = isActive ? "ATIVADO" : "DESATIVADO";

        return sendReply(
          `🔗 *Anti-Link com Avisos*\n\n` +
          `Status: ${status}\n\n` +
          `📝 *Comandos:*\n\n` +
          `• ${PREFIX}anti-link-warn 1\n` +
          `  Ativa o sistema\n\n` +
          `• ${PREFIX}anti-link-warn 0\n` +
          `  Desativa o sistema\n\n` +
          `• ${PREFIX}anti-link-warn ver\n` +
          `  Mostra avisos do grupo\n\n` +
          `• ${PREFIX}anti-link-warn reset @user\n` +
          `  Reseta avisos de um membro\n\n` +
          `⚙️ *Funcionamento:*\n` +
          `1º link: apaga + aviso\n` +
          `2º link: apaga + 2º aviso\n` +
          `3º link: BAN permanente`
        );
      }

      const action = args[0];

      if (action === "1" || action === "on") {
        if (isActiveAntiLinkWarn(remoteJid)) {
          throw new WarningError("Anti-link com avisos já está ATIVADO!");
        }
        activateAntiLinkWarn(remoteJid);
        await sendSuccessReact();
        return sendReply(
          "🔗 *Anti-Link com Avisos ATIVADO!*\n\n" +
          "1º link: apaga + aviso\n" +
          "2º link: apaga + 2º aviso\n" +
          "3º link: BAN permanente"
        );
      }

      if (action === "0" || action === "off") {
        if (!isActiveAntiLinkWarn(remoteJid)) {
          throw new WarningError("Anti-link com avisos já está DESATIVADO!");
        }
        deactivateAntiLinkWarn(remoteJid);
        await sendSuccessReact();
        return sendReply("🔗 *Anti-Link com Avisos DESATIVADO!*");
      }

      if (action === "ver" || action === "view") {
        const warns = getLinkWarns(remoteJid);
        if (!warns || Object.keys(warns).length === 0) {
          return sendReply("📋 Nenhum aviso de link registrado.");
        }

        let msg = "📋 *Avisos de Link*\n\n";
        for (const [userLid, count] of Object.entries(warns)) {
          const userName = userLid.split("@")[0];
          msg += `• @${userName}: ${count}/3 avisos\n`;
        }
        return sendReply(msg);
      }

      if (action === "reset" || action === "limpar") {
        const userLid = args[1];
        if (!userLid) {
          throw new InvalidParameterError("Mencione um usuário! Ex: /anti-link-warn reset @user");
        }
        resetLinkWarns(remoteJid, userLid);
        await sendSuccessReact();
        return sendReply("✅ Avisos resetados!");
      }

      throw new InvalidParameterError("Use: 1, 0, ver ou reset");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};