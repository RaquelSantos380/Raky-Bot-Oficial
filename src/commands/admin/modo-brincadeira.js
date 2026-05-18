import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import fs from "fs";
import path from "path";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");

function lerConfig() {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) return JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function salvarConfig(data) {
  fs.writeFileSync(BRINCADEIRA_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: "modo-brincadeira",
  description: "Ativa/desativa modo brincadeira (só admins podem usar).",
  commands: ["modobrincadeira", "modo-brincadeira", "brincadeira"],
  usage: `${PREFIX}modobrincadeira 1\n${PREFIX}modobrincadeira 0`,

  handle: async ({
    args,
    remoteJid,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      const config = lerConfig();
      const acao = args[0];

      if (!acao || (acao !== "1" && acao !== "0")) {
        const status = config[remoteJid] ? "✅ ATIVADO" : "❌ DESATIVADO";
        return sendReply(
          `🎮 *Modo Brincadeira*\n\n` +
          `Status: ${status}\n\n` +
          `• ${PREFIX}modobrincadeira 1 → Só admins usam comandos de diversão\n` +
          `• ${PREFIX}modobrincadeira 0 → Todos podem usar`
        );
      }

      if (acao === "1") {
        config[remoteJid] = true;
        salvarConfig(config);
        await sendSuccessReact();
        return sendReply("🎮 *Modo Brincadeira ATIVADO!*\nAgora só ADMINS podem usar comandos de diversão.");
      }

      if (acao === "0") {
        delete config[remoteJid];
        salvarConfig(config);
        await sendSuccessReact();
        return sendReply("🎮 *Modo Brincadeira DESATIVADO!*\nTodos podem usar comandos de diversão.");
      }
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};