import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "pensao",
  description: "Cobra pensão de um membro marcado 😂",
  commands: ["pensao", "cobrar", "pensão"],
  usage: `${PREFIX}pensao @membro | motivo`,

  handle: async ({ args, sendReply, sendErrorReply, sendSuccessReact }) => {
    const alvo = args[0];
    const motivo = args.slice(1).join(" ").trim() || "abandono afetivo";

    if (!alvo) throw new InvalidParameterError("Marque alguém!\nEx: `" + PREFIX + "pensao @joao`");

    const nome = alvo.replace("@", "").trim();
    const valor = (Math.random() * 5000 + 500).toFixed(2);
    const dias = Math.floor(Math.random() * 365) + 1;

    await sendSuccessReact();
    return sendReply(
      `⚖️ *COBRANÇA DE PENSÃO*\n\n` +
      `👤 *Requerido:* @${nome}\n` +
      `📋 *Motivo:* ${motivo}\n` +
      `💔 *Abandono:* ${dias} dias\n` +
      `💰 *Valor:* R$ ${valor}\n\n` +
      `📢 *PAGUE IMEDIATAMENTE!* 💸`
    );
  },
};