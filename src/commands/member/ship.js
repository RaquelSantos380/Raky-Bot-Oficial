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

const EMOJIS_CASAL = ["💘", "💑", "💕", "💖", "💗", "💓", "💞", "💝", "🩷", "❤️‍🔥", "🥰", "😍", "💋", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩"];
const EMOJIS_RUIM = ["💔", "🥀", "👊", "💢", "😬", "🤡", "🗑️", "⚡", "💣", "🪦"];
const FRASES_AMOR = [
  "Almas gêmeas! Destino os uniu! 💫",
  "O amor está no ar! 🌹",
  "Vai dar casamento, certeza! 💒",
  "Já podem comprar as alianças! 💍",
  "O Titanic não afunda esse amor! 🚢",
  "Nem o Thanos separa esse casal! 💎",
  "Chama o padre que hoje tem! ⛪",
  "Romeu e Julieta brasileiros! 🎭",
  "O Sol e a Lua se encontraram! ☀️🌙",
  "Casal nota MIL! 🎵",
  "Que venha o chá de bebê! 👶",
  "Shippo mais que encomenda da Shopee! 📦",
];
const FRASES_RUIM = [
  "Melhor cada um pro seu canto... 🚶‍♂️🚶‍♀️",
  "Isso aí é amizade, no máximo! 🤝",
  "Nem com reza braba funciona! 🙏",
  "O céu e o inferno não se misturam! 😈😇",
  "Tanta química quanto água e óleo! 🧪",
  "Só se for em outra vida! 🔄",
  "Bloqueia e segue a vida! 🚫",
  "Fuja para as colinas! 🏃💨",
  "Isso é furada nível hard! 🕳️",
  "Até pedra tem mais sentimento! 🪨",
];
const FRASES_MEDIO = [
  "Vai que cola... Talvez dê certo! 🤔",
  "Tenta a sorte, quem sabe? 🍀",
  "Meio a meio, igual café com leite! ☕",
  "Nem tão amor, nem tão dor... 🌤️",
  "Depende do signo! ♈♉",
  "O universo ainda está decidindo... 🌌",
  "Tá morno, mas pode esquentar! 🔥",
  "Vale um like, mas não muito mais! 👍",
];

function getNome(arg) {
  return arg?.replace(/[@⁨⁩~]/g, "").replace(/[^a-zA-Z0-9]/g, "").trim() || "???";
}

export default {
  name: "ship",
  description: "Calcula a compatibilidade de um casal 💘",
  commands: ["ship", "shipar", "casal"],
  usage: `${PREFIX}ship @pessoa1 @pessoa2\n${PREFIX}ship @pessoa1 | @pessoa2`,

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
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      let pessoa1, pessoa2;

      // Pega os alvos
      const tudo = args.join(" ");
      const partes = tudo.split("|").map(s => s.trim()).filter(Boolean);

      if (partes.length >= 2) {
        pessoa1 = partes[0];
        pessoa2 = partes[1];
      } else {
        pessoa1 = args[0];
        pessoa2 = args[1];
      }

      // Se só tem 1 pessoa, shippa com quem digitou
      if (pessoa1 && !pessoa2) {
        pessoa2 = pessoa1;
        pessoa1 = "@" + userLid.split("@")[0];
      }

      if (!pessoa1 || !pessoa2) {
        throw new InvalidParameterError("Marque duas pessoas!\nEx: `/ship @joao @maria`");
      }

      const nome1 = getNome(pessoa1);
      const nome2 = getNome(pessoa2);

      // Gera porcentagem baseada nos nomes (consistente)
      const seed = (nome1 + nome2).toLowerCase().split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const porcentagem = seed % 101;

      let emoji, frase, barra, classificacao;

      if (porcentagem >= 80) {
        emoji = EMOJIS_CASAL[seed % EMOJIS_CASAL.length];
        frase = FRASES_AMOR[seed % FRASES_AMOR.length];
        classificacao = "❤️‍🔥 ALMAS GÊMEAS";
      } else if (porcentagem >= 60) {
        emoji = EMOJIS_CASAL[seed % EMOJIS_CASAL.length];
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

      // Barra de progresso
      const cheio = Math.floor(porcentagem / 10);
      barra = "▓".repeat(cheio) + "░".repeat(10 - cheio);

      await sendSuccessReact();
      return sendReply(
        `💘 *SHIP CALCULATOR* 💘\n\n` +
        `👤 *${nome1}*\n` +
        `${emoji} ${porcentagem}%\n` +
        `👤 *${nome2}*\n\n` +
        `[${barra}] ${porcentagem}%\n\n` +
        `📊 *Classificação:* ${classificacao}\n` +
        `📝 ${frase}`
      );

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};