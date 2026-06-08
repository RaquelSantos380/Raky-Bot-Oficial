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

// 🎯 SHIPS ESPECIAIS
const SHIPS_ESPECIAIS = [
  { 
    nomes: ["diana", "karen"], 
    numeros: ["2744551268354", "218437909508320"],
    porcentagem: 67100, 
    classificacao: "💖 ALMAS GÊMEAS SUPREMAS", 
    frase: "O universo inteiro conspirou para esse amor existir! 💫🌸" 
  },
  { 
    nomes: ["diana", "karenzinha"], 
    numeros: ["2744551268354", "218437909508320"],
    porcentagem: 67100, 
    classificacao: "💖 ALMAS GÊMEAS SUPREMAS", 
    frase: "O universo inteiro conspirou para esse amor existir! 💫🌸" 
  },
];

function verificarShipEspecial(num1, num2, nome1, nome2) {
  const n1 = nome1.toLowerCase().trim();
  const n2 = nome2.toLowerCase().trim();
  
  for (const ship of SHIPS_ESPECIAIS) {
    const matchNumero = 
      (num1.includes(ship.numeros[0]) && num2.includes(ship.numeros[1])) ||
      (num1.includes(ship.numeros[1]) && num2.includes(ship.numeros[0]));
    
    const matchNome = 
      (n1.includes(ship.nomes[0]) && n2.includes(ship.nomes[1])) ||
      (n1.includes(ship.nomes[1]) && n2.includes(ship.nomes[0]));
    
    if (matchNumero || matchNome) {
      return ship;
    }
  }
  return null;
}

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

      const todosNumeros = [];
      for (const arg of args) {
        if (arg === "|") continue;
        const num = limparNumero(arg);
        if (num.length >= 5) todosNumeros.push(num);
      }

      let num1 = todosNumeros[0];
      let num2 = todosNumeros[1];

      if (num1 && !num2) {
        num2 = num1;
        num1 = limparNumero(userLid);
      }

      if (!num1 || !num2) {
        throw new InvalidParameterError("Marque duas pessoas!\nEx: `/ship @joao @maria`");
      }

      const lid1 = num1 + "@lid";
      const lid2 = num2 + "@lid";

      let nome1 = num1;
      let nome2 = num2;
      try {
        const gm = await socket.groupMetadata(remoteJid);
        const p1 = gm.participants.find(p => p.id.includes(num1));
        const p2 = gm.participants.find(p => p.id.includes(num2));
        if (p1) nome1 = p1.notify || p1.name || num1;
        if (p2) nome2 = p2.notify || p2.name || num2;
      } catch (e) {}

      // 🎯 VERIFICA SHIP ESPECIAL
      const shipEspecial = verificarShipEspecial(num1, num2, nome1, nome2);
      
      let porcentagem, emoji, frase, classificacao;

      if (shipEspecial) {
        porcentagem = shipEspecial.porcentagem;
        emoji = "💖";
        frase = shipEspecial.frase;
        classificacao = shipEspecial.classificacao;
      } else {
        const seed = (num1 + num2).split("").reduce((a, b) => a + parseInt(b || "0"), 0);
        porcentagem = seed % 101;

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
      }

      const cheio = Math.min(Math.floor(porcentagem / 10), 10);
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