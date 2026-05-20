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

const DEFEITOS = [
  "🚶‍♂️ Anda mais devagar que lesma com cãibra",
  "📱 Responde mensagem depois de 3 dias úteis",
  "🎤 Canta no chuveiro e acha que é o(a) Beyoncé",
  "🤳 Tira 50 selfies pra postar 1",
  "🍕 Come pizza com garfo e faca",
  "😴 Dorme em call e ronca alto",
  "📞 Nunca atende ligação, só WhatsApp",
  "🫠 Some por 1 semana e volta como se nada tivesse acontecido",
  "🗣️ Manda áudio de 5 minutos pra dizer 'ok'",
  "🤡 Faz drama nível novela mexicana por qualquer coisa",
  "👻 Visualiza e não responde",
  "🧠 Esquece o que ia falar no meio da frase",
  "🎮 Joga Roblox e se acha gamer profissional",
  "📸 Posta foto do café da manhã TODO DIA",
  "🎵 Escuta a mesma música 50x seguidas",
  "🗑️ Demora pra tomar banho e sai fedido(a)",
  "💸 Gasta tudo em ifood e depois chora",
  "🎭 Fala mal de todo mundo mas jura que é santo(a)",
  "🪑 Já virou móvel do grupo de tanto que entra e não fala nada",
  "🎪 Faz malabarismo pra justificar os vacilos",
  "🦥 Velocidade de resposta: 1 mensagem por século",
  "🎤 Desafina até o hino nacional",
  "📱 Celular vive sem bateria",
  "🤧 Espirra mais alto que buzina de navio",
  "🛒 Vive pedindo dinheiro emprestado",
  "🎮 Perde até pro bot no easy",
  "🎭 Faz cosplay de vítima profissional",
  "📢 Fala mais alto que comício político",
  "🍔 Come escondido e nega até a morte",
  "📱 Tem 500 grupos e não fala em nenhum",
];

const GRAU = [
  "leve 😅",
  "moderado 🤔",
  "grave 🫣",
  "gravíssimo 💀",
  "incurável 🪦",
  "preocupante 😰",
  "assustador 👻",
  "vergonhoso 🫠",
];

export default {
  name: "defeitos",
  description: "Lista defeitos aleatórios de alguém 😂",
  commands: ["defeitos", "defeito", "defeitinho"],
  usage: `${PREFIX}defeitos @user\n${PREFIX}defeitos (seus próprios defeitos)`,

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

      let alvoLid = userLid;
      let nomeAlvo = "Você mesmo(a)";

      const alvoArg = args[0]?.replace(/[^0-9]/g, "");
      if (alvoArg) {
        alvoLid = alvoArg + "@lid";
        nomeAlvo = alvoArg;

        try {
          const gm = await socket.groupMetadata(remoteJid);
          const p = gm.participants.find(p => p.id.includes(alvoArg));
          if (p) nomeAlvo = p.notify || p.name || alvoArg;
        } catch (e) {}
      } else {
        try {
          const gm = await socket.groupMetadata(remoteJid);
          const p = gm.participants.find(p => p.id === userLid);
          if (p) nomeAlvo = p.notify || p.name || "Você mesmo(a)";
        } catch (e) {}
      }

      const seed = alvoLid.split("@")[0].split("").reduce((a, b) => a + parseInt(b || "0"), 0);

      // Pega 3 defeitos únicos
      const defeitosEscolhidos = [];
      const indicesUsados = new Set();
      while (defeitosEscolhidos.length < 3) {
        const idx = (seed * (defeitosEscolhidos.length + 7)) % DEFEITOS.length;
        if (!indicesUsados.has(idx)) {
          indicesUsados.add(idx);
          defeitosEscolhidos.push(DEFEITOS[idx]);
        }
      }

      const grau = GRAU[seed % GRAU.length];
      const total = (seed % 20) + 5;

      await sendSuccessReact();
      return sendReply(
        `🔍 *DEFEITOS ENCONTRADOS* 🔍\n\n` +
        `👤 *Pessoa:* ${nomeAlvo}\n` +
        `📊 *Total de defeitos:* ${total}\n` +
        `⚠️ *Gravidade:* ${grau}\n\n` +
        `━━━━━━━━━━━━━━━━\n\n` +
        `1️⃣ ${defeitosEscolhidos[0]}\n\n` +
        `2️⃣ ${defeitosEscolhidos[1]}\n\n` +
        `3️⃣ ${defeitosEscolhidos[2]}\n\n` +
        `━━━━━━━━━━━━━━━━\n\n` +
        `💡 *Dica:* Procure um psicólogo ou aceite seu destino! 😂`
      );

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};