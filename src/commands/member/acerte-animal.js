import fs from "fs";
import path from "path";

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

import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const animais = [
  { dica: "🐾 Tenho 4 patas, lato e sou o melhor amigo do homem", resposta: "cachorro" },
  { dica: "🐾 Tenho 7 vidas, mio e adoro caçar ratos", resposta: "gato" },
  { dica: "🐾 Sou enorme, tenho tromba e nunca esqueço", resposta: "elefante" },
  { dica: "🐾 Sou o rei da selva, tenho juba", resposta: "leao" },
  { dica: "🐾 Vivo no gelo, não voo mas nado bem", resposta: "pinguim" },
  { dica: "🐾 Tenho pescoço longo e manchas", resposta: "girafa" },
  { dica: "🐾 Vivo no mar, sou inteligente e salto ondas", resposta: "golfinho" },
  { dica: "🐾 Vivo na Austrália, pulo e tenho bolsa na barriga", resposta: "canguru" },
  { dica: "🐾 Rastejo, não tenho patas e troco de pele", resposta: "cobra" },
  { dica: "🐾 Voo à noite, tenho olhos grandes e sou sábia", resposta: "coruja" },
  { dica: "🐾 Sou preto e branco, pareço um urso mas não sou, como bambu", resposta: "panda" },
  { dica: "🐾 Tenho listras pretas e brancas, pareço um cavalo", resposta: "zebra" },
  { dica: "🐾 Sou rosa, gorda e adoro lama", resposta: "porco" },
  { dica: "🐾 Produzo mel e pico quando me irrito", resposta: "abelha" },
  { dica: "🐾 Tenho 8 braços, jogo tinta e sou inteligente", resposta: "polvo" },
  { dica: "🐾 Sou cinza, vivo em rios e tenho um sorriso enorme cheio de dentes", resposta: "hipopotamo" },
  { dica: "🐾 Sou laranja com listras pretas, o maior felino do mundo", resposta: "tigre" },
  { dica: "🐾 Sou lento, tenho casco e posso viver mais de 100 anos", resposta: "tartaruga" },
  { dica: "🐾 Voo e não sou pássaro, durmo de cabeça pra baixo", resposta: "morcego" },
  { dica: "🐾 Sou pequeno, vermelho com bolinhas pretas, dou sorte", resposta: "joaninha" },
  { dica: "🐾 Sou roedor, tenho espinhos e pareço um ouriço", resposta: "porcoespinho" },
  { dica: "🐾 Sou gigante, cinza, tenho um chifre na cara", resposta: "rinoceronte" },
  { dica: "🐾 Vivo na água e na terra, coaxo e tenho língua comprida", resposta: "sapo" },
  { dica: "🐾 Sou colorido, falo igual gente e vivo em florestas tropicais", resposta: "papagaio" },
  { dica: "🐾 Sou enorme, azul, vivo no oceano e canto", resposta: "baleia" },
  { dica: "🐾 Sou branco, peludo, vivo no Polo Norte e caço focas", resposta: "ursopolar" },
  { dica: "🐾 Sou o animal mais rápido do mundo, tenho pintas e corro", resposta: "guepardo" },
  { dica: "🐾 Pareço uma lagartixa, mas mudo de cor para me camuflar", resposta: "camaleao" },
  { dica: "🐾 Sou um inseto que produz luz e brilha à noite", resposta: "vaga-lume" },
  { dica: "🐾 Tenho pescoço comprido, manchas marrons e como folhas altas", resposta: "girafa" },
  { dica: "🐾 Sou o maior animal terrestre, tenho tromba e orelhas enormes", resposta: "elefante" },
  { dica: "🐾 Sou marsupial, pulo e carrego meu filhote na bolsa", resposta: "canguru" },
  { dica: "🐾 Não tenho pernas, rastejo, posso ser venenosa e assusto gente", resposta: "cobra" },
  { dica: "🐾 Sou ave que não voa, corro rápido e vivo na África", resposta: "avestruz" },
  { dica: "🐾 Sou noturno, tenho olhos grandes, garras afiadas e canto à noite", resposta: "coruja" },
  { dica: "🐾 Sou preto e branco, vivo na China, pareço um urso de pelúcia", resposta: "panda" },
  { dica: "🐾 Sou listrado, cavalo selvagem africano que ninguém monta", resposta: "zebra" },
  { dica: "🐾 Sou cor de rosa, gordinho, adoro chafurdar na lama", resposta: "porco" },
  { dica: "🐾 Sou minúscula, trabalho em equipe, carrego folhas enormes", resposta: "formiga" },
  { dica: "🐾 Tenho tentáculos, solto tinta preta e sou o bicho mais esperto do oceano", resposta: "polvo" },
  { dica: "🐾 Sou roedor, tenho cauda longa, roo tudo e vivo em esgotos", resposta: "rato" },
  { dica: "🐾 Sou réptil, tenho dentes afiados, vivo em rios e pântanos", resposta: "jacare" },
  { dica: "🐾 Sou felino, tenho pintas, subo em árvores e sou ágil", resposta: "onca" },
  { dica: "🐾 Sou inseto colorido, nasci lagarta e agora tenho asas lindas", resposta: "borboleta" },
  { dica: "🐾 Sou pássaro pequeno, canto de manhã e acordo todo mundo", resposta: "galo" },
  { dica: "🐾 Sou aquático, tenho nadadeiras, como peixes e brinco com bolas", resposta: "foca" },
];

const jogos = {};
const tentativas = {};

export default {
  name: "acerte-animal",
  description: "Jogo de adivinhar o animal pela dica.",
  commands: ["acerteanimal", "animal", "adivinhaanimal"],
  usage: `${PREFIX}animal\n${PREFIX}animal chutar | resposta\n${PREFIX}animal dica\n${PREFIX}animal desistir`,

  handle: async ({ args, remoteJid, userLid, socket, sendReply, sendErrorReply }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const action = args[0]?.toLowerCase();
      const gameKey = remoteJid;

      // Iniciar novo jogo
      if (!action || action === "jogar" || action === "novo") {
        const animal = animais[Math.floor(Math.random() * animais.length)];
        jogos[gameKey] = { ...animal, ativo: true, tentativas: 0 };
        tentativas[gameKey] = 3;
        return sendReply(
          `🐾 *ACERTE O ANIMAL!*\n\n` +
          `📝 *Dica:* ${animal.dica}\n\n` +
          `🎯 Você tem *3 tentativas*!\n` +
          `Digite: \`${PREFIX}animal chutar | resposta\`\n` +
          `💡 Use \`${PREFIX}animal dica\` para mais pistas (custa 1 tentativa)`
        );
      }

      // Desistir
      if (action === "desistir" || action === "surrender") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo ativo!");
        const resp = jogo.resposta;
        delete jogos[gameKey];
        delete tentativas[gameKey];
        return sendReply(`😢 Você desistiu!\nO animal era: *${resp}*`);
      }

      // Pedir dica extra
      if (action === "dica" || action === "hint") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo ativo! Use `" + PREFIX + "animal`");
        if (!jogo.ativo) return sendReply("Jogo já acabou!");

        tentativas[gameKey]--;
        jogo.tentativas++;

        if (tentativas[gameKey] <= 0) {
          delete jogos[gameKey];
          delete tentativas[gameKey];
          return sendReply(`💀 *Acabaram suas tentativas!*\nO animal era: *${jogo.resposta}*`);
        }

        // Revela uma letra
        const letrasNaoReveladas = jogo.resposta.split("").filter((l, i, arr) => arr.indexOf(l) === i);
        const letra = letrasNaoReveladas[Math.floor(Math.random() * letrasNaoReveladas.length)];
        const mascara = jogo.resposta.split("").map(l => l === letra ? l : "_").join(" ");

        return sendReply(
          `💡 *DICA EXTRA!*\n\n` +
          `🔤 Letra revelada: *${letra}*\n` +
          `📝 ${mascara}\n` +
          `🎯 Tentativas restantes: *${tentativas[gameKey]}*`
        );
      }

      // Chutar
      if (action === "chutar" || action === "chute") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo ativo! Use `" + PREFIX + "animal`");
        if (!jogo.ativo) return sendReply("Jogo já acabou!");

        const chute = args.slice(1).join(" ").toLowerCase().trim();
        if (!chute) return sendReply("Digite um animal!");

        if (chute === jogo.resposta) {
          const pontos = 100 - (jogo.tentativas * 20);
          delete jogos[gameKey];
          delete tentativas[gameKey];
          return sendReply(
            `🎉 *PARABÉNS! VOCÊ ACERTOU!*\n\n` +
            `🐾 O animal é: *${jogo.resposta}*!\n` +
            `⭐ Pontuação: *${pontos}* pontos`
          );
        }

        tentativas[gameKey]--;
        jogo.tentativas++;

        if (tentativas[gameKey] <= 0) {
          const resp = jogo.resposta;
          delete jogos[gameKey];
          delete tentativas[gameKey];
          return sendReply(
            `💀 *GAME OVER!*\n\n` +
            `Acabaram suas tentativas!\n` +
            `O animal era: *${resp}*`
          );
        }

        // Dica extra no erro
        const nome = jogo.resposta;
        const primeiraLetra = nome[0];
        const ultimaLetra = nome[nome.length - 1];
        const tamanho = nome.length;

        return sendReply(
          `❌ *ERROU!*\n\n` +
          `📝 *Dica:* ${jogo.dica}\n` +
          `🔤 Começa com: *${primeiraLetra}*\n` +
          `🔤 Termina com: *${ultimaLetra}*\n` +
          `📏 Letras: *${tamanho}*\n` +
          `🎯 Tentativas restantes: *${tentativas[gameKey]}*\n\n` +
          `Use \`${PREFIX}animal dica\` para revelar letras!`
        );
      }

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};