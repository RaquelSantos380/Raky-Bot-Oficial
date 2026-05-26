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

function limparNumero(texto) {
  return texto?.replace(/[^0-9]/g, "") || "";
}

const VERDADES = [
  "Qual foi a última mentira que você contou? 🤥",
  "Quem você beijaria no grupo agora? 💋",
  "Qual a coisa mais vergonhosa que já fez? 🫣",
  "Já roubou algo? O que foi? 🕵️",
  "Qual seu maior medo? 😨",
  "Já traiu alguém? Conte a história! 💔",
  "Quem você acha mais irritante no grupo? 😤",
  "Qual foi o último sonho estranho que teve? 🌙",
  "Já fingiu gostar de alguém? Por quê? 🎭",
  "Se pudesse dar unmatch em alguém do grupo, quem seria? 🚫",
  "Já chorou por motivo besta? Qual? 😭",
  "Qual seu segredo mais obscuro? 🌑",
  "Qual foi a maior gafe que já cometeu? 🤦",
  "Já stalkeou alguém? Quem? 👀",
  "Qual foi o pior presente que já recebeu? 🎁",
];

const DESAFIOS = [
  "Mande um áudio cantando um trecho de música! 🎤",
  "Mande um áudio imitando o Pato Donald! 🦆",
  "Conte uma piada sem rir! 🎭",
  "Mande um áudio rindo por 10 segundos! 😂",
  "Use apenas emojis para conversar pelos próximos 5 minutos! 🫶",
  "Fale 'eu sou o melhor' em 5 idiomas diferentes no áudio! 🌍",
  "Mande uma mensagem dizendo 'eu te amo' pra última pessoa que te mandou mensagem! 💕",
  "Escreva 'batata' 20 vezes seguidas! 🥔",
  "Mande um áudio falando como se fosse um robô! 🤖",
  "Descreva um filme em 1 frase e deixem adivinhar! 🎬",
  "Fale por 1 minuto sem parar sobre qualquer assunto! 🗣️",
  "Mande um áudio com sotaque de outro estado! 🗺️",
  "Faça uma rima com o nome de alguém do grupo! 🎵",
  "Conte uma história infantil em 30 segundos! 📖",
  "Imite um animal no áudio! 🐮",
];

const MALDICOES = [
  "🐸 *SAPO*: Foi transformado em sapo! Coaxa, coaxa! 🐸",
  "🤐 *MUDO*: Ficou mudo por 5 minutos! 🤫",
  "👻 *INVISÍVEL*: Ninguém vai responder suas próximas 5 mensagens!",
  "🤡 *PALHAÇO*: Nomeado palhaço oficial do grupo!",
  "🦥 *LESMA*: Sua internet vai ficar lenta o resto do dia!",
  "📱 *SEM BATERIA*: Seu celular vai descarregar mais rápido hoje!",
  "🍕 *SEM IFOOD*: Seus próximos 3 pedidos de comida vão vir errados!",
  "🎤 *DESAFINADO*: Vai desafinar em qualquer música que cantar hoje!",
  "😴 *SONO*: Vai sentir sono no pior momento possível hoje!",
  "🪑 *MÓVEL*: Virou oficialmente um móvel do grupo!",
];

export default {
  name: "feitico",
  description: "Lança um feitiço de verdade ou desafio 🪄",
  commands: ["feitico", "feitico", "verdade", "desafio"],
  usage: `${PREFIX}feitico @user\n${PREFIX}verdade @user\n${PREFIX}desafio @user`,

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

      const action = args[0]?.toLowerCase();
      const alvoNum = limparNumero(args[1] || args[0]);

      if (!alvoNum || alvoNum.length < 5) {
        return sendReply("❌ Marque alguém!\nEx: `/verdade @joao`");
      }

      let nomeAlvo = alvoNum;
      try {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id.includes(alvoNum));
        if (p) nomeAlvo = p.notify || p.name || alvoNum;
      } catch (e) {}

      const seed = (alvoNum + Date.now().toString()).split("").reduce((a, b) => a + parseInt(b || "0"), 0);

      if (action === "verdade") {
        const verdade = VERDADES[seed % VERDADES.length];
        const maldicao = MALDICOES[seed % MALDICOES.length];
        await sendSuccessReact();
        return sendReply(
          `🪄 *FEITIÇO DA VERDADE!*\n\n` +
          `👤 *Alvo:* @${nomeAlvo}\n` +
          `🧙‍♂️ *Lançado por:* @${userLid.split("@")[0]}\n\n` +
          `❓ *PERGUNTA:* ${verdade}\n\n` +
          `⚠️ Se não responder...\n💀 *MALDIÇÃO:* ${maldicao}`
        );
      }

      if (action === "desafio") {
        const desafio = DESAFIOS[seed % DESAFIOS.length];
        const maldicao = MALDICOES[seed % MALDICOES.length];
        await sendSuccessReact();
        return sendReply(
          `🪄 *FEITIÇO DO DESAFIO!*\n\n` +
          `👤 *Alvo:* @${nomeAlvo}\n` +
          `🧙‍♂️ *Lançado por:* @${userLid.split("@")[0]}\n\n` +
          `🎯 *DESAFIO:* ${desafio}\n\n` +
          `⚠️ Se não completar...\n💀 *MALDIÇÃO:* ${maldicao}`
        );
      }

      if (seed % 2 === 0) {
        const verdade = VERDADES[seed % VERDADES.length];
        const maldicao = MALDICOES[seed % MALDICOES.length];
        await sendSuccessReact();
        return sendReply(
          `🪄 *FEITIÇO DA VERDADE!*\n\n` +
          `👤 *Alvo:* @${nomeAlvo}\n` +
          `🧙‍♂️ *Lançado por:* @${userLid.split("@")[0]}\n\n` +
          `❓ *PERGUNTA:* ${verdade}\n\n` +
          `⚠️ Se não responder...\n💀 *MALDIÇÃO:* ${maldicao}`
        );
      } else {
        const desafio = DESAFIOS[seed % DESAFIOS.length];
        const maldicao = MALDICOES[seed % MALDICOES.length];
        await sendSuccessReact();
        return sendReply(
          `🪄 *FEITIÇO DO DESAFIO!*\n\n` +
          `👤 *Alvo:* @${nomeAlvo}\n` +
          `🧙‍♂️ *Lançado por:* @${userLid.split("@")[0]}\n\n` +
          `🎯 *DESAFIO:* ${desafio}\n\n` +
          `⚠️ Se não completar...\n💀 *MALDIÇÃO:* ${maldicao}`
        );
      }

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};