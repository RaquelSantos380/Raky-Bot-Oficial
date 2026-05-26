import { PREFIX, OPENAI_API_KEY } from "../../config.js";

export default {
  name: "gemini",
  description: "Use a inteligência artificial Google Gemini!",
  commands: ["gemini", "geminii", "ia"],
  usage: `${PREFIX}gemini | Sua pergunta aqui`,

  handle: async ({ sendSuccessReply, sendWaitReply, sendErrorReply, args }) => {
    const text = args.join(" ").trim();

    if (!text) {
      return sendErrorReply("❌ Digite uma pergunta!\nEx: `/gemini | O que é JavaScript?`");
    }

    await sendWaitReply();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${OPENAI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }]
          })
        }
      );

      const data = await response.json();
      const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (resposta) {
        await sendSuccessReply(resposta);
      } else {
        await sendErrorReply("❌ Não consegui uma resposta. Tente novamente!");
      }
    } catch (error) {
      await sendErrorReply(`❌ Erro: ${error.message}`);
    }
  },
};