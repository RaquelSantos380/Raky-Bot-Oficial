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

const jogos = {};

export default {
  name: "jogo-da-velha",
  description: "Jogo da velha multiplayer no grupo.",
  commands: ["jogodavelha", "velha", "ttt"],
  usage: `${PREFIX}velha\n${PREFIX}velha jogar | posição`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
    sendErrorReply,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const groupMetadata = await socket.groupMetadata(remoteJid);
        const participant = groupMetadata.participants.find(p => p.id === userLid);
        const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        if (!isAdmin) {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const action = args[0]?.toLowerCase();
      const gameKey = remoteJid;

      if (!action) {
        const jogo = jogos[gameKey];
        if (jogo) return sendReply(formatarTabuleiro(jogo) + `\n\nVez de: @${jogo.vez.split("@")[0]} (${jogo.simbolo})`);

        jogos[gameKey] = {
          tabuleiro: ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"],
          jogador1: userLid,
          jogador2: null,
          vez: userLid,
          simbolo: "❌",
          ativo: true
        };

        return sendReply(
          `🎮 *Jogo da Velha*\n\n` +
          `${formatarTabuleiro(jogos[gameKey])}\n\n` +
          `❌ @${userLid.split("@")[0]} iniciou o jogo!\n` +
          `⭕ Alguém digite \`${PREFIX}velha entrar\` para jogar!`
        );
      }

      if (action === "entrar") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo! Use `/velha` para iniciar.");
        if (jogo.jogador2) return sendReply("Jogo já tem 2 jogadores!");
        if (jogo.jogador1 === userLid) return sendReply("Você já é o jogador 1!");

        jogo.jogador2 = userLid;
        return sendReply(
          `${formatarTabuleiro(jogo)}\n\n` +
          `❌ @${jogo.jogador1.split("@")[0]} vs ⭕ @${jogo.jogador2.split("@")[0]}\n` +
          `Vez de: @${jogo.vez.split("@")[0]} (${jogo.simbolo})`
        );
      }

      if (action === "jogar" || action === "j") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo! Use `/velha` para iniciar.");
        if (!jogo.jogador2) return sendReply("Esperando oponente! Digite `/velha entrar`");
        if (!jogo.ativo) return sendReply("Jogo já acabou!");
        if (jogo.vez !== userLid) return sendReply("Não é sua vez!");

        const posicao = parseInt(args[1]) - 1;
        if (isNaN(posicao) || posicao < 0 || posicao > 8) return sendReply("Escolha 1 a 9!");

        if (jogo.tabuleiro[posicao] === "❌" || jogo.tabuleiro[posicao] === "⭕") return sendReply("Ocupado!");

        jogo.tabuleiro[posicao] = jogo.simbolo;

        if (verificarVitoria(jogo.tabuleiro)) {
          jogo.ativo = false;
          return sendReply(`🎉 *VITÓRIA!*\n${formatarTabuleiro(jogo)}\n\n${jogo.simbolo} @${userLid.split("@")[0]} venceu! 🏆`);
        }

        if (jogo.tabuleiro.every(c => c === "❌" || c === "⭕")) {
          jogo.ativo = false;
          return sendReply(`🤝 *VELHA!*\n${formatarTabuleiro(jogo)}\nEmpate!`);
        }

        jogo.vez = jogo.vez === jogo.jogador1 ? jogo.jogador2 : jogo.jogador1;
        jogo.simbolo = jogo.simbolo === "❌" ? "⭕" : "❌";

        return sendReply(`${formatarTabuleiro(jogo)}\n\nVez: @${jogo.vez.split("@")[0]} (${jogo.simbolo})`);
      }

      return sendReply("Use: `/velha` para iniciar, `/velha entrar` para jogar, `/velha jogar | 1`");
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};

function formatarTabuleiro(jogo) {
  const t = jogo.tabuleiro;
  return `\n${t[0]} ${t[1]} ${t[2]}\n${t[3]} ${t[4]} ${t[5]}\n${t[6]} ${t[7]} ${t[8]}`;
}

function verificarVitoria(tab) {
  const v = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return v.some(([a,b,c]) => tab[a] === tab[b] && tab[b] === tab[c]);
}