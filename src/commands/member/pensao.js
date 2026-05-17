import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "pensao",
  description: "Cobra pensão de um membro marcado 😂",
  commands: ["pensao", "cobrar", "pensão"],
  usage: `${PREFIX}pensao | @membro | motivo`,

  handle: async ({ args, sendReply, sendErrorReply, sendSuccessReact, remoteJid, socket }) => {
    try {
      const alvo = args[0];
      const motivo = args.slice(1).join(" ").trim() || "abandono afetivo";

      if (!alvo) throw new InvalidParameterError("Marque alguém!\nEx: `" + PREFIX + "pensao | @joao`");

      // Extrai o número e cria o LID correto
      const numeroLimpo = alvo.replace(/[^0-9]/g, "");
      const userLid = numeroLimpo + "@lid";
      
      const valor = (Math.random() * 5000 + 500).toFixed(2);
      const dias = Math.floor(Math.random() * 365) + 1;

      await sendSuccessReact();
      
      // Envia com menção correta
      await socket.sendMessage(remoteJid, {
        text: `⚖️ *COBRANÇA DE PENSÃO*\n\n` +
              `👤 *Requerido:* @${numeroLimpo}\n` +
              `📋 *Motivo:* ${motivo}\n` +
              `💔 *Abandono:* ${dias} dias\n` +
              `💰 *Valor:* R$ ${valor}\n\n` +
              `📢 *PAGUE IMEDIATAMENTE!* 💸`,
        mentions: [userLid]
      });
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};
