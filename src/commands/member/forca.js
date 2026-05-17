import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const palavras = [
  // Animais
  "ELEFANTE", "CACHORRO", "GIRASSOL", "PINGUIM", "GOLFINHO",
  "BORBOLETA", "TARTARUGA", "CANGURU", "ARANHA", "JACARE",
  // Frutas
  "BANANA", "ABACAXI", "MORANGO", "LARANJA", "MELANCIA",
  "UVA", "MANGA", "ACEROLA", "JABUTICABA", "MARACUJA",
  // Objetos
  "COMPUTADOR", "TELEFONE", "BICICLETA", "GUITARRA", "TESOURA",
  "LAMPADA", "CADERNO", "CANETA", "ESPELHO", "RELÓGIO",
  // Lugares
  "PRAIA", "FUTEBOL", "CARNAVAL", "SHOPPING", "BIBLIOTECA",
  "ESCOLA", "HOSPITAL", "CINEMA", "IGREJA", "RESTAURANTE",
  // Profissões
  "PROFESSOR", "MEDICO", "BOMBEIRO", "POLICIAL", "ENGENHEIRO",
  "ADVOGADO", "DENTISTA", "JORNALISTA", "COZINHEIRO", "PINTOR",
  // Tecnologia
  "WHATSAPP", "JAVASCRIPT", "INTERNET", "CELULAR", "YOUTUBE",
  "GOOGLE", "INSTAGRAM", "FACEBOOK", "ROBLOX", "TIKTOK",
  // Alimentos
  "CHOCOLATE", "PIZZA", "HAMBURGUER", "PASTEL", "SORVETE",
  "PIPOCA", "BOLACHA", "MACARRÃO", "FEIJOADA", "CHURRASCO",
  // Esportes
  "BASQUETE", "VOLEIBOL", "NATAÇÃO", "TÊNIS", "CORRIDA",
  "CICLISMO", "SURFE", "SKATE", "BOXE", "JUDÔ",
  // Verbos
  "ESTUDAR", "TRABALHAR", "DORMIR", "CANTAR", "DANÇAR",
  "PULAR", "CORRER", "NADAR", "VOAR", "SONHAR",
  // Natureza
  "ESTRELA", "FLORESTA", "MONTANHA", "VULCÃO", "CACHOEIRA",
  "TEMPESTADE", "ARCOÍRIS", "RELÂMPAGO", "TSUNAMI", "TERREMOTO",
];

const DICAS = {
  // Animais
  "ELEFANTE": "Maior animal terrestre, tem tromba e presas",
  "CACHORRO": "Melhor amigo do homem, late e abana o rabo",
  "PINGUIM": "Ave que não voa, vive no gelo e usa smoking",
  "GOLFINHO": "Mamífero marinho inteligente que salta ondas",
  "BORBOLETA": "Inseto colorido que nasce da lagarta",
  "TARTARUGA": "Réptil com casco, anda devagar e vive muito",
  "CANGURU": "Animal da Austrália que pula e carrega filhote na bolsa",
  "ARANHA": "Tem 8 patas, faz teia e às vezes assusta",
  "JACARE": "Réptil grande que vive em rios, tem dentes afiados",
  // Frutas
  "BANANA": "Fruta amarela que macaco adora",
  "ABACAXI": "Fruta com coroa, ácida e espinhosa por fora",
  "MORANGO": "Fruta vermelha pequena com pintinhas",
  "LARANJA": "Fruta cítrica que faz suco e tem vitamina C",
  "MELANCIA": "Fruta verde por fora, vermelha por dentro, enorme",
  "UVA": "Fruta pequena em cachos, vira vinho",
  "MANGA": "Fruta tropical amarela, doce e suculenta",
  "JABUTICABA": "Fruta brasileira que nasce no tronco da árvore",
  "MARACUJA": "Fruta azedinha que acalma, tem casca enrugada",
  // Objetos
  "COMPUTADOR": "Máquina que usamos para programar e navegar",
  "TELEFONE": "Aparelho que usamos para ligar e mandar mensagem",
  "BICICLETA": "Veículo de duas rodas movido a pedal",
  "GUITARRA": "Instrumento de cordas que faz rock",
  "TESOURA": "Objeto cortante de duas lâminas",
  "LAMPADA": "Ilumina o ambiente quando acionada",
  "CADERNO": "Tem folhas, usamos para escrever",
  "CANETA": "Objeto que escreve com tinta",
  "ESPELHO": "Reflete nossa imagem",
  "RELOGIO": "Mostra as horas",
  // ... (adicione mais dicas conforme quiser)
};

function getDica(palavra) {
  return DICAS[palavra] || `Palavra de ${palavra.length} letras...`;
}

const jogos = {};

export default {
  name: "forca",
  description: "Jogo da Forca com dicas.",
  commands: ["forca"],
  usage: `${PREFIX}forca iniciar\n${PREFIX}forca dica\n${PREFIX}forca l <letra>\n${PREFIX}forca chutar <palavra>`,

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
        dica: getDica(palavra),
        letrasUsadas: [],
        erros: 0,
        maxErros: 6,
        ativo: true,
        dicasUsadas: 0,
      };
      return sendReply("🎮 *Jogo da Forca*\n\n" + formatarForca(jogos[gameKey]));
    }

    // NOVO: Comando de dica
    if (action === "dica" || action === "hint") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
      if (!jogo.ativo) return sendReply("Jogo já acabou!");

      jogo.dicasUsadas++;

      if (jogo.dicasUsadas >= 3) {
        return sendReply("❌ Você já usou todas as dicas (3)!");
      }

      // Revela uma letra aleatória ainda não descoberta
      const naoDescobertas = jogo.palavra
        .split("")
        .filter(l => !jogo.letrasUsadas.includes(l))
        .filter((l, i, arr) => arr.indexOf(l) === i); // letras únicas

      if (naoDescobertas.length === 0) {
        return sendReply("Todas as letras já foram descobertas! Tente chutar a palavra!");
      }

      const letraRevelada = naoDescobertas[Math.floor(Math.random() * naoDescobertas.length)];
      jogo.letrasUsadas.push(letraRevelada);

      // Verificar se ganhou
      const acertouTodas = jogo.palavra.split("").every(l => jogo.letrasUsadas.includes(l));
      if (acertouTodas) {
        jogo.ativo = false;
        return sendReply(`🎉 *PARABÉNS!*\n\n${formatarForca(jogo)}\n\nPalavra: *${jogo.palavra}* 🏆`);
      }

      return sendReply(
        `💡 *DICA (${jogo.dicasUsadas}/3)*\n\n` +
        `🔍 Letra revelada: *${letraRevelada}*\n` +
        `📝 ${jogo.dica}\n\n` +
        formatarForca(jogo)
      );
    }

    if (action === "letra" || action === "l") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
      if (!jogo.ativo) return sendReply("Jogo já acabou!");

      const letra = args[1]?.toUpperCase();
      if (!letra || letra.length !== 1) throw new InvalidParameterError("Digite UMA letra!\nEx: `" + PREFIX + "forca l a`");

      if (jogo.letrasUsadas.includes(letra)) return sendReply("❌ Letra já usada!");

      jogo.letrasUsadas.push(letra);

      if (!jogo.palavra.includes(letra)) {
        jogo.erros++;
        if (jogo.erros >= jogo.maxErros) {
          jogo.ativo = false;
          return sendReply(`💀 *VOCÊ PERDEU!*\n\n${formatarForca(jogo)}\n\nA palavra era: *${jogo.palavra}*`);
        }
        return sendReply(`❌ Letra "${letra}" não encontrada!\n\n${formatarForca(jogo)}`);
      }

      const acertouTodas = jogo.palavra.split("").every(l => jogo.letrasUsadas.includes(l));
      if (acertouTodas) {
        jogo.ativo = false;
        return sendReply(`🎉 *PARABÉNS!*\n\n${formatarForca(jogo)}\n\nPalavra: *${jogo.palavra}* 🏆`);
      }

      return sendReply(`✅ Letra "${letra}" encontrada!\n\n${formatarForca(jogo)}`);
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

    throw new InvalidParameterError("Use: `" + PREFIX + "forca iniciar`, `" + PREFIX + "forca dica`, `" + PREFIX + "forca l a`");
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
    `💡 ${jogo.dica}\n` +
    `🔤 Letras: ${jogo.letrasUsadas.join(" ") || "Nenhuma"}\n` +
    `❌ Erros: ${jogo.erros}/${jogo.maxErros} | 💡 Dicas: ${jogo.dicasUsadas}/3`
  );
}
