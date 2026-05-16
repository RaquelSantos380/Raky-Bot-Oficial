import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  setWelcomeMessage,
  setWelcomeImage,
  setWelcomeRules,
  getWelcomeSettings,
  resetWelcomeSettings,
  isActiveWelcomeGroup,
} from "../../utils/database.js";

export default {
  name: "set-welcome",
  description: "Personaliza a mensagem, regras e imagem de boas-vindas do grupo.",
  commands: [
    "set-welcome",
    "configwelcome",
    "welcome-config",
    "setwelcome",
    "configboasvindas",
    "setboasvindas",
  ],
  usage: `${PREFIX}set-welcome [mensagem/regras/imagem/ver/reset]`,
  
  handle: async ({
    args,
    isReply,
    webMessage,
    remoteJid,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        const isActive = isActiveWelcomeGroup(remoteJid);
        const status = isActive ? "ATIVADO" : "DESATIVADO";
        
        return sendReply(
          `🎨 *Personalizacao de Boas-Vindas*\n\n` +
          `Status do Welcome: ${status}\n\n` +
          `📝 *Comandos:*\n\n` +
          `• ${PREFIX}set-welcome mensagem | <texto>\n` +
          `  Define a mensagem principal\n\n` +
          `• ${PREFIX}set-welcome regras | <texto>\n` +
          `  Define as regras (2ª mensagem)\n\n` +
          `• ${PREFIX}set-welcome imagem\n` +
          `  Responda uma foto\n\n` +
          `• ${PREFIX}set-welcome ver\n` +
          `  Mostra configuracoes\n\n` +
          `• ${PREFIX}set-welcome reset\n` +
          `  Volta ao padrao\n\n` +
          `💡 *Variaveis:* {user}, {name}, {group}, {members}\n\n` +
          `⚠️ Use | para separar o comando do texto!`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "mensagem" || action === "msg" || action === "message") {
        const message = args.slice(1).join(" ").trim();
        
        if (!message) {
          throw new InvalidParameterError(
            "Voce precisa escrever a mensagem!\n\n" +
            "Exemplo: /set-welcome mensagem | Bem-vindo(a) {user} 🎉"
          );
        }

        await sendWaitReact();
        setWelcomeMessage(remoteJid, message);
        await sendSuccessReact();

        return sendReply(
          `✅ *Mensagem principal definida!*\n\n` +
          `Use ${PREFIX}set-welcome ver para conferir`
        );
      }

      if (action === "regras" || action === "rules" || action === "regra") {
        const rules = args.slice(1).join(" ").trim();
        
        if (!rules) {
          throw new InvalidParameterError(
            "Voce precisa escrever as regras!\n\n" +
            "Exemplo: /set-welcome regras | 📖 Leia as regras!"
          );
        }

        await sendWaitReact();
        setWelcomeRules(remoteJid, rules);
        await sendSuccessReact();

        return sendReply(
          `✅ *Regras definidas!*\n\n` +
          `Use ${PREFIX}set-welcome ver para conferir`
        );
      }

      if (action === "imagem" || action === "img" || action === "image") {
        if (!isReply) {
          throw new InvalidParameterError(
            "Responda uma foto com: /set-welcome imagem"
          );
        }

        const quotedMessage = webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isQuotedImage = quotedMessage?.imageMessage || quotedMessage?.viewOnceMessage?.message?.imageMessage;
        
        if (!isQuotedImage) {
          throw new InvalidParameterError("Responda uma FOTO!");
        }

        await sendWaitReact();

        try {
          const { downloadContentFromMessage } = await import("baileys");
          const stream = await downloadContentFromMessage(isQuotedImage, "image");
          
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          
          const base64Image = buffer.toString("base64");
          setWelcomeImage(remoteJid, base64Image);

          await sendSuccessReply("🖼️ *Imagem de boas-vindas atualizada!*");
        } catch (downloadError) {
          throw new InvalidParameterError("Nao foi possivel baixar a imagem.");
        }
        return;
      }

      if (action === "ver" || action === "view" || action === "show") {
        const settings = getWelcomeSettings(remoteJid);
        
        if (!settings || (!settings.message && !settings.rules && !settings.image)) {
          return sendReply("Nenhuma configuracao personalizada.");
        }

        let msg = "📋 *Configuracoes de Boas-Vindas*\n\n";
        
        if (settings.message) {
          msg += `📝 *Mensagem:*\n${settings.message}\n\n`;
        }

        if (settings.rules) {
          msg += `📖 *Regras:*\n${settings.rules}\n\n`;
        }

        if (settings.image) {
          msg += "🖼️ *Imagem:* Personalizada\n\n";
        }

        return sendReply(msg);
      }

      if (action === "reset" || action === "limpar" || action === "padrao") {
        const settings = getWelcomeSettings(remoteJid);
        
        if (!settings) {
          throw new WarningError("Nao ha configuracoes para resetar.");
        }

        await sendWaitReact();
        resetWelcomeSettings(remoteJid);
        await sendSuccessReply("🔄 *Configuracoes resetadas!*");
        return;
      }

      throw new InvalidParameterError(
        `Opcao invalida: "${action}"\nUse: mensagem, regras, imagem, ver ou reset`
      );
      
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};
