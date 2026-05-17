import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const palavras = [
  "ELEFANTE","BANANA","COMPUTADOR","JAVASCRIPT","WHATSAPP",
  "TELEFONE","CACHORRO","GIRASSOL","BICICLETA","CHOCOLATE",
  "FUTEBOL","PRAIA","GUITARRA","ESTRELA","CARNAVAL"
];

const jogos = {};

export default {
  name: "forca",
  description: "Jogo da Forca.",
  commands: ["forca"],
  usage: `${PREFIX}forca iniciar\n${PREFIX}forca letra\n${PREFIX}forca chutar | palavra`,

  handle: async ({
    args,
    remoteJid,
    sendReply,
    sendErrorReply,
  }) => {
    const action = args[0]?.toLowerCase();
    const gameKey = remoteJid;

    if (!action || action === "status") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Nenhum jogo em andamento! Use `" + PREFIX + "forca iniciar`.");
      return sendReply(formatarForca(jogo));
    }

    if (action === "iniciar" || action === "novo") {
      const palavra = palavras[Math.floor(Math.random() * palavras.length)];
      jogos[gameKey] = {
        palavra,
        letrasUsadas: [],
        erros: 0,
        maxErros: 6,
        ativo: true
      };
      return sendReply("🎮 *Jogo da Forca*\n\n" + formatarForca(jogos[gameKey]));
    }

    if (action === "letra" || action === "l") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
      if (!jogo.ativo) return sendReply("Jogo já acabou!");

      const letra = args[1]?.toUpperCase();
      if (!letra || letra.length !== 1) throw new InvalidParameterError("Digite UMA letra!\nEx: `" + PREFIX + "forca l a`");

      if (jogo.letrasUsadas.includes(letra)) return sendReply("Letra já usada!");

      jogo.letrasUsadas.push(letra);

      if (!jogo.palavra.includes(letra)) {
        jogo.erros++;
        if (jogo.erros >= jogo.maxErros) {
          jogo.ativo = false;
          return sendReply(`💀 *VOCÊ PERDEU!*\n\n${formatarForca(jogo)}\n\nA palavra era: *${jogo.palavra}*`);
        }
      }

      // Verificar se ganhou
      const acertouTodas = jogo.palavra.split("").every(l => jogo.letrasUsadas.includes(l));
      if (acertouTodas) {
        jogo.ativo = false;
        return sendReply(`🎉 *PARABÉNS!*\n\n${formatarForca(jogo)}\n\nPalavra: *${jogo.palavra}* 🏆`);
      }

      return sendReply(formatarForca(jogo));
    }

    if (action === "chutar" || action === "chute") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");

      const chute = args.slice(1).join("").toUpperCase();
      if (!chute) throw new InvalidParameterError("Digite uma palavra!");

      if (chute === jogo.palavra) {
        jogo.ativo = false;
        return sendReply(`🎉 *PARABÉNS!*\n\nPalavra: *${jogo.palavra}* 🏆`);
      } else {
        jogo.erros = jogo.maxErros;
        jogo.ativo = false;
        return sendReply(`💀 *ERROU!*\n\nA palavra era: *${jogo.palavra}*`);
      }
    }
  },
};

function formatarForca(jogo) {
  const boneco = [
    "  😊",
    "  😟\n  O",
    "  😰\n  O\n  |",
    "  😨\n  O\n /|",
    "  😱\n  O\n /|\\",
    "  💀\n  O\n /|\\\n /",
    "  💀\n  O\n /|\\\n / \\",
  ];

  const palavraEscondida = jogo.palavra
    .split("")
    .map(l => jogo.letrasUsadas.includes(l) ? l : "_")
    .join(" ");

  return (
    `${boneco[Math.min(jogo.erros, 6)]}\n\n` +
    `📝 ${palavraEscondida}\n\n` +
    `🔤 Letras: ${jogo.letrasUsadas.join(" ") || "Nenhuma"}\n` +
    `❌ Erros: ${jogo.erros}/${jogo.maxErros}`
  );
}