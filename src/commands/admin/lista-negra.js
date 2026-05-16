import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  addBlacklist,
  removeBlacklist,
  getBlacklist,
  isBlacklisted,
} from "../../utils/database.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "lista-negra",
  description: "Gerencia lista negra de números banidos do grupo.",
  commands: ["lista-negra", "blacklist", "ln", "listanegra"],
  usage: `${PREFIX}lista-negra add | @user\n${PREFIX}lista-negra remove | @user\n${PREFIX}lista-negra list\n${PREFIX}lista-negra check | @user`,

  handle: async ({
    args,
    remoteJid,
    socket,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        return sendReply(
          `🚷 *Lista Negra*\n\n` +
          `• ${PREFIX}lista-negra add | @user\n` +
          `  Adiciona número\n\n` +
          `• ${PREFIX}lista-negra remove | @user\n` +
          `  Remove número\n\n` +
          `• ${PREFIX}lista-negra list\n` +
          `  Mostra lista\n\n` +
          `• ${PREFIX}lista-negra check | @user\n` +
          `  Verifica se está na lista`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "add" || action === "adicionar") {
        const userLid = args[1];
        if (!userLid) throw new InvalidParameterError("Mencione um usuário!");

        const number = onlyNumbers(userLid);
        addBlacklist(remoteJid, number);
        await sendSuccessReact();
        return sendReply(`🚷 Número ${number} adicionado à lista negra!`);
      }

      if (action === "remove" || action === "remover") {
        const userLid = args[1];
        if (!userLid) throw new InvalidParameterError("Mencione um usuário!");

        const number = onlyNumbers(userLid);
        removeBlacklist(remoteJid, number);
        await sendSuccessReact();
        return sendReply(`✅ Número ${number} removido da lista negra!`);
      }

      if (action === "list" || action === "lista") {
        const list = getBlacklist(remoteJid);
        if (list.length === 0) return sendReply("Lista negra vazia.");

        let msg = "🚷 *Lista Negra:*\n";
        list.forEach((num, i) => {
          msg += `${i + 1}. ${num}\n`;
        });
        return sendReply(msg);
      }

      if (action === "check" || action === "verificar") {
        const userLid = args[1];
        if (!userLid) throw new InvalidParameterError("Mencione um usuário!");

        const number = onlyNumbers(userLid);
        const blocked = isBlacklisted(remoteJid, number);
        return sendReply(blocked ? "🚷 Está na lista negra!" : "✅ Não está na lista negra.");
      }

      throw new InvalidParameterError("Use: add, remove, list ou check");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};