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

const AMOROSOS = [
  "💕 Não tenha pressa de encontrar alguém. A pessoa certa aparece na hora certa!",
  "💔 Se levou um fora, não desanime. Foi livramento, acredite!",
  "💘 Antes de procurar alguém, se torne a pessoa que você gostaria de ter ao lado.",
  "💌 Não tenha medo de chegar em alguém. O máximo é um 'não', e 'não' você já tem!",
  "💝 Foque em você primeiro. Quem se cuida atrai pessoas boas naturalmente.",
  "💑 Não idealize a pessoa perfeita. Relacionamento é construção, não conto de fadas.",
  "💋 O beijo certo vai acontecer na hora certa. Não precisa forçar nada!",
  "🫶 Se valorize! Quem não te quer, não te merece. Ponto final.",
  "💗 Se está solteiro(a), aproveite! Liberdade também é uma forma de amor próprio.",
  "💖 Não entre em qualquer relação só pra não ficar sozinho(a). Carência atrai gente errada.",
  "🥀 Ex é página virada. Não releia o mesmo livro esperando um final diferente.",
  "🌹 Uma boa conversa vale mais que 100 matches no Tinder. Invista em conexões reais!",
  "💐 Seja você mesmo(a). Quem gostar de verdade, vai gostar do seu jeito.",
  "🦋 O amor chega quando você menos espera. Enquanto isso, viva, viaje, estude, dance!",
  "🌸 Não mendigue amor. Quem te ama, demonstra. Quem não demonstra, não ama.",
];

const FINANCEIROS = [
  "💰 Guarde 10% de tudo que ganha. No fim do ano você me agradece!",
  "💸 Não gaste mais do que ganha. Parece óbvio, mas muita gente esquece!",
  "📊 Invista em conhecimento primeiro. O retorno é garantido!",
  "💳 Cartão de crédito não é extensão do salário. Use com sabedoria!",
  "🏦 Faça uma reserva de emergência. O futuro é incerto, esteja preparado(a)!",
  "💵 Comprar por impulso é jogar dinheiro fora. Pense 24h antes de comprar algo caro.",
  "📈 Comece a investir, mesmo que pouco. R$10 por mês já é um começo!",
  "🪙 Moedas no cofrinho viram notas no banco. Não despreze os trocados!",
  "💎 Educação financeira vale mais que herança. Aprenda sobre dinheiro!",
  "🛒 Promoção só é boa se você precisa do produto. 50% de desconto em algo inútil é 100% de perda!",
];

const VIDA = [
  "🌻 A vida é curta. Faça o que te faz feliz, não o que os outros esperam.",
  "🧘 Respire fundo. Ansiedade é preocupação com o futuro que ainda não existe.",
  "🎯 Trace metas pequenas. Grandes conquistas são feitas de pequenos passos.",
  "🙏 Gratidão transforma o que temos em suficiente. Agradeça todo dia!",
  "🌈 Depois da tempestade vem a calmaria. Nada é para sempre, nem os problemas!",
  "🫂 Peça ajuda quando precisar. Ninguém vence sozinho!",
  "🎭 Não leve tudo tão a sério. Rir de si mesmo é a melhor terapia!",
  "🧠 Sua mente é seu lar. Cuide dela com bons pensamentos!",
  "💪 O não você já tem. Arrisque! O pior que pode acontecer é ouvir um não.",
  "🌙 Durma bem. Uma boa noite de sono resolve metade dos problemas!",
  "☀️ Todo dia é uma nova chance. Ontem já foi, amanhã é mistério, hoje é um presente!",
  "🦋 Mudanças são difíceis, mas necessárias. A lagarta só vira borboleta depois do casulo!",
  "🎵 Dance na chuva, cante no chuveiro, sorria sem motivo. A vida fica mais leve!",
];

const ALEATORIOS = [
  "🤔 Na dúvida, não faça. Seu instinto geralmente está certo!",
  "🍕 Pizza resolve 90% dos problemas. Os outros 10%? Mais pizza!",
  "📱 Menos redes sociais, mais vida real. O like não paga as contas!",
  "☕ Café primeiro, problemas depois. Prioridades!",
  "🎮 Um dia sem rir é um dia perdido. Assista memes, vale a pena!",
  "🧹 Casa arrumada, mente arrumada. Organize seu espaço!",
  "📚 Leia um livro. Conhecimento ninguém te tira!",
  "🎯 Foque no que importa. O resto é distração!",
];

export default {
  name: "conselho",
  description: "Receba um conselho sábio! 💡",
  commands: ["conselho", "conselhos", "sabedoria"],
  usage: `${PREFIX}conselho\n${PREFIX}conselho | amoroso\n${PREFIX}conselho | financeiro\n${PREFIX}conselho | vida`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
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

      const tipo = args[0]?.toLowerCase();
      let conselho;

      if (tipo === "amoroso" || tipo === "amor" || tipo === "amorosa") {
        conselho = AMOROSOS[Math.floor(Math.random() * AMOROSOS.length)];
      } else if (tipo === "financeiro" || tipo === "dinheiro" || tipo === "grana") {
        conselho = FINANCEIROS[Math.floor(Math.random() * FINANCEIROS.length)];
      } else if (tipo === "vida" || tipo === "life") {
        conselho = VIDA[Math.floor(Math.random() * VIDA.length)];
      } else {
        const todos = [...AMOROSOS, ...FINANCEIROS, ...VIDA, ...ALEATORIOS];
        conselho = todos[Math.floor(Math.random() * todos.length)];
      }

      await sendSuccessReact();
      return sendReply(`💡 *CONSELHO DO DIA*\n\n${conselho}\n\n✨ *Use com sabedoria!*`);

    } catch (error) {
      await sendReply(`❌ Erro: ${error.message}`);
    }
  },
};
