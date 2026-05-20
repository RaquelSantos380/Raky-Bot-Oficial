import fs from "fs";
import path from "path";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

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

function limparNumero(texto) {
  // Remove TUDO que não for número
  return texto?.replace(/[^0-9]/g, "") || "";
}

const EMOJIS_AMOR = ["💘", "💑", "💕", "💖", "💗", "💓", "💞", "💝", "🩷", "❤️‍🔥", "🥰", "😍", "💋"];
const EMOJIS_RUIM = ["💔", "🥀", "👊", "💢", "😬", "🤡", "🗑️", "⚡", "💣", "🪦"];
const FRASES_AMOR = [
  "Almas gêmeas! Destino os uniu! 💫",
  "O amor está no ar! 🌹",
  "Vai dar casamento, certeza! 💒",
  "Já podem comprar as alianças! 💍",
  "O Titanic não afunda esse amor! 🚢",
  "Nem o Thanos separa esse casal! 💎",
  "Chama o padre que hoje tem! ⛪",
];
const FRASES_RUIM = [
  "Melhor cada um pro seu canto... 🚶‍♂️🚶‍♀️",
  "Isso aí é amizade, no máximo! 🤝",
  "Nem com reza braba funciona! 🙏",
  "O céu e o inferno não se misturam! 😈😇",
  "Bloqueia e segue a vida! 🚫",
  "Fuja para as colinas! 🏃💨",
];
const FRASES_MEDIO = [
  "Vai que cola... Talvez dê certo! 🤔",
  "Tenta a sorte, quem sabe? 🍀",
  "Meio a meio, igual café com leite! ☕",
  "Depende do signo! ♈♉",
  "O universo ainda está decidindo... 🌌",
  "Tá morno, mas pode esquentar! 🔥",
];

export default {
  name: "ship",
  description: "Calcula compatibilidade de casal 💘",
  commands: ["ship", "shipar", "casal"],
  usage: `${PREFIX}ship @pessoa1 @pessoa2`,

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

      // Junta tudo e separa por |
      const tudo = args.join(" ");
      const partes = tudo.split("|").map(s => s.trim()).filter(Boolean);

      let num1, num2;

      if (partes.length >= 2) {
        num1 = limparNumero(partes[0]);
        num2 = limparNumero(partes[1]);
      } else {
        // Pega todos os args e extrai números
        const todosNumeros = args.map(a => limparNumero(a)).filter(n => n.length > 5);
        num1 = todosNumeros[0];
        num2 = todosNumeros[1];
      }

      if (!num1 || !num2) {
        throw new InvalidParameterError("Marque duas pessoas!\nEx: `/ship @joao @maria`");
      }

      const lid1 = num1 + "@lid";
      const lid2 = num2 + "@lid";

      // Busca nomes reais
      let nome1 = num1;
      let nome2 = num2;
      try {
        const gm = await socket.groupMetadata(remoteJid);
        const p1 = gm.participants.find(p => p.id.includes(num1));
        const p2 = gm.participants.find(p => p.id.includes(num2));
        if (p1) nome1 = p1.notify || p1.name || num1;
        if (p2) nome2 = p2.notify || p2.name || num2;
      } catch (e) {}

      const seed = (num1 + num2).split("").reduce((a, b) => a + parseInt(b || "0"), 0);
      const porcentagem = seed % 101;

      let emoji, frase, classificacao;

      if (porcentagem >= 80) {
        emoji = EMOJIS_AMOR[seed % EMOJIS_AMOR.length];
        frase = FRASES_AMOR[seed % FRASES_AMOR.length];
        classificacao = "❤️‍🔥 ALMAS GÊMEAS";
      } else if (porcentagem >= 60) {
        emoji = EMOJIS_AMOR[seed % EMOJIS_AMOR.length];
        frase = FRASES_MEDIO[seed % FRASES_MEDIO.length];
        classificacao = "😊 COMPATÍVEL";
      } else if (porcentagem >= 40) {
        emoji = "🤔";
        frase = FRASES_MEDIO[seed % FRASES_MEDIO.length];
        classificacao = "🌤️ TALVEZ";
      } else if (porcentagem >= 20) {
        emoji = EMOJIS_RUIM[seed % EMOJIS_RUIM.length];
        frase = FRASES_RUIM[seed % FRASES_RUIM.length];
        classificacao = "💔 DIFÍCIL";
      } else {
        emoji = EMOJIS_RUIM[seed % EMOJIS_RUIM.length];
        frase = FRASES_RUIM[seed % FRASES_RUIM.length];
        classificacao = "💀 IMPOSSÍVEL";
      }

      const cheio = Math.floor(porcentagem / 10);
      const barra = "▓".repeat(cheio) + "░".repeat(10 - cheio);

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        text: `💘 *SHIP CALCULATOR* 💘\n\n` +
              `👤 *@${nome1}*\n` +
              `${emoji} ${porcentagem}%\n` +
              `👤 *@${nome2}*\n\n` +
              `[${barra}] ${porcentagem}%\n\n` +
              `📊 *Classificação:* ${classificacao}\n` +
              `📝 ${frase}`,
        mentions: [lid1, lid2]
      });

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};