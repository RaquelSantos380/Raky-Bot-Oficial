import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateAntiFlood,
  deactivateAntiFlood,
  isActiveAntiFlood,
  setFloodConfig,
  getFloodConfig,
} from "../../utils/database.js";

export default {
  name: "anti-flood",
  description: "Ativa/desativa anti-flood (mute automático por muitas mensagens).",
  commands: ["anti-flood", "antiflood", "anti-flood"],
  usage: `${PREFIX}anti-flood (1/0)\n${PREFIX}anti-flood config | 10 | 10\n${PREFIX}anti-flood ver`,

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
        const isActive = isActiveAntiFlood(remoteJid);
        const status = isActive ? "ATIVADO" : "DESATIVADO";
        const config = getFloodConfig(remoteJid) || { maxMessages: 10, muteSeconds: 20 };

        return sendReply(
          `🌊 *Anti-Flood*\n\n` +
          `Status: ${status}\n` +
          `Máx. mensagens: ${config.maxMessages}\n` +
          `Mute: ${config.muteSeconds}s\n\n` +
          `📝 *Comandos:*\n\n` +
          `• ${PREFIX}anti-flood 1\n` +
          `  Ativa o sistema\n\n` +
          `• ${PREFIX}anti-flood 0\n` +
          `  Desativa o sistema\n\n` +
          `• ${PREFIX}anti-flood config | 10 | 20\n` +
          `  Configura: 10 msgs = mute 20s\n\n` +
          `• ${PREFIX}anti-flood ver\n` +
          `  Mostra configurações`
        );
      }

      const action = args[0];

      if (action === "1" || action === "on") {
        if (isActiveAntiFlood(remoteJid)) {
          throw new WarningError("Anti-flood já está ATIVADO!");
        }
        activateAntiFlood(remoteJid);
        await sendSuccessReact();
        return sendReply("🌊 *Anti-Flood ATIVADO!*");
      }

      if (action === "0" || action === "off") {
        if (!isActiveAntiFlood(remoteJid)) {
          throw new WarningError("Anti-flood já está DESATIVADO!");
        }
        deactivateAntiFlood(remoteJid);
        await sendSuccessReact();
        return sendReply("🌊 *Anti-Flood DESATIVADO!*");
      }

      if (action === "config") {
        const maxMessages = parseInt(args[1]);
        const muteSeconds = parseInt(args[2]);

        if (!maxMessages || !muteSeconds || maxMessages < 3 || muteSeconds < 5) {
          throw new InvalidParameterError(
            "Valores inválidos!\nEx: /anti-flood config | 10 | 20\n" +
            "(10 mensagens = mute de 20 segundos)\nMínimo: 3 msgs / 5s"
          );
        }

        setFloodConfig(remoteJid, { maxMessages, muteSeconds });
        await sendSuccessReact();
        return sendReply(
          `✅ *Configurado!*\n` +
          `${maxMessages} mensagens = mute de ${muteSeconds}s`
        );
      }

      if (action === "ver" || action === "view") {
        const config = getFloodConfig(remoteJid) || { maxMessages: 10, muteSeconds: 20 };
        const isActive = isActiveAntiFlood(remoteJid);
        return sendReply(
          `🌊 *Configuração Anti-Flood*\n\n` +
          `Status: ${isActive ? "Ativado" : "Desativado"}\n` +
          `Máx. mensagens: ${config.maxMessages}\n` +
          `Mute: ${config.muteSeconds}s`
        );
      }

      throw new InvalidParameterError("Use: 1, 0, config ou ver");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};