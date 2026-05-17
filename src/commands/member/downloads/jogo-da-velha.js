import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const jogos = {};

export default {
  name: "jogo-da-velha",
  description: "Jogo da velha multiplayer no grupo.",
  commands: ["jogodavelha", "velha", "tictactoe", "ttt"],
  usage: `${PREFIX}jogodavelha | @jogador\n${PREFIX}jogodavelha jogar | posição\n${PREFIX}jogodavelha tabuleiro`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    const action = args[0]?.toLowerCase();
    const gameKey = remoteJid;

    // Mostrar tabuleiro
    if (!action || action === "tabuleiro" || action === "status") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("❌ Nenhum jogo em andamento!\nUse `" + PREFIX + "jogodavelha @jogador` para iniciar.");
      return sendReply(formatarTabuleiro(jogo));
    }

    // Iniciar novo jogo
    if (action === "novo" || action === "start" || action === "iniciar") {
      const player2 = args[1];
      if (!player2) throw new InvalidParameterError("Marque um jogador!\nEx: `" + PREFIX + "jogodavelha @jogador`");

      jogos[gameKey] = {
        tabuleiro: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
        jogador1: userLid,
        jogador2: player2.replace("@", "").trim() + "@lid",
        vez: userLid,
        simbolo: "❌",
        ativo: true
      };

      return sendReply(
        `🎮 *Jogo da Velha*\n\n` +
        `${formatarTabuleiro(jogos[gameKey])}\n\n` +
        `❌ ${userLid.split("@")[0]} vs ⭕ ${player2.replace("@", "").trim()}\n` +
        `Vez de: @${userLid.split("@")[0]}`
      );
    }

    // Jogar
    if (action === "jogar" || action === "play" || action === "p") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("❌ Nenhum jogo em andamento!\nUse `" + PREFIX + "jogodavelha @jogador` para iniciar.");
      if (!jogo.ativo) return sendReply("❌ Este jogo já acabou!");
      if (jogo.vez !== userLid) return sendReply("❌ Não é sua vez!");

      const posicao = parseInt(args[1]) - 1;
      if (isNaN(posicao) || posicao < 0 || posicao > 8) throw new InvalidParameterError("Escolha uma posição de 1 a 9!");
      if (jogo.tabuleiro[posicao] === "❌" || jogo.tabuleiro[posicao] === "⭕") return sendReply("❌ Posição ocupada!");

      jogo.tabuleiro[posicao] = jogo.simbolo;

      // Verificar vitória
      const vitoria = verificarVitoria(jogo.tabuleiro);
      if (vitoria) {
        jogo.ativo = false;
        return sendReply(
          `🎉 *VITÓRIA!*\n\n${formatarTabuleiro(jogo)}\n\n` +
          `${jogo.simbolo} @${userLid.split("@")[0]} venceu! 🏆`
        );
      }

      // Verificar velha
      if (jogo.tabuleiro.every(c => c === "❌" || c === "⭕")) {
        jogo.ativo = false;
        return sendReply(`🤝 *VELHA!*\n\n${formatarTabuleiro(jogo)}\n\nEmpate!`);
      }

      // Passar vez
      jogo.vez = jogo.vez === jogo.jogador1 ? jogo.jogador2 : jogo.jogador1;
      jogo.simbolo = jogo.simbolo === "❌" ? "⭕" : "❌";

      return sendReply(
        `${formatarTabuleiro(jogo)}\n\n` +
        `Vez de: @${jogo.vez.split("@")[0]} (${jogo.simbolo})`
      );
    }

    throw new InvalidParameterError("Use: `" + PREFIX + "jogodavelha @jogador` ou `" + PREFIX + "jogodavelha jogar 1`");
  },
};

function formatarTabuleiro(jogo) {
  const t = jogo.tabuleiro;
  return `\n${t[0]} ${t[1]} ${t[2]}\n${t[3]} ${t[4]} ${t[5]}\n${t[6]} ${t[7]} ${t[8]}`;
}

function verificarVitoria(tab) {
  const v = [
    [0,1,2],[3,4,5],[6,7,8], // linhas
    [0,3,6],[1,4,7],[2,5,8], // colunas
    [0,4,8],[2,4,6]          // diagonais
  ];
  return v.some(([a,b,c]) => tab[a] === tab[b] && tab[b] === tab[c]);
}