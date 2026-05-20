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

const PREVISOES = [
  {
    titulo: "💰 Financeiro",
    textos: [
      "Você receberá uma quantia inesperada de dinheiro nos próximos 3 dias! Fique atento(a) a notificações do banco! 🏦",
      "Uma proposta de negócio surgirá de onde você menos espera. Aceite, mas leia as letras pequenas! 📄",
      "Cuidado com gastos impulsivos no fim de semana. O universo avisa: segura a mão! 💸",
      "Alguém te pagará uma dívida antiga. Não gaste tudo de uma vez! 🪙",
      "Uma promoção ou aumento está no seu horizonte. Continue trabalhando duro! 📈",
    ],
  },
  {
    titulo: "❤️ Amor",
    textos: [
      "Alguém está secretamente apaixonado(a) por você! Observe os sinais nos próximos dias... 👀💕",
      "Um encontro inesperado vai mexer com seu coração. Esteja aberto(a) a novas pessoas! 🌹",
      "Seu ex vai tentar voltar. O universo diz: FUJA PARA AS COLINAS! 🏃💨",
      "O amor da sua vida está mais perto do que você imagina... tipo, no mesmo grupo! 😳💘",
      "Uma amizade vai se transformar em algo mais. Preste atenção em quem sempre te apoia! 🫶",
    ],
  },
  {
    titulo: "🎮 Sorte",
    textos: [
      "Sua sorte está em alta! Jogue na loteria, faça aquela aposta, arrisque! 🍀",
      "Um número da sorte aparecerá para você hoje: o universo sugere o 7! 🎲",
      "Você encontrará algo que estava perdido há muito tempo. Embaixo do sofá, provavelmente... 🛋️",
      "Uma coincidência incrível vai te deixar de boca aberta hoje! Esteja atento(a)! 🤯",
      "Seu signo está alinhado com Júpiter. Grandes oportunidades se aproximam! 🔮",
    ],
  },
  {
    titulo: "⚠️ Aviso",
    textos: [
      "Cuidado com escadas na próxima terça-feira. O universo não especificou o porquê... 🪜",
      "Alguém vai puxar seu tapete no trabalho ou grupo. Mantenha os olhos abertos! 👀",
      "Seu celular vai cair no chão essa semana. Já compra a capinha nova! 📱💥",
      "Evite discussões desnecessárias no grupo. O universo prevê treta à vista! ⚡",
      "Cuidado com comidas estragadas nos próximos dias. A geladeira pode estar tramando algo... 🍕💀",
    ],
  },
  {
    titulo: "🎯 Carreira",
    textos: [
      "Uma oportunidade de trabalho ou estudo vai surgir. Não deixe passar! 🎓",
      "Seu esforço será reconhecido em breve. Continue plantando boas sementes! 🌱",
      "Alguém importante vai notar seu talento. Vista sua melhor roupa nos próximos dias! 👔",
      "Mudanças profissionais estão a caminho. Podem parecer assustadoras, mas são positivas! 🔄",
      "Você receberá um elogio público que vai te deixar sem graça. Aproveite o momento! 🏆",
    ],
  },
  {
    titulo: "😂 Aleatório",
    textos: [
      "Você vai rir tanto de algo besta que vai chorar. Prepare os lenços! 😂😭",
      "Um animal fofo vai cruzar seu caminho hoje. Pode ser uma borboleta, um gato, ou uma capivara! 🦋",
      "Você vai receber um áudio de 5 minutos e vai responder com 'kkk'. O universo aprova! ✅",
      "Sua próxima refeição será INCRÍVEL. O universo garante: vai ser a melhor do mês! 🍽️",
      "Você vai descobrir um talento oculto nos próximos dias. Pode ser cantar, cozinhar, ou imitar o Pato Donald! 🦆",
    ],
  },
];

const CRISTAIS = ["🔮", "💎", "🪨", "✨", "🌙", "⭐", "🪐", "☀️", "🌑", "💠"];

export default {
  name: "previsao",
  description: "Prevê o futuro de alguém 🔮",
  commands: ["previsao", "prever", "futuro", "oraculo"],
  usage: `${PREFIX}previsao @user\n${PREFIX}previsao (para você)`,

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
      let nomeAlvo = "Você";

      const alvoArg = args[0]?.replace(/[^0-9]/g, "");
      if (alvoArg) {
        alvoLid = alvoArg + "@lid";
        nomeAlvo = alvoArg;

        // Busca nome real
        try {
          const gm = await socket.groupMetadata(remoteJid);
          const p = gm.participants.find(p => p.id.includes(alvoArg));
          if (p) nomeAlvo = p.notify || p.name || alvoArg;
        } catch (e) {}
      } else {
        // Se é você mesmo
        try {
          const gm = await socket.groupMetadata(remoteJid);
          const p = gm.participants.find(p => p.id === userLid);
          if (p) nomeAlvo = p.notify || p.name || "Você";
        } catch (e) {}
      }

      // Gera 3 previsões baseadas no LID
      const seed = alvoLid.split("@")[0].split("").reduce((a, b) => a + parseInt(b || "0"), 0);

      const categoriasEmbaralhadas = [...PREVISOES].sort(() => (seed % 7) - 3);
      const escolhidas = categoriasEmbaralhadas.slice(0, 3);

      const cristal = CRISTAIS[seed % CRISTAIS.length];
      const data = new Date();
      const validade = new Date(data);
      validade.setDate(validade.getDate() + 7);

      let msg = `${cristal} *PREVISÃO DO FUTURO* ${cristal}\n\n`;
      msg += `👤 *Consulente:* ${nomeAlvo}\n`;
      msg += `📅 *Data:* ${data.toLocaleDateString("pt-br")}\n`;
      msg += `⏳ *Válido até:* ${validade.toLocaleDateString("pt-br")}\n\n`;
      msg += `━━━━━━━━━━━━━━━━\n\n`;

      escolhidas.forEach((cat) => {
        const texto = cat.textos[seed % cat.textos.length];
        msg += `📌 *${cat.titulo}*\n${texto}\n\n`;
      });

      msg += `━━━━━━━━━━━━━━━━\n`;
      msg += `⚠️ *Aviso:* Estas previsões são para fins de entretenimento.\n`;
      msg += `O universo pode mudar de ideia a qualquer momento! 🌌`;

      await sendSuccessReact();
      return sendReply(msg);

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};