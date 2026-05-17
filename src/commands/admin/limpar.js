import { PREFIX } from "../../config.js";

export default {
  name: "limpargrupo",
  description: "Limpa o chat do grupo com caracteres invisíveis.",
  commands: ["limpargrupo", "limparchat", "clearchat"],
  usage: `${PREFIX}limpargrupo`,

  handle: async ({ sendReply, sendSuccessReact }) => {
    await sendSuccessReact();
    const invisivel = "\u200B".repeat(4000);
    return sendReply(invisivel + "\n✅ *Chat limpo!*");
  },
};
