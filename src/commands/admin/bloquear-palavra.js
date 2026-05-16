import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  addBlockedWord,
  removeBlockedWord,
  getBlockedWords,
  isActiveBlockWords,
  activateBlockWords,
  deactivateBlockWords,
} from "../../utils/database.js";

export default {
  name: "bloquear-palavra",
  description: "Bloqueia palavras proibidas no grupo.",
  commands: ["bloquear-palavra", "blockword", "bp", "palavra-proibida"],
  usage: `${PREFIX}bloquear-palavra (1/0)\n${PREFIX}bloquear-palavra add | palavra\n${PREFIX}bloquear-palavra remove | palavra\n${PREFIX}bloquear-palavra list`,

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
        const isActive = isActiveBlockWords(remoteJid);
        const status = isActive ? "ATIVADO" : "DESATIVADO";
        const words = getBlockedWords(remoteJid);
        const wordList = words.length > 0 ? words.join(", ") : "Nenhuma";

        return sendReply(
          `🚫 *Bloqueio de Palavras*\n\n` +
          `Status: ${status}\n` +
          `Palavras: ${wordList}\n\n` +
          `• ${PREFIX}bloquear-palavra 1\n` +
          `• ${PREFIX}bloquear-palavra 0\n` +
          `• ${PREFIX}bloquear-palavra add | palavra\n` +
          `• ${PREFIX}bloquear-palavra remove | palavra\n` +
          `• ${PREFIX}bloquear-palavra list`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "1" || action === "on") {
        activateBlockWords(remoteJid);
        await sendSuccessReact();
        return sendReply("🚫 *Bloqueio de palavras ATIVADO!*");
      }

      if (action === "0" || action === "off") {
        deactivateBlockWords(remoteJid);
        await sendSuccessReact();
        return sendReply("🚫 *Bloqueio de palavras DESATIVADO!*");
      }

      if (action === "add" || action === "adicionar") {
        const word = args.slice(1).join(" ").toLowerCase().trim();
        if (!word) throw new InvalidParameterError("Digite a palavra!\nEx: /bp add | boboca");
        addBlockedWord(remoteJid, word);
        await sendSuccessReact();
        return sendReply(`✅ Palavra "${word}" bloqueada!`);
      }

      if (action === "remove" || action === "remover" || action === "del") {
        const word = args.slice(1).join(" ").toLowerCase().trim();
        if (!word) throw new InvalidParameterError("Digite a palavra!\nEx: /bp remove | boboca");
        removeBlockedWord(remoteJid, word);
        await sendSuccessReact();
        return sendReply(`✅ Palavra "${word}" removida!`);
      }

      if (action === "list" || action === "lista") {
        const words = getBlockedWords(remoteJid);
        if (words.length === 0) return sendReply("Nenhuma palavra bloqueada.");
        return sendReply(`🚫 *Palavras bloqueadas:*\n${words.join("\n")}`);
      }

      throw new InvalidParameterError("Use: 1, 0, add, remove ou list");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};