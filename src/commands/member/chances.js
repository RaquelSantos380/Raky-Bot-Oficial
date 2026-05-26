import fs from "fs";
import path from "path";
import { PREFIX } from "../../config.js";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");

function isModoBrincadeiraAtivo(remoteJid) {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) {
      const config = JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
      return !!config[remoteJid];
    }
  } catch (e) {}
  return false;
}

const resultadosSalvos = {};

export default {
  name: "chances",
  description: "Quais as chances de algo acontecer? 🎲",
  commands: ["chances", "chance", "qualachance"],
  usage: `${PREFIX}chances | ganhar na loteria\n${PREFIX}chances | arrumar namorada`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const motivo = args.join(" ").trim();
      if (!motivo || motivo.length < 3) {
        return sendReply("❌ Digite algo!\nEx: `/chances | ganhar na loteria`");
      }

      const chave = motivo.toLowerCase().trim();
      let seed = 0;
      for (let i = 0; i < chave.length; i++) {
        seed += chave.charCodeAt(i);
      }

      if (resultadosSalvos[chave] !== undefined) {
        seed = resultadosSalvos[chave];
      } else {
        resultadosSalvos[chave] = seed;
      }

      const porcentagem = seed % 101;
      const cheio = Math.floor(porcentagem / 10);
      const barra = "▓".repeat(cheio) + "░".repeat(10 - cheio);

      let emoji, frase, classificacao;

      if (porcentagem >= 90) {
        emoji = "🌟";
        frase = "É praticamente certo! O universo conspira a seu favor!";
        classificacao = "CERTEZA ABSOLUTA";
      } else if (porcentagem >= 75) {
        emoji = "✨";
        frase = "As chances são muito boas! Continue acreditando!";
        classificacao = "MUITO PROVÁVEL";
      } else if (porcentagem >= 60) {
        emoji = "👍";
        frase = "Tem boas chances! Só não desista!";
        classificacao = "PROVÁVEL";
      } else if (porcentagem >= 45) {
        emoji = "🤔";
        frase = "Tá meio a meio... Depende de você!";
        classificacao = "TALVEZ";
      } else if (porcentagem >= 30) {
        emoji = "😬";
        frase = "Difícil, mas não impossível! Reza bastante!";
        classificacao = "POUCO PROVÁVEL";
      } else if (porcentagem >= 15) {
        emoji = "💀";
        frase = "Quase impossível... Mas sonhar é de graça!";
        classificacao = "MUITO DIFÍCIL";
      } else {
        emoji = "🪦";
        frase = "Sinto muito, mas nem com reza braba!";
        classificacao = "IMPOSSÍVEL";
      }

      await sendSuccessReact();
      return sendReply(
        `🎲 *CHANCES DE...*\n\n` +
        `❓ *${motivo}*\n\n` +
        `[${barra}] ${porcentagem}%\n\n` +
        `${emoji} *Classificação:* ${classificacao}\n` +
        `📝 ${frase}`
      );

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};
